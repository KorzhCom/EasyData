using EasyData.MetaDescriptors;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using EasyData.Services;

namespace EasyData.EntityFrameworkCore
{
    public class DefaultMetaDataLoader : DbContextMetaDataLoader
    {
        public DefaultMetaDataLoader(DbContext context) : base(context)
        {
        }

        /// <summary>
        /// Get entity metadata.
        /// </summary>
        /// <param name="entityType">Type of the entity.</param>
        /// <returns>Entity metadata descriptor.</returns>
        protected IEntityMetadataDescriptor ProcessEntityType(Type entityType)
        {
            var descriptorType = typeof(EntityMetadataDescriptor<>).MakeGenericType(entityType);
            var entity = (IEntityMetadataDescriptor)Activator.CreateInstance(descriptorType);
            var annotation = (MetaEntityAttribute)entityType.GetCustomAttribute(typeof(MetaEntityAttribute));

            if (annotation != null) {
                entity.IsEnabled = annotation.Enabled;
                entity.DisplayName = annotation.DisplayName;
                entity.DisplayNamePlural = annotation.DisplayName;
                entity.Description = annotation.Description;
                entity.DisplayNamePlural = annotation.DisplayNamePlural;
            }

            var properties = entityType.GetProperties();

            foreach (var property in properties) {
                var propertyMetadata = ProcessEntityProperty(property);
                entity.MetadataProperties.Add(propertyMetadata);
            }

            return entity;
        }

        /// <summary>
        /// Get entity property metadata.
        /// </summary>
        /// <returns>Entity property metadata descriptor.</returns>
        protected EntityPropertyMetadataDescriptor ProcessEntityProperty(PropertyInfo propertyInfo)
        {
            var entityPropertyMetaDescriptor = new EntityPropertyMetadataDescriptor
            {
                PropertyInfo = propertyInfo
            };

            var annotation = (MetaEntityAttrAttribute)propertyInfo.GetCustomAttribute(typeof(MetaEntityAttrAttribute));

            if (annotation == null) {
                return entityPropertyMetaDescriptor;
            }

            entityPropertyMetaDescriptor.IsEnabled = annotation.Enabled;
            entityPropertyMetaDescriptor.DisplayName = annotation.DisplayName;
            entityPropertyMetaDescriptor.DisplayFormat = annotation.DisplayFormat;
            entityPropertyMetaDescriptor.IsEditable = annotation.Editable;
            entityPropertyMetaDescriptor.ShowInLookup = annotation.ShowInLookup;
            entityPropertyMetaDescriptor.ShowOnView = annotation.ShowOnView;
            entityPropertyMetaDescriptor.ShowOnEdit = annotation.ShowOnEdit;
            entityPropertyMetaDescriptor.ShowOnCreate = annotation.ShowOnCreate;
            entityPropertyMetaDescriptor.Sorting = annotation.Sorting;
            entityPropertyMetaDescriptor.Index = annotation.Index;
            entityPropertyMetaDescriptor.Description = annotation.Description;

            return entityPropertyMetaDescriptor;
        }

        /// <summary>
        /// Get default meta attributes.
        /// </summary>
        /// <returns>Collection of Entity metadata descriptors.</returns>
        public IEnumerable<IEntityMetadataDescriptor> GetDefaultMetaAttributes()
        {
            return GetEntityTypes(DbContext.Model).Select(entityType => ProcessEntityType(entityType.ClrType));
        }
    }
}
