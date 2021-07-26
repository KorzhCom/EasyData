using System;
using System.Collections.Generic;
using System.Text;
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
            try {
                var model = await Manager.GetModelAsync(modelId, ct);
                model.Id = "EasyData";
                await WriteOkJsonResponseAsync(HttpContext, async (jsonWriter, cancellationToken) => {
                    await WriteGetModelResponseAsync(jsonWriter, model, cancellationToken);
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

        public virtual async Task HandleGetEntitiesAsync(string modelId, string entityContainer, CancellationToken ct = default)
        {
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
                total = await Manager.GetTotalEntitiesAsync(modelId, entityContainer, filters, isLookup, ct);
            }

            var sorters = await Manager.GetDefaultSortersAsync(modelId, entityContainer);

            var result = await Manager.GetEntitiesAsync(modelId, entityContainer, filters, sorters, isLookup, offset, fetch);
            await WriteOkJsonResponseAsync(HttpContext, async (jsonWriter, cancellationToken) => {
                await WriteGetEntitiesResponseAsync(jsonWriter, result, total, cancellationToken);
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

     
        protected virtual async Task WriteGetEntitiesResponseAsync(JsonWriter jsonWriter, EasyDataResultSet result, long? total, CancellationToken ct)
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

        public virtual async Task HandleGetEntityAsync(string modelId, string entityContainer, string keyStr, CancellationToken ct = default)
        {
            var result = await Manager.GetEntityAsync(modelId, entityContainer, keyStr);
            await WriteOkJsonResponseAsync(HttpContext, async (jsonWriter, cancellationToken) => {
                await WriteGetEntityResponseAsync(jsonWriter, result, cancellationToken);
            }, ct);
        }

        protected virtual async Task WriteGetEntityResponseAsync(JsonWriter jsonWriter, object entity, CancellationToken ct)
        {
            var jObj = JObject.FromObject(entity);
            await jsonWriter.WritePropertyNameAsync("entity", ct);
            await jObj.WriteToAsync(jsonWriter, ct);
        }

        public virtual async Task HandleCreateEntityAsync(string modelId, string entityContainer, CancellationToken ct = default)
        {
            using (var reader = new HttpRequestStreamReader(HttpContext.Request.Body, Encoding.UTF8))
            using (var jsReader = new JsonTextReader(reader)) 
            {
                var props = await JObject.LoadAsync(jsReader);
                var result = await Manager.CreateEntityAsync(modelId, entityContainer, props);
                await WriteOkJsonResponseAsync(HttpContext, async (jsonWriter, cancellationToken) => {
                    await WriteCreateEntityResponseAsync(jsonWriter, result, ct);
                }, ct);
            }
        }

        protected virtual async Task WriteCreateEntityResponseAsync(JsonWriter jsonWriter, object entity, CancellationToken ct)
        {
            var jObj = JObject.FromObject(entity);
            await jsonWriter.WritePropertyNameAsync("entity", ct);
            await jObj.WriteToAsync(jsonWriter, ct);
        }

        public virtual async Task HandleUpdateEntityAsync(string modelId, string entityContainer, string keyStr, CancellationToken ct = default)
        {
            using (var reader = new HttpRequestStreamReader(HttpContext.Request.Body, Encoding.UTF8))
            using (var jsReader = new JsonTextReader(reader)) {
                var props = await JObject.LoadAsync(jsReader);
                var result = await Manager.UpdateEntityAsync(modelId, entityContainer, keyStr, props, ct);
                await WriteOkJsonResponseAsync(HttpContext, async (jsonWriter, cancellationToken) => {
                    await WriteUpdateEntityResponseAsync(jsonWriter, result, cancellationToken);
                }, ct);
            }
        }

        protected virtual async Task WriteUpdateEntityResponseAsync(JsonWriter jsonWriter, object entity, CancellationToken ct)
        {
            var jObj = JObject.FromObject(entity);
            await jsonWriter.WritePropertyNameAsync("entity", ct);
            await jObj.WriteToAsync(jsonWriter, ct);
        }

        public virtual async Task HandleDeleteEntityAsync(string modelId, string entityContainer, string keyStr, CancellationToken ct = default)
        {
            await Manager.DeleteEntityAsync(modelId, entityContainer, keyStr, ct);
            await WriteOkJsonResponseAsync(HttpContext, async (jsonWriter, cancellationToken) => {
                await WriteDeleteEntityResponseAsync(jsonWriter, cancellationToken);
            }, ct);
        }
        
        protected virtual Task WriteDeleteEntityResponseAsync(JsonWriter jsonWriter, CancellationToken ct)
        {
            return Task.CompletedTask;
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

            if (ex is ContainerNotFoundException || ex is EntityNotFoundException)
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
                using (JsonWriter jsonWriter = new JsonTextWriter(responseWriter)){
                    await jsonWriter.WriteStartObjectAsync(ct);
                    await jsonWriter.WritePropertyNameAsync("result", ct);
                    await jsonWriter.WriteValueAsync(result, ct);
                    if (writeContentAction != null) {
                        await writeContentAction(jsonWriter, ct);
                    }
                    await jsonWriter.WriteEndObjectAsync(ct);
                    await jsonWriter.FlushAsync(ct);
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
    }
}