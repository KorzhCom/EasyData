using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using EasyData.Services;

namespace EasyData.AspNetCore
{
    public class EasyDataApiHandler
    {

        /// <summary>
        /// The current HttpContext
        /// </summary>
        protected readonly HttpContext HttpContext;

        /// <summary>
        /// An instance of EasyDatasManager that incapsulates all business logic of EasyData API
        /// </summary>
        protected readonly EasyDataManager Manager;

        /// <summary>
        /// Some options that affects handler's behavior
        /// </summary>
        protected readonly EasyDataOptions Options;

        private static JsonSerializer _jsonSerializer;

        static EasyDataApiHandler()
        {
            _jsonSerializer = new JsonSerializer();
            _jsonSerializer.MaxDepth = 1;
            _jsonSerializer.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
        }


        /// <summary>
        /// Initializes a new instance of the <see cref="EasyDataApiHandler"/> class.
        /// </summary>
        /// <param name="manager">The instance of EasyDataManager that incapsulates all business logic of EasyData API.</param>
        /// <param name="options"> Some options that affects handler's behavior.</param>
        /// <param name="httpContext">The current HttpContext.</param>
        public EasyDataApiHandler(EasyDataManager manager, EasyDataOptions options, HttpContext httpContext)
        {
            Manager = manager;
            Options = options;
            HttpContext = httpContext;
        }

        /// <summary>
        /// Handles the "GetModel" request as an asynchronous operation.
        /// </summary>
        /// <param name="modelId">The model identifier.</param>
        /// <param name="ct">The cancellation token.</param>
        public virtual async Task HandleGetModelAsync(string modelId, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            try {
                var model = await Manager.GetModelAsync(modelId, ct);
                await WriteOkJsonResponseAsync(HttpContext, async (jsonWriter, cancellationToken) => {
                    await WriteGetModelResponseAsync(jsonWriter, model, cancellationToken);
                    await WriteRegisteredExportFormatsAsync(jsonWriter, cancellationToken);
                }, ct);
            }
            catch (EasyDataManagerException ex) {
                HttpContext.Response.StatusCode = StatusCodes.Status404NotFound;
                await WriteErrorJsonResponseAsync(HttpContext, $"Model [{modelId}] not found. \r\nReason:" + ex.Message, ct);
            }
        }

        /// <summary>
        /// Writes the model's content to the JsonWriter.
        /// Can be overriden in the derived classes to write some extra data to the response for GetModel request .
        /// </summary>
        /// <param name="jsonWriter">An instance of JsonWriter.</param>
        /// <param name="model">The data model.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        protected virtual async Task WriteGetModelResponseAsync(JsonWriter jsonWriter, MetaData model, CancellationToken ct)
        {
            await jsonWriter.WritePropertyNameAsync("model", ct);
            await model.WriteToJsonAsync(jsonWriter, MetaDataReadWriteOptions.ClientSideContent, ct);
        }

        protected virtual async Task WriteRegisteredExportFormatsAsync(JsonWriter jsonWriter, CancellationToken ct)
        {
            var exportFormats = EasyDataManager.GetRegisteredExporterFormats();
            await jsonWriter.WritePropertyNameAsync("exportFormats", ct);
            await jsonWriter.WriteStartArrayAsync(ct);
            foreach (var format in exportFormats) {
                await jsonWriter.WriteStartObjectAsync(ct);
                await jsonWriter.WritePropertyNameAsync("name", ct);
                await jsonWriter.WriteValueAsync(format);
                await jsonWriter.WritePropertyNameAsync("type", ct);
                await jsonWriter.WriteValueAsync(EasyDataManager.GetContentTypeByExportFormat(format));
                await jsonWriter.WriteEndObjectAsync(ct);
            }
            await jsonWriter.WriteEndArrayAsync();
        }

        public virtual async Task HandleFetchDatasetAsync(string modelId, string sourceId, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            int? offset = null;
            int? fetch = null;

            bool isLookup = false;

            IEnumerable<EasyFilter> filters = null;

            bool needTotal = false;

            JObject requestParams;
            using (var requestReader = new HttpRequestStreamReader(HttpContext.Request.Body, Encoding.UTF8))
            using (var jsonReader = new JsonTextReader(requestReader)) {
                requestParams = await JObject.LoadAsync(jsonReader, ct);
            }

            if (requestParams.TryGetValue("offset", out var value)) {
                offset = value.ToObject<int?>();
            }
            if (requestParams.TryGetValue("limit", out value)) {
                fetch = value.ToObject<int?>();
            }
            if (requestParams.TryGetValue("needTotal", out value)) {
                needTotal = value.ToObject<bool>();
            }
            if (requestParams.TryGetValue("lookup", out value)) {
                isLookup = value.ToObject<bool>();
            }
            if (requestParams.TryGetValue("filters", out value) && value.HasValues) {
                filters = await GetFiltersAsync(modelId, (JArray)value, ct);
            }

            long? total = null;
            if (needTotal) {
                total = await Manager.GetTotalRecordsAsync(modelId, sourceId, filters, isLookup, ct);
            }

            var sorters = await Manager.GetDefaultSortersAsync(modelId, sourceId);

            var result = await Manager.FetchDatasetAsync(modelId, sourceId, filters, sorters, isLookup, offset, fetch);
            await WriteOkJsonResponseAsync(HttpContext, async (jsonWriter, cancellationToken) => {
                await WriteFetchDatasetResponseAsync(jsonWriter, result, total, cancellationToken);
            }, ct);
        }

        private async Task<IEnumerable<EasyFilter>> GetFiltersAsync(string modelId, JArray jarr, CancellationToken ct)
        {
            var result = new List<EasyFilter>();
            foreach (var filterJson in jarr) {
                var filterClass = filterJson.Value<string>("class");
                var filter = Options.ResolveFilter(filterClass, await Manager.GetModelAsync(modelId));
                if (filter != null) {
                    await filter.ReadFromJsonAsync(filterJson.CreateReader(), ct);
                    result.Add(filter);
                }
            }

            return result;
        }

        protected virtual async Task WriteFetchDatasetResponseAsync(JsonWriter jsonWriter, EasyDataResultSet result, long? total, CancellationToken ct)
        {
            if (total.HasValue) {
                await jsonWriter.WritePropertyNameAsync("meta", ct);
                await jsonWriter.WriteStartObjectAsync(ct);
                {
                    await jsonWriter.WritePropertyNameAsync("totalRecords", ct);
                    await jsonWriter.WriteValueAsync(total.Value, ct);
                }
                await jsonWriter.WriteEndObjectAsync(ct);
            }
            await jsonWriter.WritePropertyNameAsync("resultSet", ct);
            var jObj = JObject.FromObject(result);
            await jObj.WriteToAsync(jsonWriter, ct);
        }

        public virtual async Task HandleFetchRecordAsync(string modelId, string sourceId, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            var query = HttpContext.Request.Query;
            var keys = query.Keys.ToDictionary(
                k => k,
                k => query[k].ToString());

            var result = await Manager.FetchRecordAsync(modelId, sourceId, keys);
            await WriteOkJsonResponseAsync(HttpContext, async (jsonWriter, cancellationToken) => {
                await WriteFetchRecordResponseAsync(jsonWriter, result, cancellationToken);
            }, ct);
        }

        protected virtual JObject ToJObject(object entity)
        {
            return JObject.FromObject(entity, _jsonSerializer);
        }

        protected virtual async Task WriteFetchRecordResponseAsync(JsonWriter jsonWriter, object entity, CancellationToken ct)
        {
            var jObj = ToJObject(entity);
            await jsonWriter.WritePropertyNameAsync("record", ct);
            await jObj.WriteToAsync(jsonWriter, ct);
        }

        public virtual async Task HandleCreateRecordAsync(string modelId, string sourceId, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            using (var reader = new HttpRequestStreamReader(HttpContext.Request.Body, Encoding.UTF8))
            using (var jsReader = new JsonTextReader(reader)) {
                var props = await JObject.LoadAsync(jsReader);
                var result = await Manager.CreateRecordAsync(modelId, sourceId, props);
                await WriteOkJsonResponseAsync(HttpContext, async (jsonWriter, cancellationToken) => {
                    await WriteCreateRecordResponseAsync(jsonWriter, result, ct);
                }, ct);
            }
        }

        protected virtual async Task WriteCreateRecordResponseAsync(JsonWriter jsonWriter, object entity, CancellationToken ct)
        {
            var jObj = ToJObject(entity);
            await jsonWriter.WritePropertyNameAsync("record", ct);
            await jObj.WriteToAsync(jsonWriter, ct);
        }

        public virtual async Task HandleUpdateRecordAsync(string modelId, string sourceId, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            using (var reader = new HttpRequestStreamReader(HttpContext.Request.Body, Encoding.UTF8))
            using (var jsReader = new JsonTextReader(reader)) {
                var props = await JObject.LoadAsync(jsReader);
                var result = await Manager.UpdateRecordAsync(modelId, sourceId, props, ct);
                await WriteOkJsonResponseAsync(HttpContext, async (jsonWriter, cancellationToken) => {
                    await WriteUpdateRecordResponseAsync(jsonWriter, result, cancellationToken);
                }, ct);
            }
        }

        protected virtual async Task WriteUpdateRecordResponseAsync(JsonWriter jsonWriter, object entity, CancellationToken ct)
        {
            ct.ThrowIfCancellationRequested();

            var jObj = ToJObject(entity);
            await jsonWriter.WritePropertyNameAsync("record", ct);
            await jObj.WriteToAsync(jsonWriter, ct);
        }

        public virtual async Task HandleDeleteRecordAsync(string modelId, string sourceId, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            using (var reader = new HttpRequestStreamReader(HttpContext.Request.Body, Encoding.UTF8))
            using (var jsReader = new JsonTextReader(reader)) {
                var props = await JObject.LoadAsync(jsReader);
                await Manager.DeleteRecordAsync(modelId, sourceId, props, ct);
                await WriteOkJsonResponseAsync(HttpContext, async (jsonWriter, cancellationToken) => {
                    await WriteDeleteRecordResponseAsync(jsonWriter, cancellationToken);
                }, ct);
            }          
        }

        protected virtual Task WriteDeleteRecordResponseAsync(JsonWriter jsonWriter, CancellationToken ct)
        {
            return Task.CompletedTask;
        }

        public virtual async Task HandleExportDatasetAsync(string modelId, string sourceId, string formatType, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            HttpContext.Response.StatusCode = StatusCodes.Status200OK;
            HttpContext.Response.ContentType = EasyDataManager.GetContentTypeByExportFormat(formatType);

            var resultFileName = $"{sourceId}.{GetFileExtentionByContentType(HttpContext.Response.ContentType)}";
            HttpContext.Response.Headers.Add("Content-Disposition",
                string.Format("attachment; filename=\"{0}\"", resultFileName));

            var resultSet = await Manager.FetchDatasetAsync(modelId, sourceId, ct: ct);
            await Manager.ExportDatasetAsync(resultSet, formatType, HttpContext.Response.Body, ct);
        }

        /// <summary>
        /// Handles exceptions that might occur inside any other EasyData API request handler.
        /// If the writing to the response content has not started it returns a response with 400 code and the error message.
        /// </summary>
        /// <param name="ex">The ex.</param>
        /// <param name="ct">The cancellation token.</param>
        public virtual async Task HandleExceptionAsync(Exception ex, CancellationToken ct = default)
        {
            if (HttpContext.Response.HasStarted) {
                throw ex;
            }

            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;

            if (ex is ContainerNotFoundException || ex is RecordNotFoundException)
                HttpContext.Response.StatusCode = StatusCodes.Status404NotFound;

            await WriteErrorJsonResponseAsync(HttpContext, ex.InnerException?.Message ?? ex.Message, ct);
            return;
        }


        private static Encoding _utf8NoBom = new UTF8Encoding(false);

        /// <summary>
        /// Writes a response in JSON format.
        /// This function creates a HttpResponseStreamWriter and invokes the callback function which actually does the job.
        /// </summary>
        /// <param name="context">The HTTP context.</param>
        /// <param name="result">The value of result property in the response object (either "ok" or any other string).</param>
        /// <param name="writeContentAction">The function that actually writes the content.</param>
        /// <param name="ct">The cancellation token.</param>
        protected static async Task WriteJsonResponseAsync(HttpContext context, string result, Func<JsonWriter, CancellationToken, Task> writeContentAction, CancellationToken ct)
        {
            context.Response.ContentType = "application/json; charset=utf-8";
            using (var responseWriter = new HttpResponseStreamWriter(context.Response.Body, _utf8NoBom)) {
                using (JsonWriter jsonWriter = new JsonTextWriter(responseWriter)) {
                    await jsonWriter.WriteStartObjectAsync(ct);
                    await jsonWriter.WritePropertyNameAsync("result", ct);
                    await jsonWriter.WriteValueAsync(result, ct);
                    if (writeContentAction != null) {
                        await writeContentAction(jsonWriter, ct);
                    }
                    await jsonWriter.WriteEndObjectAsync(ct);
                    await jsonWriter.FlushAsync(ct);
                    await jsonWriter.CloseAsync(ct);
                }
            }
        }

        /// <summary>
        /// Writes an OK response in JSON format.
        /// This function actually calls <see cref="WriteJsonResponseAsync"/> with "ok" value for the "result" parameter.
        /// </summary>
        /// <param name="context">The HTTP context.</param>
        /// <param name="writeContentAction">The function that actually writes the content.</param>
        /// <param name="ct">The cancellation token.</param>
        protected static async Task WriteOkJsonResponseAsync(HttpContext context, Func<JsonWriter, CancellationToken, Task> writeContentAction, CancellationToken ct)
        {
            await WriteJsonResponseAsync(context, "ok", writeContentAction, ct);
        }

        /// <summary>
        /// Writes an ERROR response in JSON format.
        /// This function actually calls <see cref="WriteJsonResponseAsync" /> with "error" value for the "result" parameter.
        /// It also writes a "message" property to the response object with the value passed in "errorMessage" parameter.
        /// </summary>
        /// <param name="context">The HTTP context.</param>
        /// <param name="errorMessage">The error message.</param>
        /// <param name="ct">The cancellation token.</param>
        protected static async Task WriteErrorJsonResponseAsync(HttpContext context, string errorMessage, CancellationToken ct)
        {
            await WriteJsonResponseAsync(context, "error", async (jsonWriter, cancellationToken) => {
                await jsonWriter.WritePropertyNameAsync("message", cancellationToken);
                await jsonWriter.WriteValueAsync(errorMessage, cancellationToken);
            }, ct);
        }

        /// <summary>
        /// Gets the file extention by the content type.
        /// </summary>
        /// <param name="contentType">Content type (e.g. application/msword).</param>
        /// <returns>System.String.</returns>
        protected virtual string GetFileExtentionByContentType(string contentType)
        {
            if (contentType.StartsWith("application")) {
                var subType = contentType.Substring("application".Length + 1);
                if (subType == "vnd.ms-excel") {
                    return "xls";
                }
                else if (subType == "vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                    return "xlsx";
                }
                else if (subType == "msword") {
                    return "doc";
                }

                return subType;
            }
            else if (contentType.StartsWith("text")) {
                return contentType.Substring("text".Length + 1);
            }

            return "txt";
        }
    }
}