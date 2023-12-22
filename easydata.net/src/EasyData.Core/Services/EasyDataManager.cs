using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

using Newtonsoft.Json.Linq;

namespace EasyData.Services
{
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
            if (Model.Id != modelId) {
                //TODO: Try to load model from cache

                await LoadModelAsync(modelId, ct);
            }

            return Model;
        }


        public virtual Task LoadModelAsync(string modelId, CancellationToken ct = default)
        {
            Options.ModelTuner?.Invoke(Model);
            return Task.CompletedTask;
        }

        public abstract Task<EasyDataResultSet> FetchDatasetAsync(
                                                    string modelId, string sourceId,
                                                    IEnumerable<EasyFilter> filters = null,
                                                    IEnumerable<EasySorter> sorters = null,
                                                    bool isLookup = false,
                                                    int? offset = null, int? fetch = null,
                                                    CancellationToken ct = default);

        public abstract Task<long> GetTotalRecordsAsync(string modelId, string sourceId, IEnumerable<EasyFilter> filters = null, bool isLookup = false, CancellationToken ct = default);

        public abstract Task<object> FetchRecordAsync(string modelId, string sourceId, Dictionary<string, string> keys, CancellationToken ct = default);

        public abstract Task<object> CreateRecordAsync(string modelId, string sourceId, JObject props, CancellationToken ct = default);

        public abstract Task<object> UpdateRecordAsync(string modelId, string sourceId, JObject props, CancellationToken ct = default);

        public abstract Task DeleteRecordAsync(string modelId, string sourceId, JObject props, CancellationToken ct = default);

        /// <summary>
        /// Delete entities in bulk.
        /// </summary>
        /// <param name="modelId">Model Id.</param>
        /// <param name="sourceId">Entity type.</param>
        /// <param name="primaryKeys">Primary keys of the records to delete in bulk.</param>
        /// <param name="ct">Cancellation Token.</param>
        public abstract Task DeleteRecordsInBulkAsync(string modelId, string sourceId, JObject primaryKeys, CancellationToken ct = default);

        public abstract Task<IEnumerable<EasySorter>> GetDefaultSortersAsync(string modelId, string sourceId, CancellationToken ct = default);

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