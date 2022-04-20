using System;
using System.IO;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Newtonsoft.Json.Linq;
using EasyData.Export;

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

        public abstract Task<IEnumerable<EasySorter>> GetDefaultSortersAsync(string modelId, string sourceId, CancellationToken ct = default);

        public async Task ExportDatasetAsync(EasyDataResultSet resultSet, string format, Stream stream, CancellationToken ct = default)
        {
            var exporter = GetExporterByFormat(format) ?? throw new EasyDataManagerException("Can't find exporter for format type: " + format);
            await exporter.ExportAsync(resultSet, stream, ct);
        }

        internal static void RegisterExporter(string format, IDataExporter exporter)
            => _dataExporters[format] = exporter;

        private static Dictionary<string, IDataExporter> _dataExporters = new Dictionary<string, IDataExporter>();

        protected static IDataExporter GetExporterByFormat(string format)
            => _dataExporters.TryGetValue(format, out var exporter) ? exporter : null;

        /// <summary>
        /// Returns registered exporter types
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<string> GetRegisteredExporterFormats()
            => _dataExporters.Keys;

        /// <summary>
        /// Gets the content type by export format.
        /// </summary>
        /// <param name="format">The format of exporting (like "csv" or "excel-html").</param>
        /// <returns>A string which represents the MIME content type (e.g. "application/json" or "text/plain")</returns>
        public static string GetContentTypeByExportFormat(string format)
        {
            var exporter = GetExporterByFormat(format);
            return exporter != null ? exporter.GetContentType() : "text/plain";
        }

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