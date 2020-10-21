using System.Linq;
using System.Reflection;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace EasyData.EntityFrameworkCore
{
    public class DbContextLoader
    {
        protected readonly DbContextLoaderOptions Options = new DbContextLoaderOptions();

        protected readonly Dictionary<string, MetaEntity> TableEntity = new Dictionary<string, MetaEntity>();

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

                entity.Attributes.Reorder();
                entity.SubEntities.Reorder();

                Model.EntityRoot.SubEntities.Add(entity);
            }

            Model.EntityRoot.Attributes.Reorder();
            Model.EntityRoot.SubEntities.Reorder();
        }

        #region auxiliary functions for LoadFromDbContext
        protected virtual MetaEntity ProcessEntityType(IModel contextModel, IEntityType entityType)
        {
            var entityName = entityType.Name.Split('.').Last();
            var entity = Model.CreateEntity();
            var tableName = entityType.GetTableName();
            entity.Id = DataUtils.ComposeKey(null, entityName);
            entity.Name = entityName;

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

            var navigations = entityType.GetNavigations();
            foreach (var navigation in navigations) {
                ProcessNavigationProperty(entity, entityType, contextModel, navigation, ref attrCounter);
            }

            return entity;
        }

        protected virtual void ProcessEntityAttr(MetaEntityAttr entityAttr, MetaEntity entity, IProperty property)
        {
            entity.Attributes.Add(entityAttr);
        }

        protected virtual void ProcessNavigationProperty(MetaEntity entity, IEntityType entityType, IModel contextModel, INavigation navigation, ref int attrCounter)
        {}

        protected virtual MetaEntityAttr CreateEntityAttribute(IEntityType entityType, IProperty property)
        {
            var entityName = entityType.Name.Split('.').Last();
            var propertyName = property.Name;
            var columnName = property.GetColumnName();

            var entityAttr = Model.CreateEntityAttr();
            entityAttr.ID = $"{entityName}.{propertyName}";
            entityAttr.Expr = columnName;
            entityAttr.Caption = propertyName;
            entityAttr.DataType = DataUtils.GetDataTypeBySystemType(property.ClrType);

            entityAttr.IsPrimaryKey = property.IsPrimaryKey();
            entityAttr.IsForeignKey = property.IsForeignKey();

            var propInfo = property.PropertyInfo;
            if (propInfo != null) {
                if (propInfo.GetCustomAttribute(typeof(DisplayAttribute)) is DisplayAttribute displayAttr) {
                    entityAttr.Caption = displayAttr.Name;
                }
                else {
                    entityAttr.Caption = DataUtils.PrettifyName(entityAttr.Caption);
                }
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
