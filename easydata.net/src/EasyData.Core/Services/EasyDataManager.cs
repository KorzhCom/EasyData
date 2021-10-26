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

        protected ConcurrentDictionary<string, MetaData> MetadataSchemas { get; private set; } =
            new ConcurrentDictionary<string, MetaData>();

        /// <summary>
        /// Default Entities metadata.
        /// </summary>
        protected List<EntityMetadataDescriptor> EntityMetadataDescriptors { get; private set; }

        public EasyDataManager(IServiceProvider services, EasyDataOptions options)
        {
            Services = services;
            Options = options;
        }

        public async Task<MetaData> GetModelAsync(string modelId, CancellationToken ct = default)
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
        protected async Task<MetaData> InitializeMetadataSchemaAsync(
            string modelId, CancellationToken ct = default)
        {
            var model = new MetaData()
            {
                Id = modelId
            };

            await LoadModelAsync(model, ct);

            if (EntityMetadataDescriptors == null) {
                EntityMetadataDescriptors = (await GetDefaultMetadataDescriptorsAsync(ct)).ToList();
            }

            // Update loaded model metadata with entity descriptors and options
            model.UpdateWithCustomMetadata(EntityMetadataDescriptors, Options);
            model.Process();
            return model;
        }

        /// <summary>
        /// Load metadata with properties.
        /// </summary>
        /// <param name="metaData">Metadata object.</param>
        /// <param name="ct">Cancellation token.</param>
        public virtual Task LoadModelAsync(MetaData metaData, CancellationToken ct = default)
        {
            Options.ModelTuner?.Invoke(metaData);
            return Task.CompletedTask;
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
        public abstract Task<IEnumerable<EntityMetadataDescriptor>> GetDefaultMetadataDescriptorsAsync(CancellationToken ct = default);

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
