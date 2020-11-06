using System.Linq;
using System.Reflection;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace EasyData.EntityFrameworkCore
{
    public class DbContextLoader
    {
        protected readonly DbContextLoaderOptions Options = new DbContextLoaderOptions();

        protected readonly Dictionary<string, MetaEntity> TableEntity = new Dictionary<string, MetaEntity>();

        protected readonly Dictionary<IEntityType, MetaEntity> EntityTypeEntities = new Dictionary<IEntityType, MetaEntity>();

        protected readonly MetaData Model;

        public DbContextLoader(MetaData model): this(model, null)
        {
        }

        public DbContextLoader(MetaData model, DbContextLoaderOptions options)
        {
            Model = model;

            if (options != null) {
                Options = options;
            }
        }

        protected virtual IEnumerable<IEntityType> GetEntityTypes(IModel contextModel)
        {   
            return contextModel.GetEntityTypes()
               .Where(entityType => ApplyFilters(entityType));
        }

        public virtual void LoadFromDbContext(DbContext context)
        {
            TableEntity.Clear();

            var entityTypes = GetEntityTypes(context.Model);
            foreach (var entityType in entityTypes) {
                var entity = ProcessEntityType(context.Model, entityType);
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
                    int attrCount = entity.Attributes.Max(attr => attr.Index) + 1;
                    foreach (var navigation in navigations) {
                        ProcessNavigationProperty(entity, entityType, context.Model, navigation, ref attrCount);
                    }
                }
            }

            Model.EntityRoot.Attributes.Reorder();
            Model.EntityRoot.SubEntities.Reorder();
        }

        protected string GetEntityId(IEntityType entityType)
        {
            var entityName = GetEntityName(entityType);
            return DataUtils.ComposeKey(null, entityName);
        }

        protected string GetEntityName(IEntityType entityType)
        { 
            return entityType.Name.Split('.').Last();
        }


        #region auxiliary functions for LoadFromDbContext
        protected virtual MetaEntity ProcessEntityType(IModel contextModel, IEntityType entityType)
        {
            var entity = Model.CreateEntity();
            var tableName = entityType.GetTableName();
            entity.Id = GetEntityId(entityType);
            entity.Name = GetEntityName(entityType);

            entity.ObjType = entityType.ClrType;

            var annotation = (MetaEntityAttribute)entityType.ClrType.GetCustomAttribute(typeof(MetaEntityAttribute));
            if (annotation != null) {
                if (!annotation.Enabled)
                    return null;

                if (!string.IsNullOrEmpty(annotation.DisplayName)) {
                    entity.Name = annotation.DisplayName;
                }

                if (!string.IsNullOrEmpty(annotation.Description)) {
                    entity.Description = annotation.Description;
                }
            }

            TableEntity.Add(tableName, entity);

            var properties = entityType.GetProperties().ToList();
            int attrCounter = 0;
            foreach (var property in properties) {
                if (Options.SkipForeignKeys && property.IsForeignKey())
                    continue;

                var entityAttr = CreateEntityAttribute(entityType, property);
                if (entityAttr != null) {
                 
                    if (entityAttr.Index == int.MaxValue) {
                        entityAttr.Index = attrCounter;
                    }

                    attrCounter++;

                    ProcessEntityAttr(entityAttr, entity, property);
                }
            }

            return entity;
        }

        protected virtual void ProcessEntityAttr(MetaEntityAttr entityAttr, MetaEntity entity, IProperty property)
        {
            entity.Attributes.Add(entityAttr);
        }

        protected virtual void ProcessNavigationProperty(MetaEntity entity, IEntityType entityType, IModel contextModel,
            INavigation navigation, ref int attrCounter)
        {
            // do not process collections for now
            if (navigation.IsCollection())
                return;

            var foreignKey = navigation.ForeignKey;
            var property = foreignKey.Properties.First();

            if (EntityTypeEntities.TryGetValue(foreignKey.PrincipalEntityType, out var lookupEntity)) {
                var lookUpAttr = Model.CreateLookupEntityAttr(entity);
                lookUpAttr.ID = DataUtils.ComposeKey(entity.Id, navigation.Name);
                lookUpAttr.Caption = DataUtils.PrettifyName(navigation.Name);

                lookUpAttr.PropInfo = navigation.PropertyInfo;

                lookUpAttr = ApplyMetaEntityAttrAttribute(lookUpAttr, navigation.PropertyInfo);
                if (lookUpAttr is null)
                    return;

                var dataAttrId = DataUtils.ComposeKey(entity.Id, property.Name);
                var dataAttr = entity.FindAttributeById(dataAttrId);
                if (dataAttr == null) {
                    dataAttr = CreateEntityAttribute(entityType, property);
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

                    if (dataAttr.Index == int.MaxValue) {
                        dataAttr.Index = attrCounter;
                    }

                    attrCounter++;
                    entity.Attributes.Add(lookUpAttr);
                }

                var hasDisplayAttrs = lookupEntity.Attributes.Any(attr => attr.ShowInLookup);
                if (!hasDisplayAttrs) {
                    var displayAttr = lookupEntity.Attributes.FirstOrDefault(attr => attr.Caption.ToLowerInvariant().Contains("name")
                        && attr.DataType == DataType.String && attr.Kind != EntityAttrKind.Lookup);

                    if (displayAttr == null) {
                        displayAttr = lookupEntity.Attributes.FirstOrDefault(attr => attr.DataType == DataType.String 
                            && attr.Kind != EntityAttrKind.Lookup);
                    }

                    if (displayAttr != null) {
                        displayAttr.ShowInLookup = true;
                    }
                }
            }

        }

        private MetaEntityAttr ApplyMetaEntityAttrAttribute(MetaEntityAttr entityAttr, PropertyInfo prop)
        {
            var annotation = (MetaEntityAttrAttribute)prop.GetCustomAttribute(typeof(MetaEntityAttrAttribute));
            if (annotation != null) {
                if (!annotation.Enabled)
                    return null;

                if (!string.IsNullOrEmpty(annotation.DisplayName)) {
                    entityAttr.Caption = annotation.DisplayName;
                }

                if (!string.IsNullOrEmpty(annotation.Description)) {
                    entityAttr.Description = annotation.Description;
                }

                entityAttr.ShowInLookup = annotation.ShowInLookup;

                entityAttr.IsEditable = annotation.Editable;

                entityAttr.IsVisible = annotation.Visible;

                if (annotation.Index != int.MaxValue) {
                    entityAttr.Index = annotation.Index;
                }
            }

            return entityAttr;
        }

        protected virtual MetaEntityAttr CreateEntityAttribute(IEntityType entityType, IProperty property)
        {
            var entityName = GetEntityName(entityType);
            var propertyName = property.Name;
            var columnName = property.GetColumnName();

            var entityAttr = Model.CreateEntityAttr();
            entityAttr.ID = DataUtils.ComposeKey(entityName, propertyName);
            entityAttr.Expr = columnName;
            entityAttr.Caption = propertyName;
            entityAttr.DataType = DataUtils.GetDataTypeBySystemType(property.ClrType);

            entityAttr.PropInfo = property.PropertyInfo;

            entityAttr.IsPrimaryKey = property.IsPrimaryKey();
            entityAttr.IsForeignKey = property.IsForeignKey();

            entityAttr.IsNullable = property.IsNullable;

            var propInfo = property.PropertyInfo;
            if (propInfo != null) {
         
                if (propInfo.GetCustomAttribute(typeof(DisplayAttribute)) is DisplayAttribute displayAttr) {
                    entityAttr.Caption = displayAttr.Name;
                }
                else {
                    entityAttr.Caption = DataUtils.PrettifyName(entityAttr.Caption);
                }

                entityAttr = ApplyMetaEntityAttrAttribute(entityAttr, propInfo);
            }

            return entityAttr;

        }

        private bool ApplyFilters(IEntityType entityType)
        {
            foreach (var filter in Options.Filters) {
                if (!filter.Invoke(entityType)) {
                    return false;
                }
            }

            return true;
        }

        #endregion
    }
}
