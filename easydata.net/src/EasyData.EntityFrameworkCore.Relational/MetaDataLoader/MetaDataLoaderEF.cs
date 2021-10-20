using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Text;

namespace EasyData.EntityFrameworkCore
{
    public class MetadataLoaderEF : DbContextMetaDataLoader
    {
        protected readonly Dictionary<IEntityType, MetaEntity> EntityTypeEntities = new Dictionary<IEntityType, MetaEntity>();

        protected readonly MetaData Model;

        public MetadataLoaderEF(DbContext context, MetaData model, DbContextMetaDataLoaderOptions options) : base(context, options)
        {
            Model = model;
        }

        /// <summary>
        /// Load model from the database context.
        /// </summary>
        public void LoadFromDbContext()
        {
            var entityTypes = GetEntityTypes(DbContext.Model);

            if (Options.KeepDbSetDeclarationOrder) {
                // EF Core keeps information about entity types 
                // in alphabetical order.
                // To make it possible to keep the original order
                // we have to get all DbSet<> types manually
                var dbSetTypes = DbContext.GetType()
                    .GetProperties()
                    .Where(p => p.PropertyType.IsGenericType
                        && typeof(DbSet<>).IsAssignableFrom(p.PropertyType.GetGenericTypeDefinition()))
                    .Select(p => p.PropertyType.GetGenericArguments()[0])
                    .ToList();

                entityTypes = entityTypes.OrderBy(t => dbSetTypes.IndexOf(t.ClrType));
            }

            foreach (var entityType in entityTypes) {
                var entity = ProcessEntity(entityType);

                entity.Attributes.Reorder();
                entity.SubEntities.Reorder();

                Model.EntityRoot.SubEntities.Add(entity);
                EntityTypeEntities[entityType] = entity;
            }

            //Process navigation properties
            foreach (var entityType in entityTypes) {
                if (!EntityTypeEntities.TryGetValue(entityType, out var entity)) {
                    continue;
                }

                var navigations = entityType.GetNavigations();

                var attrCount = entity.Attributes
                    .Select(attr => attr.Index)
                    .DefaultIfEmpty(0).Max() + 1;

                foreach (var navigation in navigations) {
                    ProcessNavigationProperty(entity, navigation, ref attrCount);
                }
            }

            Model.EntityRoot.Attributes.Reorder();
            Model.EntityRoot.SubEntities.Reorder();
        }

        /// <summary>
        /// Generate entity id based on the name of the entity.
        /// </summary>
        /// <param name="entityType">Type of the entity.</param>
        /// <returns>Generated ID.</returns>
        protected static string GetEntityId(Type entityType)
        {
            var entityName = Utils.GetEntityNameByType(entityType);
            return DataUtils.ComposeKey(null, entityName);
        }

        /// <summary>
        /// Process entity.
        /// </summary>
        /// <param name="entityType">Type of the entity.</param>
        protected MetaEntity ProcessEntity(IEntityType entityType)
        {
            var entity = Model.CreateEntity();

            // Set some default values
            entity.Id = GetEntityId(entityType.ClrType);
            entity.ClrType = entityType.ClrType;
            entity.Name = DataUtils.PrettifyName(Utils.GetEntityNameByType(entity.ClrType));
            entity.NamePlural = DataUtils.MakePlural(entity.Name);

            // Process scalar properties
            var properties = entityType.GetProperties().ToList();
            var propertyCounter = 0;

            foreach (var property in properties) {
                if (Options.SkipForeignKeys && property.IsForeignKey())
                    continue;

                var entityProperty = ProcessProperty(entity, property);

                if (entityProperty.Index == int.MaxValue) {
                    entityProperty.Index = propertyCounter;
                }

                propertyCounter++;
                entity.Attributes.Add(entityProperty);
            }

            return entity;
        }

        /// <summary>
        /// Process scalar entity property.
        /// </summary>
        /// <param name="entity">Property parent entity.</param>
        /// <param name="propertyMeta">Property metadata.</param>
        /// <returns></returns>
        protected MetaEntityAttr ProcessProperty(MetaEntity entity, IProperty propertyMeta)
        {
            var property = Model.CreateEntityAttr(new MetaEntityAttrDescriptor()
            {
                Parent = entity
            });

            var entityName = Utils.GetEntityNameByType(entity.ClrType);

            // Set some defaults values
            property.Id = DataUtils.ComposeKey(entityName, propertyMeta.Name);
            property.Expr = propertyMeta.GetColumnName();
            property.Caption = DataUtils.PrettifyName(propertyMeta.Name);
            property.DataType = DataUtils.GetDataTypeBySystemType(propertyMeta.ClrType);
            property.PropInfo = propertyMeta.PropertyInfo;
            property.PropName = propertyMeta.Name;
            property.IsPrimaryKey = propertyMeta.IsPrimaryKey();
            property.IsForeignKey = propertyMeta.IsForeignKey();
            property.IsNullable = propertyMeta.IsNullable;

            // Set default value editors
            var valueEditorId = $"VE_{entityName}_{propertyMeta.Name}";

            if (propertyMeta.ClrType.IsEnum) {
                SetConstListValueEditor(property, valueEditorId, propertyMeta);
            }

            if (property.DataType == DataType.Blob) {
                SetFileValueEditor(property, valueEditorId);
            }

            // Update caption if display attribute is set
            var propInfo = propertyMeta.PropertyInfo;
            if (propInfo != null && propInfo.GetCustomAttribute(typeof(DisplayAttribute)) is DisplayAttribute displayAttr) {
                property.Caption = displayAttr.Name;
            }

            return property;
        }

        /// <summary>
        /// Set ConstListValueEditor for the property.
        /// </summary>
        /// <param name="property">Meta entity attribute instance.</param>
        /// <param name="editorId">Id of the editor.</param>
        /// <param name="propertyMeta">Property metadata.</param>
        protected static void SetConstListValueEditor(MetaEntityAttr property, string editorId, IProperty propertyMeta)
        {
            var editor = new ConstListValueEditor(editorId);
            var fields = propertyMeta.ClrType.GetFields();

            foreach (var field in fields.Where(f => !f.Name.Equals("value__"))) {
                editor.Values.Add(field.GetRawConstantValue().ToString(), field.Name);
            }

            property.DefaultEditor = editor;
            property.DisplayFormat = DataUtils.ComposeDisplayFormatForEnum(propertyMeta.ClrType);
        }

        /// <summary>
        /// Set FileValueEditor for the property.
        /// </summary>
        /// <param name="property">Meta entity attribute instance.</param>
        /// <param name="editorId">Id of the editor.</param>
        protected static void SetFileValueEditor(MetaEntityAttr property, string editorId)
        {
            var editor = new FileValueEditor(editorId);
            property.DefaultEditor = editor;
        }

        /// <summary>
        /// Process entity navigation properties.
        /// </summary>
        /// <param name="entity">Entity to which property is related to.</param>
        /// <param name="navigation">Navigation property.</param>
        /// <param name="propertyCounter">Entity property counter.</param>
        protected void ProcessNavigationProperty(MetaEntity entity, INavigation navigation, ref int propertyCounter)
        {
            // Do not need to process collections
#if NET
            if (navigation.IsCollection)
            {
                return;
            }
#else
            if (navigation.IsCollection()) {
                return;
            }
#endif

            var foreignKey = navigation.ForeignKey;

            // Check if there is a lookup entity in the store
            if (!EntityTypeEntities.TryGetValue(foreignKey.PrincipalEntityType, out var lookupEntity)) {
                return;
            }

            var lookupProperty = Model.CreateEntityAttr(new MetaEntityAttrDescriptor()
            {
                Parent = entity,
                Kind = EntityAttrKind.Lookup
            });

            // Set some defaults values
            lookupProperty.Id = DataUtils.ComposeKey(entity.Id, navigation.Name);
            lookupProperty.Caption = DataUtils.PrettifyName(navigation.Name);
            lookupProperty.PropInfo = navigation.PropertyInfo;

            var property = foreignKey.Properties.First();

            if (property.ClrType.IsEnum) {
                lookupProperty.DisplayFormat = DataUtils.ComposeDisplayFormatForEnum(property.ClrType);
            }

            // Get scalar property from the FK
            var foreignKeyScalarPropertyId = DataUtils.ComposeKey(entity.Id, property.Name);
            var foreignKeyScalarProperty = entity.FindAttributeById(foreignKeyScalarPropertyId);

            if (foreignKeyScalarProperty == null) {
                foreignKeyScalarProperty = ProcessProperty(entity, property);

                if (foreignKeyScalarProperty.Index == int.MaxValue) {
                    foreignKeyScalarProperty.Index = propertyCounter;
                }

                propertyCounter++;
                entity.Attributes.Add(foreignKeyScalarProperty);
            }

            lookupProperty.DataAttr = foreignKeyScalarProperty;
            lookupProperty.IsNullable = foreignKeyScalarProperty.IsNullable;
            lookupProperty.LookupEntity = lookupEntity;

            var principalKey = foreignKey.PrincipalKey;
            var principalProperty = principalKey.Properties.First();

            var lookupScalarPropertyId = DataUtils.ComposeKey(lookupEntity.Id, principalProperty.Name);
            var lookupScalarProperty = lookupEntity.FindAttributeById(lookupScalarPropertyId);

            if (lookupScalarProperty != null) {
                lookupProperty.LookupDataAttribute = lookupScalarProperty;

                if (lookupScalarProperty.Index == int.MaxValue) {
                    lookupScalarProperty.Index = propertyCounter;
                }

                // hide lookup data field of lookup field on managing data
                lookupScalarProperty.ShowOnEdit = false;
                lookupScalarProperty.ShowOnCreate = false;

                propertyCounter++;
                entity.Attributes.Add(lookupProperty);
            }

            var hasDisplayAttrs = lookupEntity.Attributes.Any(attr => attr.ShowInLookup);

            if (hasDisplayAttrs) {
                return;
            }

            var attrs = lookupEntity.Attributes.Where(attr => attr.Caption.ToLowerInvariant().Contains("name")
                && attr.DataType == DataType.String && attr.Kind != EntityAttrKind.Lookup);

            if (!attrs.Any()) {
                attrs = lookupEntity.Attributes.Where(attr => attr.DataType == DataType.String
                    && attr.Kind != EntityAttrKind.Lookup);
            }

            foreach (var attr in attrs) {
                attr.ShowInLookup = true;
            }

        }
    }
}
