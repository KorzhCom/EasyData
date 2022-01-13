using System;
using System.Linq;
using System.Reflection;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace EasyData.EntityFrameworkCore
{
    /// <summary>
    /// Retrieves DB metadata from a DbContext object and fills the structures of <see cref="MetaData"/> instance.
    /// </summary>
    public class DbContextMetaDataLoader
    {
        private IDictionary<Type, int> _dbSetTypes = new Dictionary<Type, int>();

        protected readonly Dictionary<IEntityType, MetaEntity> EntityTypeEntities 
                                            = new Dictionary<IEntityType, MetaEntity>();

        protected readonly DbContextMetaDataLoaderOptions Options;
        protected readonly DbContext DbContext;
        protected readonly MetaData Model;

        /// <summary>
        /// Initializes a new instance of the <see cref="DbContextMetaDataLoader"/> class.
        /// </summary>
        /// <param name="dbContext">The DbContext to get metadata from.</param>
        /// <param name="model">The MetaData object to save metadata to.</param>
        public DbContextMetaDataLoader(DbContext dbContext, MetaData model)
            : this(dbContext, model, new DbContextMetaDataLoaderOptions())
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="DbContextMetaDataLoader"/> class.
        /// </summary>
        /// <param name="dbContext">The DbContext to get metadata from.</param>
        /// <param name="model">The MetaData object to save metadata to.</param>
        /// <param name="options">The loader option. You can define here which model and/or properties should be skipped, 
        /// what names the will have, what display formats to use and so on.
        /// </param>
        public DbContextMetaDataLoader(DbContext dbContext, MetaData model, DbContextMetaDataLoaderOptions options)
        {
            DbContext = dbContext;
            Model = model;
            Options = options;
        }

        /// <summary>
        /// Gets the entity types filtered acording to EntitFilters list defined in <see cref="Options"/>
        /// </summary>
        /// <returns>IEnumerable&lt;IEntityType&gt;.</returns>
        protected IEnumerable<IEntityType> GetEntityTypes()
        {   
            return DbContext.Model.GetEntityTypes()
               .Where(ApplyEntityFilters);
        }

        private IDictionary<Type, int> GetDbContextTypes()
        {
            var dbSetProps = DbContext.GetType()
                    .GetProperties()
                    .Where(p => p.PropertyType.IsGenericType
                        && typeof(DbSet<>).IsAssignableFrom(p.PropertyType.GetGenericTypeDefinition()));

            var result = new Dictionary<Type, int>();
            int idx = 0;
            foreach (var prop in dbSetProps) {
                var entType = prop.PropertyType.GetGenericArguments()[0];
                if (!result.ContainsKey(entType)) { 
                    result.Add(entType, idx++);
                }
            }
            return result;
        }

        /// <summary>
        /// Applies the entity filters.
        /// </summary>
        /// <param name="entityType">An instance of <see cref="IEntityType"/> that defines the entity.</param>
        /// <returns><c>true</c> if the entity passes the filters, <c>false</c> otherwise.</returns>
        protected virtual bool ApplyEntityFilters(IEntityType entityType)
        {
            if (!_dbSetTypes.TryGetValue(entityType.ClrType, out _)) {
                return false;
            }

            foreach (var filter in Options.EntityFilters) {
                if (!filter.Invoke(entityType)) {
                    return false;
                }
            }

            return true;
        }


        /// <summary>
        /// Gets the entity properties filtered according to the PropertyFilters list defined in <see cref="Options"/>.
        /// </summary>
        /// <param name="entityType">An instance of <see cref="IEntityType"/> that represents the entity.</param>
        /// <returns>IEnumerable&lt;IProperty&gt;.</returns>
        protected virtual IEnumerable<IProperty> GetEntityProperties(IEntityType entityType)
        {
            return entityType.GetProperties()
                    .Where(ApplyPropertyFilters);
        }

        /// <summary>
        /// Applies the property filters.
        /// </summary>
        /// <param name="property">An instance of <see cref="IProperty"/> that represents the property.</param>
        /// <returns><c>true</c> if the property passes the filters, <c>false</c> otherwise.</returns>
        protected virtual bool ApplyPropertyFilters(IProperty property)
        {
            foreach (var filter in Options.PropertyFilters) {
                if (!filter.Invoke(property)) {
                    return false;
                }
            }

            return true;
        }

        /// <summary>
        /// Loads metadata from a DbContext object and stores them into a <see cref="MetaData"/> instance passed in the constructor
        /// </summary>
        public virtual void LoadFromDbContext()
        {
            _dbSetTypes = GetDbContextTypes();

            var entityTypes = GetEntityTypes();

            if (Options.KeepDbSetDeclarationOrder) {
                // EF Core keeps information about entity types 
                // in alphabetical order.
                // To make it possible to keep the original order
                // we reoder the list of entities according to the orer of DbSets

                entityTypes = entityTypes.OrderBy(t => 
                    _dbSetTypes.TryGetValue(t.ClrType, out var index) ? index : int.MaxValue);
            }

            foreach (var entityType in entityTypes) {
                var entity = ProcessEntityType(entityType);
                if (entity is null)
                    continue;

                entity.Attributes.Reorder();
                entity.SubEntities.Reorder();

                Model.EntityRoot.SubEntities.Add(entity);

                EntityTypeEntities[entityType] = entity;
            }

            foreach (var entityType in entityTypes) {
                if (EntityTypeEntities.TryGetValue(entityType, out var entity)) {
                    var navigations = entityType.GetNavigations();

                    int attrCount = entity.Attributes
                        .Select(attr => attr.Index)
                        .DefaultIfEmpty(0).Max() + 1;

                    foreach (var navigation in navigations) {
                        ProcessNavigationProperty(entity, entityType, navigation, ref attrCount);
                    }
                }
            }

            if (Options.ModelCustomizer != null) {
                var customizer = new MetadataCustomizer(Model);
                Options.ModelCustomizer.Invoke(customizer);
            }

            Model.EntityRoot.Attributes.Reorder();
            Model.EntityRoot.SubEntities.Reorder();
        }

        /// <summary>
        /// Gets the entity ID by <see cref="IEntityType"/>.
        /// </summary>
        /// <param name="entityType">An instance of <see cref="IEntityType"/> that represents the entity.</param>
        /// <returns>System.String.</returns>
        protected virtual string GetEntityId(IEntityType entityType)
        {
            var entityName = Utils.GetEntityName(entityType);
            return DataUtils.ComposeKey(null, entityName);
        }


        /// <summary>
        /// Processes one entity.
        /// </summary>
        /// <param name="entityType">An instance of <see cref="IEntityType"/> that represents the entity.</param>
        /// <returns>MetaEntity.</returns>
        protected virtual MetaEntity ProcessEntityType(IEntityType entityType)
        {
            var entity = Model.CreateEntity();
            entity.Id = GetEntityId(entityType);
            entity.Name = DataUtils.PrettifyName(Utils.GetEntityName(entityType));
            entity.NamePlural = DataUtils.MakePlural(entity.Name);

            var primaryKey = entityType.FindPrimaryKey();
            entity.IsEditable = primaryKey != null;

            entity.ClrType = entityType.ClrType;

            var annotation = (MetaEntityAttribute)entityType.ClrType.GetCustomAttribute(typeof(MetaEntityAttribute));
            if (annotation != null) {
                if (!annotation.Enabled)
                    return null;

                if (!string.IsNullOrEmpty(annotation.DisplayName)) {
                    entity.Name = entity.NamePlural = annotation.DisplayName;
                }

                if (!string.IsNullOrEmpty(annotation.Description)) {
                    entity.Description = annotation.Description;
                }

                if (!string.IsNullOrEmpty(annotation.DisplayNamePlural)) {
                    entity.NamePlural = annotation.DisplayNamePlural;
                }

                if (annotation.Editable.HasValue) {
                    entity.IsEditable = annotation.Editable.Value;
                }
            }

            var properties = GetEntityProperties(entityType);
            int attrCounter = 0;
            foreach (var property in properties) {
                if (Options.SkipForeignKeys && property.IsForeignKey())
                    continue;

                var entityAttr = CreateEntityAttribute(entity, entityType, property);
                if (entityAttr != null) {                 
                    if (entityAttr.Index == int.MaxValue) {
                        entityAttr.Index = attrCounter;
                    }

                    attrCounter++;

                    entity.Attributes.Add(entityAttr);
                }
            }

            return entity;
        }


        /// <summary>
        /// Processes the navigation property.
        /// </summary>
        /// <param name="entity">The entity.</param>
        /// <param name="entityType">An instance of <see cref="IEntityType"/> that represents the entity in DbContext.</param>
        /// <param name="navigation">The navigation property.</param>
        /// <param name="attrCounter">Represents the default index of the processed attribute</param>
        protected virtual void ProcessNavigationProperty(MetaEntity entity, IEntityType entityType, 
                                                            INavigation navigation, ref int attrCounter)
        {
            // do not process collections for now
#if NET
            if (navigation.IsCollection)
                return;
#else
            if (navigation.IsCollection())
                return;
#endif

            var foreignKey = navigation.ForeignKey;
            var property = foreignKey.Properties.First();

            if (EntityTypeEntities.TryGetValue(foreignKey.PrincipalEntityType, out var lookupEntity)) {
                var lookUpAttr = Model.CreateEntityAttr(new MetaEntityAttrDescriptor() { 
                    Parent = entity, 
                    Kind = EntityAttrKind.Lookup 
                });
                lookUpAttr.Id = DataUtils.ComposeKey(entity.Id, navigation.Name);
                lookUpAttr.Caption = DataUtils.PrettifyName(navigation.Name);

                lookUpAttr.PropInfo = navigation.PropertyInfo;

                if (property.ClrType.IsEnum) {
                    lookUpAttr.DisplayFormat = DataUtils.ComposeDisplayFormatForEnum(property.ClrType);
                }

                var enabled = ApplyMetaEntityAttrAnnotation(lookUpAttr, navigation.PropertyInfo);
                if (!enabled)
                    return;

                var dataAttrId = DataUtils.ComposeKey(entity.Id, property.Name);
                var dataAttr = entity.FindAttributeById(dataAttrId);
                if (dataAttr == null) {
                    dataAttr = CreateEntityAttribute(entity, entityType, property);
                    if (dataAttr == null)
                        return;

                    if (dataAttr.Index == int.MaxValue) {
                        dataAttr.Index = attrCounter;
                    }

                    attrCounter++;
                    entity.Attributes.Add(dataAttr);
                }
                lookUpAttr.DataAttr = dataAttr;
                lookUpAttr.IsNullable = dataAttr.IsNullable;

                lookUpAttr.LookupEntity = lookupEntity;

                var principalKey = foreignKey.PrincipalKey;
                var principalProp = principalKey.Properties.First();
                var lookupDataAttrId = DataUtils.ComposeKey(lookupEntity.Id, principalProp.Name);
                var lookupDataAttr = lookupEntity.FindAttributeById(lookupDataAttrId);
                if (lookupDataAttr != null) {
                    lookUpAttr.LookupDataAttribute = lookupDataAttr;

                    if (lookupDataAttr.Index == int.MaxValue) {
                        lookupDataAttr.Index = attrCounter;
                    }

                    // hide lookup data field of lookup field on managing data
                    lookupDataAttr.ShowOnEdit = lookupDataAttr.ShowOnCreate = false;

                    attrCounter++;
                    entity.Attributes.Add(lookUpAttr);
                }

                var hasDisplayAttrs = lookupEntity.Attributes.Any(attr => attr.ShowInLookup);
                if (!hasDisplayAttrs) {
                    var attrs = lookupEntity.Attributes.Where(attr => attr.Caption.ToLowerInvariant().Contains("name")
                        && attr.DataType == DataType.String && attr.Kind != EntityAttrKind.Lookup);

                    if (!attrs.Any()) {
                        attrs = lookupEntity.Attributes.Where(attr => attr.DataType == DataType.String
                            && attr.Kind != EntityAttrKind.Lookup);
                    }

                    foreach(var attr in attrs) {
                        attr.ShowInLookup = true;
                    }
                }
            }
        }

        private bool ApplyMetaEntityAttrAnnotation(MetaEntityAttr entityAttr, PropertyInfo prop)
        {
            var annotation = (MetaEntityAttrAttribute)prop.GetCustomAttribute(typeof(MetaEntityAttrAttribute));
            if (annotation != null) {
                if (!annotation.Enabled)
                    return false;

                if (!string.IsNullOrEmpty(annotation.DisplayName)) {
                    entityAttr.Caption = annotation.DisplayName;
                }

                if (!string.IsNullOrEmpty(annotation.Description)) {
                    entityAttr.Description = annotation.Description;
                }

                entityAttr.DisplayFormat = annotation.DisplayFormat;
                entityAttr.IsEditable = annotation.Editable;
                entityAttr.ShowInLookup = annotation.ShowInLookup;
                entityAttr.ShowOnView = annotation.ShowOnView;
                entityAttr.ShowOnEdit = annotation.ShowOnEdit;
                entityAttr.ShowOnCreate = annotation.ShowOnCreate;
                entityAttr.Sorting = annotation.Sorting;

                if (annotation.Index != int.MaxValue) {
                    entityAttr.Index = annotation.Index;
                }
            }

            return true;
        }

        /// <summary>
        /// Creates the entity attribute for a particular entity type and property.
        /// </summary>
        /// <param name="entity">The entity to which the new attribute will be added.</param>
        /// <param name="entityType">An instance of <see cref="IEntityType"/> that represents the entity in the DbContext.</param>
        /// <param name="property">An instance of <see cref="IProperty"/> that represents the property in the model class.</param>
        /// <returns>MetaEntityAttr.</returns>
        protected virtual MetaEntityAttr CreateEntityAttribute(MetaEntity entity, IEntityType entityType, IProperty property)
        {
            var propertyName = property.Name;
            var columnName = property.GetDbColumnName();

            var entityAttr = Model.CreateEntityAttr(new MetaEntityAttrDescriptor()
            {
                Parent = entity
            });

            entityAttr.Id = DataUtils.ComposeKey(entity.Id, propertyName);
            entityAttr.Expr = columnName;
            entityAttr.Caption = propertyName;
            entityAttr.DataType = DataUtils.GetDataTypeBySystemType(property.ClrType);

            entityAttr.PropInfo = property.PropertyInfo;
            entityAttr.PropName = property.Name;

            entityAttr.IsPrimaryKey = property.IsPrimaryKey();
            entityAttr.IsForeignKey = property.IsForeignKey();

            entityAttr.IsNullable = property.IsNullable;

            if (entityAttr.DataType == DataType.Blob) {
                // HIDE blob fields by default
                entityAttr.ShowOnCreate = false;
                entityAttr.ShowOnEdit = false;
            }

            var veId = $"VE_{entity.Id}_{propertyName}";
            if (property.ClrType.IsEnum) {
                var editor = new ConstListValueEditor(veId);
                FieldInfo[] fields = property.ClrType.GetFields();
                foreach (var field in fields.Where(f => !f.Name.Equals("value__"))) {
                    editor.Values.Add(field.GetRawConstantValue().ToString(), field.Name);
                }
                entityAttr.DefaultEditor = editor;
                entityAttr.DisplayFormat = DataUtils.ComposeDisplayFormatForEnum(property.ClrType);
            }

            var propInfo = property.PropertyInfo;
            if (propInfo != null) {         
                if (propInfo.GetCustomAttribute(typeof(DisplayAttribute)) is DisplayAttribute displayAttr) {
                    entityAttr.Caption = displayAttr.Name;
                }
                else {
                    entityAttr.Caption = DataUtils.PrettifyName(entityAttr.Caption);
                }

                var enabled = ApplyMetaEntityAttrAnnotation(entityAttr, propInfo);
                if (!enabled)
                    return null;
            }

            if (entityAttr.DataType == DataType.Blob) {
                // DO NOT show blob fields in GRID
                entityAttr.ShowOnView = false;

                var editor = new FileValueEditor(veId);
                entityAttr.DefaultEditor = editor;
            }

            return entityAttr;
        }
    }
}
