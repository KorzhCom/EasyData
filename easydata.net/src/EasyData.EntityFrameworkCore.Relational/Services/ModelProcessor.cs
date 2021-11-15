using System.Collections.Generic;
using System.Linq;
using EasyData.MetaDescriptors;
using EasyData.Services;

namespace EasyData.EntityFrameworkCore.Services
{
    // Do final data model processing.
    internal static class ModelProcessor
    {
        // Do model processing.
        public static void Process(this MetaData model)
        {
            // Process blob attributes.
            foreach (var entity in model.EntityRoot.SubEntities) {
                foreach (var attr in entity.Attributes
                             .Where(a => a.DataType == DataType.Blob)) {
                    ProcessBlob(attr);
                }
            }
        }

        /// <summary>
        /// Process blob type attributes.
        /// </summary>
        /// <param name="attribute">Entity attribute metadata.</param>
        private static void ProcessBlob(MetaEntityAttr attribute)
        {
            // Hide blob types.
            attribute.ShowOnCreate = false;
            attribute.ShowOnEdit = false;
            attribute.ShowOnView = false;
        }

        /// <summary>
        /// Update Model metadata with the meta from options and meta descriptors.
        /// </summary>
        public static void MergeWithCustomMetadata(this MetaData model, ICollection<EntityMetadataDescriptor> descriptors, DbContextMetaDataLoaderOptions options)
        {
            if (descriptors != null) {
                MergeMetadataDescriptorsWithOptions(descriptors, options);
            }

            MergeModelWithMetadataDescriptors(model, descriptors);
        }

        /// <summary>
        /// Update metadata descriptors with metadata defined in options.
        /// </summary>
        private static void MergeMetadataDescriptorsWithOptions(ICollection<EntityMetadataDescriptor> descriptors, DbContextMetaDataLoaderOptions options)
        {
            foreach (var builder in options.MetadataBuilder.EntityMetaBuilders) {
                var entityMetadataDescriptor = builder.EntityMetadataDescriptor;
                var entityDescriptor = descriptors.FirstOrDefault(
                    e => entityMetadataDescriptor.ClrType == e.ClrType);

                if (entityDescriptor == null) {
                    // TODO: should we throw an exception?
                    continue;
                }

                entityDescriptor.Description = entityMetadataDescriptor.Description ?? entityDescriptor.Description;
                entityDescriptor.DisplayName = entityMetadataDescriptor.DisplayName ?? entityDescriptor.DisplayName;
                entityDescriptor.DisplayNamePlural = entityMetadataDescriptor.DisplayNamePlural ?? entityDescriptor.DisplayNamePlural;
                entityDescriptor.IsEnabled = entityMetadataDescriptor.IsEnabled;
                entityDescriptor.IsEditable = entityMetadataDescriptor.IsEditable ?? entityDescriptor.IsEditable;

                foreach (var entityAttributeMetadataDescriptor in entityMetadataDescriptor.MetadataAttributes) {
                    var attributeDescriptor = entityDescriptor.MetadataAttributes.FirstOrDefault(
                        p => p.PropertyInfo.Name.Equals(entityAttributeMetadataDescriptor.PropertyInfo.Name));

                    if (attributeDescriptor == null) {
                        // TODO: should we throw an exception?
                        continue;
                    }

                    attributeDescriptor.DisplayName = entityAttributeMetadataDescriptor.DisplayName ?? attributeDescriptor.DisplayName;
                    attributeDescriptor.DisplayFormat = entityAttributeMetadataDescriptor.DisplayFormat ?? attributeDescriptor.DisplayFormat;
                    attributeDescriptor.Description = entityAttributeMetadataDescriptor.Description ?? attributeDescriptor.Description;
                    attributeDescriptor.IsEditable = entityAttributeMetadataDescriptor.IsEditable ?? attributeDescriptor.IsEditable;
                    attributeDescriptor.Index = entityAttributeMetadataDescriptor.Index ?? attributeDescriptor.Index;
                    attributeDescriptor.ShowInLookup = entityAttributeMetadataDescriptor.ShowInLookup ?? attributeDescriptor.ShowInLookup;
                    attributeDescriptor.ShowOnView = entityAttributeMetadataDescriptor.ShowOnView ?? attributeDescriptor.ShowOnView;
                    attributeDescriptor.ShowOnEdit = entityAttributeMetadataDescriptor.ShowOnEdit ?? attributeDescriptor.ShowOnEdit;
                    attributeDescriptor.ShowOnCreate = entityAttributeMetadataDescriptor.ShowOnCreate ?? attributeDescriptor.ShowOnCreate;
                    attributeDescriptor.Sorting = entityAttributeMetadataDescriptor.Sorting ?? attributeDescriptor.Sorting;
                    attributeDescriptor.IsEnabled = entityAttributeMetadataDescriptor.IsEnabled;
                }
            }
        }

        /// <summary>
        /// Update Model metadata with metadata descriptors.
        /// </summary>
        private static void MergeModelWithMetadataDescriptors(MetaData metaData, IEnumerable<EntityMetadataDescriptor> descriptors)
        {
            foreach (var entityDescriptor in descriptors) {
                var entity = metaData.EntityRoot.SubEntities.FirstOrDefault(
                    e => entityDescriptor.ClrType == e.ClrType);

                if (entity == null) {
                    // TODO: should we throw an exception?
                    continue;
                }

                // Remove from list if the entity is disabled in descriptor
                if (entityDescriptor.IsEnabled == false) {
                    metaData.EntityRoot.SubEntities.Remove(entity);
                    continue;
                }

                entity.Description = entityDescriptor.Description ?? entity.Description;
                entity.Name = entityDescriptor.DisplayName ?? entity.Name;
                entity.NamePlural = entityDescriptor.DisplayNamePlural ?? entity.NamePlural;
                entity.IsEditable = entityDescriptor.IsEditable ?? entity.IsEditable;

                // Update entity meta attributes
                foreach (var attributeDescriptor in entityDescriptor.MetadataAttributes) {
                    var attribute = entity.Attributes.FirstOrDefault(
                        attr => attr.PropInfo.Name.Equals(attributeDescriptor.PropertyInfo.Name));

                    if (attribute == null) {
                        // TODO: should we throw an exception?
                        continue;
                    }

                    // Remove from list if the attribute is disabled in options
                    if (attributeDescriptor.IsEnabled == false) {
                        entity.Attributes.Remove(attribute);
                        continue;
                    }

                    attribute.Caption = attributeDescriptor.DisplayName ?? attribute.Caption;
                    attribute.Description = attributeDescriptor.Description ?? attribute.Description;
                    attribute.IsEditable = attributeDescriptor.IsEditable ?? attribute.IsEditable;
                    attribute.Index = attributeDescriptor.Index ?? attribute.Index;
                    attribute.ShowInLookup = attributeDescriptor.ShowInLookup ?? attribute.ShowInLookup;
                    attribute.Sorting = attributeDescriptor.Sorting ?? attribute.Sorting;
                    attribute.DisplayFormat = attributeDescriptor.DisplayFormat ?? attribute.DisplayFormat;
                    attribute.ShowOnView = attributeDescriptor.ShowOnView ?? attribute.ShowOnView;
                    attribute.ShowOnEdit = attributeDescriptor.ShowOnEdit ?? attribute.ShowOnEdit;
                    attribute.ShowOnCreate = attributeDescriptor.ShowOnCreate ?? attribute.ShowOnCreate;
                }
            }
        }
    }
}
