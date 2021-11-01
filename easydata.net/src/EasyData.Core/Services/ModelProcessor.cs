using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace EasyData.Services
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
        public static void MergeWithCustomMetadata(this MetaData model, List<IEntityMetadataDescriptor> descriptors, EasyDataOptions options)
        {
            if (descriptors != null) {
                MergeMetadataDescriptorsWithOptions(descriptors, options);
            }

            MergeModelWithMetadataDescriptors(model, descriptors);
        }

        /// <summary>
        /// Update metadata descriptors with metadata defined in options.
        /// </summary>
        private static void MergeMetadataDescriptorsWithOptions(IReadOnlyCollection<IEntityMetadataDescriptor> descriptors, EasyDataOptions options)
        {
            foreach (var entityMetadataDescriptor in options.MetadataBuilder.EntityMetadataDescriptors) {
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

                foreach (var entityPropertyMetadataDescriptor in entityMetadataDescriptor.MetadataProperties) {
                    var propertyDescriptor = entityDescriptor.MetadataProperties.FirstOrDefault(
                        p => p.PropertyInfo.Name.Equals(entityPropertyMetadataDescriptor.PropertyInfo.Name));

                    if (propertyDescriptor == null) {
                        // TODO: should we throw an exception?
                        continue;
                    }

                    propertyDescriptor.DisplayName = entityPropertyMetadataDescriptor.DisplayName ?? propertyDescriptor.DisplayName;
                    propertyDescriptor.DisplayFormat = entityPropertyMetadataDescriptor.DisplayFormat ?? propertyDescriptor.DisplayFormat;
                    propertyDescriptor.Description = entityPropertyMetadataDescriptor.Description ?? propertyDescriptor.Description;
                    propertyDescriptor.IsEditable = entityPropertyMetadataDescriptor.IsEditable ?? propertyDescriptor.IsEditable;
                    propertyDescriptor.Index = entityPropertyMetadataDescriptor.Index ?? propertyDescriptor.Index;
                    propertyDescriptor.ShowInLookup = entityPropertyMetadataDescriptor.ShowInLookup ?? propertyDescriptor.ShowInLookup;
                    propertyDescriptor.ShowOnView = entityPropertyMetadataDescriptor.ShowOnView ?? propertyDescriptor.ShowOnView;
                    propertyDescriptor.ShowOnEdit = entityPropertyMetadataDescriptor.ShowOnEdit ?? propertyDescriptor.ShowOnEdit;
                    propertyDescriptor.ShowOnCreate = entityPropertyMetadataDescriptor.ShowOnCreate ?? propertyDescriptor.ShowOnCreate;
                    propertyDescriptor.Sorting = entityPropertyMetadataDescriptor.Sorting ?? propertyDescriptor.Sorting;
                    propertyDescriptor.IsEnabled = entityPropertyMetadataDescriptor.IsEnabled;
                }
            }
        }

        /// <summary>
        /// Update Model metadata with metadata descriptors.
        /// </summary>
        private static void MergeModelWithMetadataDescriptors(MetaData metaData, List<IEntityMetadataDescriptor> descriptors)
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
