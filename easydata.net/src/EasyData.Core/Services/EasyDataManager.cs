using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using EasyData.MetaDescriptors;
using Newtonsoft.Json.Linq;

namespace EasyData.Services
{

    public class EasyDataManagerException : Exception
    {
        public EasyDataManagerException(string message) : base(message)
        { }
    }

    public class EntityNotFoundException : Exception
    {
        public EntityNotFoundException(string entityContainer, string entityKey)
            : base($"Entity with id {entityKey} is not found in container: {entityContainer}")
        { }
    }

    public class ContainerNotFoundException : EasyDataManagerException
    {
        public ContainerNotFoundException(string entityContainer) : base($"Container is not found: {entityContainer}")
        { }
    }

    public abstract class EasyDataManager : IDisposable
    {

        protected readonly IServiceProvider Services;

        protected readonly EasyDataOptions Options;

        protected ConcurrentDictionary<string, Metadata> MetadataSchemas { get; private set; } =
            new ConcurrentDictionary<string, Metadata>();

        /// <summary>
        /// Default Entities metadata.
        /// </summary>
        protected List<EntityMetadataDescriptor> EntityMetadataDescriptors { get; private set; }

        public EasyDataManager(IServiceProvider services, EasyDataOptions options)
        {
            Services = services;
            Options = options;
        }

        public async Task<Metadata> GetModelAsync(string modelId, CancellationToken ct = default)
        {
            if (MetadataSchemas.TryGetValue(modelId, out var model)) {
                return model;
            }

            // Initialize model if not in storage
            model = await InitializeMetadataSchemaAsync(modelId, ct);

            // See if there was a model created with specified id (maybe from a parallel thread).
            if (!MetadataSchemas.TryAdd(modelId, model)) {
                // Discard the created model, use the one from dictionary.
                model = MetadataSchemas[modelId];
            }

            return model;
        }

        /// <summary>
        /// Create a new model instance.
        /// </summary>
        /// <param name="modelId">Id of the model.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <returns>Metadata schema.</returns>
        protected async Task<Metadata> InitializeMetadataSchemaAsync(
            string modelId, CancellationToken ct = default)
        {
            var model = new Metadata()
            {
                Id = modelId
            };

            await LoadModelAsync(model, ct);

            if (EntityMetadataDescriptors == null) {
                EntityMetadataDescriptors = GetDefaultMetadataDescriptors(ct)?.Result.ToList();

                if (EntityMetadataDescriptors != null) {
                    UpdateMetadataDescriptorsWithOptions();
                }
            }

            // Update loaded model metadata with entity descriptors and options
            UpdateModelMetaWithCustomMeta(model);
            model.Process();
            return model;
        }

        /// <summary>
        /// Load metadata with properties.
        /// </summary>
        /// <param name="metadata">Metadata object.</param>
        /// <param name="ct">Cancellation token.</param>
        public virtual Task LoadModelAsync(Metadata metadata, CancellationToken ct = default)
        {
            Options.ModelTuner?.Invoke(metadata);
            return Task.CompletedTask;
        }

        /// <summary>
        /// Update Entity descriptors with metadata defined in options.
        /// </summary>
        private void UpdateMetadataDescriptorsWithOptions()
        {
            foreach (var entityBuilder in Options.EntityMetaBuilders) {
                var entityDescriptor = EntityMetadataDescriptors.FirstOrDefault(
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
        /// Update Model meta data with the properties from options and meta descriptors.
        /// </summary>
        /// <param name="metadata">Metadata object.</param>
        private void UpdateModelMetaWithCustomMeta(Metadata metadata)
        {
            foreach (var entityDescriptor in EntityMetadataDescriptors) {
                var entity = metadata.EntityRoot.SubEntities.FirstOrDefault(
                    e => entityDescriptor.ClrType == e.ClrType);

                if (entity == null) {
                    // TODO: should we throw an exception?
                    continue;
                }

                // Remove from list if the entity is disabled in descriptor
                if (entityDescriptor.IsEnabled == false) {
                    metadata.EntityRoot.SubEntities.Remove(entity);
                    continue;
                }

                UpdateEntityMetaWithCustomDescriptor(entityDescriptor, entity);
            }
        }

        /// <summary>
        /// Update single entity meta information with custom entity descriptor.
        /// </summary>
        /// <param name="updateSource">Meta descriptor update source.</param>
        /// <param name="updateTarget">Meta Entity to update.</param>
        private static void UpdateEntityMetaWithCustomDescriptor(EntityMetadataDescriptor updateSource,
            MetaEntity updateTarget)
        {
            updateTarget.Description = updateSource.Description ?? updateTarget.Description;
            updateTarget.Name = updateSource.DisplayName ?? updateTarget.Name;
            updateTarget.NamePlural = updateSource.DisplayNamePlural ?? updateTarget.NamePlural;

            // Update entity meta attributes
            foreach (var propertyDescriptor in updateSource.MetadataProperties) {
                var property = updateTarget.Attributes.FirstOrDefault(
                    attr => attr.PropInfo.Name.Equals(propertyDescriptor.PropertyInfo.Name));

                if (property == null) {
                    // TODO: should we throw an exception?
                    continue;
                }

                // Remove from list if the attribute is disabled in options
                if (propertyDescriptor.IsEnabled == false) {
                    updateTarget.Attributes.Remove(property);
                    continue;
                }

                UpdateEntityPropertyMetaWithCustomDescriptor(propertyDescriptor, property);
            }
        }

        /// <summary>
        /// Update single entity property meta information with custom property descriptor.
        /// </summary>
        /// <param name="propertyDescriptor">Custom entity property descriptor.</param>
        /// <param name="metaToUpdate">Meta Entity property to update.</param>
        private static void UpdateEntityPropertyMetaWithCustomDescriptor(
            EntityPropertyMetadataDescriptor propertyDescriptor, MetaEntityAttr metaToUpdate)
        {
            metaToUpdate.Caption = propertyDescriptor.DisplayName ?? metaToUpdate.Caption;
            metaToUpdate.Description = propertyDescriptor.Description ?? metaToUpdate.Description;
            metaToUpdate.IsEditable = propertyDescriptor.IsEditable ?? metaToUpdate.IsEditable;
            metaToUpdate.Index = propertyDescriptor.Index ?? metaToUpdate.Index;
            metaToUpdate.ShowInLookup = propertyDescriptor.ShowInLookup ?? metaToUpdate.ShowInLookup;
            metaToUpdate.Sorting = propertyDescriptor.Sorting ?? metaToUpdate.Sorting;
            metaToUpdate.DisplayFormat = propertyDescriptor.DisplayFormat ?? metaToUpdate.DisplayFormat;
            metaToUpdate.ShowOnView = propertyDescriptor.ShowOnView ?? metaToUpdate.ShowOnView;
            metaToUpdate.ShowOnEdit = propertyDescriptor.ShowOnEdit ?? metaToUpdate.ShowOnEdit;
            metaToUpdate.ShowOnCreate = propertyDescriptor.ShowOnCreate ?? metaToUpdate.ShowOnCreate;
        }

        public abstract Task<EasyDataResultSet> GetEntitiesAsync(
            string modelId, string entityContainer,
            IEnumerable<EasyFilter> filters = null,
            IEnumerable<EasySorter> sorters = null,
            bool isLookup = false,
            int? offset = null, int? fetch = null,
            CancellationToken ct = default);

        public abstract Task<long> GetTotalEntitiesAsync(string modelId, string entityContainer, IEnumerable<EasyFilter> filters = null, bool isLookup = false, CancellationToken ct = default);

        public abstract Task<object> GetEntityAsync(string modelId, string entityContainer, string keyStr, CancellationToken ct = default);

        public abstract Task<object> CreateEntityAsync(string modelId, string entityContainer, JObject props, CancellationToken ct = default);

        public abstract Task<object> UpdateEntityAsync(string modelId, string entityContainer, string keyStr, JObject props, CancellationToken ct = default);

        public abstract Task DeleteEntityAsync(string modelId, string entityContainer, string keyStr, CancellationToken ct = default);

        public abstract Task<IEnumerable<EasySorter>> GetDefaultSortersAsync(string modelId, string entityContainer, CancellationToken ct = default);

        /// <summary>
        /// Get default metadata configuration for entities.
        /// </summary>
        /// <param name="ct">Cancellation token.</param>
        /// <returns>Default entities metadata.</returns>
        public abstract Task<IEnumerable<EntityMetadataDescriptor>> GetDefaultMetadataDescriptors(CancellationToken ct = default);

        /// <summary>
        /// Releases unmanaged and - optionally - managed resources.
        /// </summary>
        /// <param name="disposing"><c>true</c> to release both managed and unmanaged resources; <c>false</c> to release only unmanaged resources.</param>
        protected virtual void Dispose(bool disposing)
        {
            //no resources to dispose
            //we just have defined this method for derived classes
        }

        /// <summary>
        /// Performs application-defined tasks associated with freeing, releasing, or resetting unmanaged resources.
        /// </summary>
        public void Dispose()
        {
            Dispose(disposing: true);
            GC.SuppressFinalize(this);
        }
    }
}
