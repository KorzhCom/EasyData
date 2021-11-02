using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using EasyData.MetaDescriptors;
using Microsoft.EntityFrameworkCore.Metadata;

namespace EasyData.EntityFrameworkCore.MetaDataLoader
{
    /// <summary>
    /// Get metadata from entity attributes.
    /// </summary>
    public class AttributesMetadataLoader
    {
        /// <summary>
        /// Get entity metadata.
        /// </summary>
        /// <param name="entityType">Type of the entity.</param>
        /// <returns>Entity metadata descriptor.</returns>
        protected static EntityMetadataDescriptor ProcessEntityType(Type entityType)
        {
            var descriptor = new EntityMetadataDescriptor
            {
                ClrType = entityType
            };

            var annotation = (MetaEntityAttribute)entityType.GetCustomAttribute(typeof(MetaEntityAttribute));

            if (annotation != null) {
                descriptor.IsEnabled = annotation.Enabled;
                descriptor.DisplayName = annotation.DisplayName;
                descriptor.DisplayNamePlural = annotation.DisplayName;
                descriptor.Description = annotation.Description;
                descriptor.DisplayNamePlural = annotation.DisplayNamePlural;
            }

            var attributes = entityType.GetProperties();

            foreach (var attribute in attributes) {
                var attributeMetadata = ProcessEntityAttribute(attribute);
                descriptor.MetadataAttributes.Add(attributeMetadata);
            }

            return descriptor;
        }

        /// <summary>
        /// Get entity attribute metadata.
        /// </summary>
        /// <returns>Entity attribute metadata descriptor.</returns>
        protected static EntityAttributeMetadataDescriptor ProcessEntityAttribute(PropertyInfo propertyInfo)
        {
            var entityAttributeMetadataDescriptor = new EntityAttributeMetadataDescriptor
            {
                PropertyInfo = propertyInfo
            };

            var annotation = (MetaEntityAttrAttribute)propertyInfo.GetCustomAttribute(typeof(MetaEntityAttrAttribute));

            if (annotation == null) {
                return entityAttributeMetadataDescriptor;
            }

            entityAttributeMetadataDescriptor.IsEnabled = annotation.Enabled;
            entityAttributeMetadataDescriptor.DisplayName = annotation.DisplayName;
            entityAttributeMetadataDescriptor.DisplayFormat = annotation.DisplayFormat;
            entityAttributeMetadataDescriptor.IsEditable = annotation.Editable;
            entityAttributeMetadataDescriptor.ShowInLookup = annotation.ShowInLookup;
            entityAttributeMetadataDescriptor.ShowOnView = annotation.ShowOnView;
            entityAttributeMetadataDescriptor.ShowOnEdit = annotation.ShowOnEdit;
            entityAttributeMetadataDescriptor.ShowOnCreate = annotation.ShowOnCreate;
            entityAttributeMetadataDescriptor.Sorting = annotation.Sorting;
            entityAttributeMetadataDescriptor.Index = annotation.Index;
            entityAttributeMetadataDescriptor.Description = annotation.Description;

            return entityAttributeMetadataDescriptor;
        }

        /// <summary>
        /// Get default meta attributes.
        /// </summary>
        /// <returns>Collection of Entity metadata descriptors.</returns>
        public static IEnumerable<EntityMetadataDescriptor> GetMetaAttributes(IEnumerable<IEntityType> entityTypes)
        {
            return entityTypes.Select(entityType => ProcessEntityType(entityType.ClrType));
        }
    }
}
