using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using EasyData.MetaDescriptors;

namespace EasyData.Services
{
    // Do final data model processing.
    static class ModelProcessor
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
        public static void MergeWithCustomMetadata(this MetaData model, List<EntityMetadataDescriptor> descriptors, EasyDataOptions options)
        {
            if (descriptors != null) {
                MergeMetadataDescriptorsWithOptions(descriptors, options);
            }

            MergeModelWithMetadataDescriptors(model, descriptors);
        }

        /// <summary>
        /// Update metadata descriptors with metadata defined in options.
        /// </summary>
        private static void MergeMetadataDescriptorsWithOptions(List<EntityMetadataDescriptor> descriptors, EasyDataOptions options)
        {
            foreach (var entityBuilder in options.MetadataBuilder.EntityMetaBuilders) {
                var entityDescriptor = descriptors.FirstOrDefault(
                    e => entityBuilder.ClrType == e.ClrType);

                if (entityDescriptor == null) {
                    // TODO: should we throw an exception?
                    continue;
                }

                entityDescriptor.Description = entityBuilder.Description ?? entityDescriptor.Description;
                entityDescriptor.DisplayName = entityBuilder.DisplayName ?? entityDescriptor.DisplayName;
                entityDescriptor.DisplayNamePlural = entityBuilder.DisplayNamePlural ?? entityDescriptor.DisplayNamePlural;
                entityDescriptor.IsEnabled = entityBuilder.IsEnabled ?? entityDescriptor.IsEnabled;

                foreach (var propertyBuilder in entityBuilder.PropertyMetaBuilders) {
                    var propertyDescriptor = entityDescriptor.MetadataProperties.FirstOrDefault(
                        p => p.PropertyInfo.Name.Equals(propertyBuilder.PropertyInfo.Name));

                    if (propertyDescriptor == null) {
                        // TODO: should we throw an exception?
                        continue;
                    }

                    propertyDescriptor.DisplayName = propertyBuilder.DisplayName ?? propertyDescriptor.DisplayName;
                    propertyDescriptor.DisplayFormat = propertyBuilder.DisplayFormat ?? propertyDescriptor.DisplayFormat;
                    propertyDescriptor.Description = propertyBuilder.Description ?? propertyDescriptor.Description;
                    propertyDescriptor.IsEditable = propertyBuilder.IsEditable ?? propertyDescriptor.IsEditable;
                    propertyDescriptor.Index = propertyBuilder.Index ?? propertyDescriptor.Index;
                    propertyDescriptor.ShowInLookup = propertyBuilder.ShowInLookup ?? propertyDescriptor.ShowInLookup;
                    propertyDescriptor.ShowOnView = propertyBuilder.ShowOnView ?? propertyDescriptor.ShowOnView;
                    propertyDescriptor.ShowOnEdit = propertyBuilder.ShowOnEdit ?? propertyDescriptor.ShowOnEdit;
                    propertyDescriptor.ShowOnCreate = propertyBuilder.ShowOnCreate ?? propertyDescriptor.ShowOnCreate;
                    propertyDescriptor.Sorting = propertyBuilder.Sorting ?? propertyDescriptor.Sorting;
                    propertyDescriptor.IsEnabled = propertyBuilder.IsEnabled ?? propertyDescriptor.IsEnabled;
                }
            }
        }

        /// <summary>
        /// Update Model metadata with metadata descriptors.
        /// </summary>
        private static void MergeModelWithMetadataDescriptors(MetaData metaData, List<EntityMetadataDescriptor> descriptors)
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

                // Update entity meta attributes
                foreach (var propertyDescriptor in entityDescriptor.MetadataProperties) {
                    var property = entity.Attributes.FirstOrDefault(
                        attr => attr.PropInfo.Name.Equals(propertyDescriptor.PropertyInfo.Name));

                    if (property == null) {
                        // TODO: should we throw an exception?
                        continue;
                    }

                    // Remove from list if the attribute is disabled in options
                    if (propertyDescriptor.IsEnabled == false) {
                        entity.Attributes.Remove(property);
                        continue;
                    }

                    property.Caption = propertyDescriptor.DisplayName ?? property.Caption;
                    property.Description = propertyDescriptor.Description ?? property.Description;
                    property.IsEditable = propertyDescriptor.IsEditable ?? property.IsEditable;
                    property.Index = propertyDescriptor.Index ?? property.Index;
                    property.ShowInLookup = propertyDescriptor.ShowInLookup ?? property.ShowInLookup;
                    property.Sorting = propertyDescriptor.Sorting ?? property.Sorting;
                    property.DisplayFormat = propertyDescriptor.DisplayFormat ?? property.DisplayFormat;
                    property.ShowOnView = propertyDescriptor.ShowOnView ?? property.ShowOnView;
                    property.ShowOnEdit = propertyDescriptor.ShowOnEdit ?? property.ShowOnEdit;
                    property.ShowOnCreate = propertyDescriptor.ShowOnCreate ?? property.ShowOnCreate;
                }
            }
        }
    }
}
