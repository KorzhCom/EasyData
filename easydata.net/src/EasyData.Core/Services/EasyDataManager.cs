using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

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

        protected MetaData Model { get; private set; } = new MetaData();


        public EasyDataManager(IServiceProvider services, EasyDataOptions options)
        {
            Services = services;
            Options = options;
        }

        public async Task<MetaData> GetModelAsync(string modelId, CancellationToken ct = default)
        {
            if (Model.Id != modelId)
            {
                //TODO: Try to load model from cache

                await LoadModelAsync(modelId, ct);
            }

            return Model;
        }


        public virtual Task LoadModelAsync(string modelId, CancellationToken ct = default)
        {
            UpdateMetaWithOptions();
            Options.ModelTuner?.Invoke(Model);
            return Task.CompletedTask;
        }

        /// <summary>
        /// Update Meta data with properties from options.
        /// </summary>
        private void UpdateMetaWithOptions()
        {
            foreach (var metaBuilder in Options.EntityMetaBuilders)
            {
                for (int i = Model.EntityRoot.SubEntities.Count - 1; i >= 0; i--)
                {
                    var entity = Model.EntityRoot.SubEntities[i];

                    if (metaBuilder.ClrType.Equals(entity.ClrType))
                    {
                        if (!metaBuilder.Enabled ?? true)
                        {
                            Model.EntityRoot.SubEntities.RemoveAt(i);
                        }
                        UpdateEntityMeta(metaBuilder, entity);
                        Model.EntityRoot.SubEntities[i] = entity;
                        break;
                    }
                }
            }
        }

        /// <summary>
        /// Update single entity meta information.
        /// </summary>
        /// <param name="metaFrom">Meta builder to copy from.</param>
        /// <param name="metaTo">Meta Entity to copy to.</param>
        private void UpdateEntityMeta(IEntityMetaBuilder metaFrom, MetaEntity metaTo)
        {
            metaTo.Description = metaFrom.Description ?? metaTo.Description;
            metaTo.Name = metaFrom.DisplayName ?? metaTo.Name;
            metaTo.NamePlural = metaFrom.DisplayNamePlural ?? metaTo.NamePlural;

            // Update entity meta attributes
            foreach (var attributeBuilder in metaFrom.AttributeMetaBuilders)
            {
                for (int i = metaTo.Attributes.Count - 1; i >= 0; i--)
                {
                    var attribute = metaTo.Attributes[i];

                    if (attributeBuilder.PropertyInfo.Name.Equals(attribute.PropInfo.Name))
                    {
                        if (!attributeBuilder.IsEnabled ?? true)
                        {
                            metaTo.Attributes.RemoveAt(i);
                        }

                        UdpateEntityAttributeMeta(attributeBuilder, attribute);
                        metaTo.Attributes[i] = attribute;
                        break;
                    }
                }
            }
        }

        /// <summary>
        /// Update sungle entity attribute meta information.
        /// </summary>
        /// <param name="metaFrom">Meta builder to copy from</param>
        /// <param name="metaTo">Meta Entity Attribute to copy to.</param>
        private void UdpateEntityAttributeMeta(EntityAttributeMetaBuilder metaFrom, MetaEntityAttr metaTo)
        {
            metaTo.Caption = metaFrom.DisplayName ?? metaTo.Caption;
            metaTo.DisplayFormat = metaFrom.DisplayFormat ?? metaTo.DisplayFormat;
            metaTo.Description = metaFrom.Description ?? metaTo.Description;
            metaTo.IsEditable = metaFrom.IsEditable ?? metaTo.IsEditable;
            metaTo.Index = metaFrom.Index ?? metaTo.Index;
            metaTo.ShowInLookup = metaFrom.ShowInLookup ?? metaTo.ShowInLookup;
            metaTo.ShowOnView = metaFrom.ShowOnView ?? metaTo.ShowOnView;
            metaTo.ShowOnEdit = metaFrom.ShowOnEdit ?? metaTo.ShowOnEdit;
            metaTo.ShowOnCreate = metaFrom.ShowOnCreate ?? metaTo.ShowOnCreate;
            metaTo.Sorting = metaFrom.Sorting ?? metaTo.Sorting;
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
