using System;
using System.Collections.Generic;
using System.Text;
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
        public virtual async Task HandleGetModelAsync(string modelId)
        {
            try {
                var model = await Manager.GetModelAsync(modelId);
                model.Id = "EasyData";
                await WriteOkJsonResponseAsync(HttpContext, async jsonWriter => {
                    await WriteGetModelResponseAsync(jsonWriter, model);
                });
            }
            catch (EasyDataManagerException ex) {
                HttpContext.Response.StatusCode = StatusCodes.Status404NotFound;
                await WriteErrorJsonResponseAsync(HttpContext, $"Model [{modelId}] not found. \r\nReason:" + ex.Message);
            }
        }

        /// <summary>
        /// Writes the model's content to the JsonWriter.
        /// Can be overriden in the derived classes to write some extra data to the response for GetModel request .
        /// </summary>
        /// <param name="jsonWriter">An instance of JsonWriter.</param>
        /// <param name="model">The data model.</param>
        /// <returns>Task.</returns>
        protected virtual async Task WriteGetModelResponseAsync(JsonWriter jsonWriter, MetaData model)
        {
            await jsonWriter.WritePropertyNameAsync("model");
            await model.WriteToJsonAsync(jsonWriter, MetaDataReadWriteOptions.ClientSideContent);
        }

        public virtual async Task HandleGetEntitiesAsync(string modelId, string entityContainer)
        {
            int? offset = null;
            int? fetch = null;

            bool isLookup = false;

            string filter = null;

            bool needTotal = false;
            var queryParams = HttpContext.Request.Query;
            if (queryParams.TryGetValue("offset", out var value)) {
                offset = int.Parse(value);
            }
            if (queryParams.TryGetValue("limit", out value)) {
                fetch = int.Parse(value);
            }
            if (queryParams.TryGetValue("needTotal", out value)) {
                needTotal = bool.Parse(value);
            }
            if (queryParams.TryGetValue("filter", out value)) {
                filter = value;
            }
            if (queryParams.TryGetValue("lookup", out value)) {
                isLookup = bool.Parse(value);
            }

            long? total = null;
            if (needTotal) {
                total = await Manager.GetTotalEntitiesAsync(modelId, entityContainer, filter, isLookup);
            }

            var result = await Manager.GetEntitiesAsync(modelId, entityContainer, filter, isLookup, offset, fetch);
            await WriteOkJsonResponseAsync(HttpContext, async jsonWriter => {
                await WriteGetEntitiesResponseAsync(jsonWriter, result, total);
            });
        }

        protected virtual async Task WriteGetEntitiesResponseAsync(JsonWriter jsonWriter, EasyDataResultSet result, long? total)
        {
            if (total.HasValue) {
                await jsonWriter.WritePropertyNameAsync("meta");
                await jsonWriter.WriteStartObjectAsync();
                {
                    await jsonWriter.WritePropertyNameAsync("totalRecords");
                    await jsonWriter.WriteValueAsync(total.Value);
                }
                await jsonWriter.WriteEndObjectAsync();
            }
            await jsonWriter.WritePropertyNameAsync("resultSet");
            var jObj = JObject.FromObject(result);
            await jObj.WriteToAsync(jsonWriter);
        }

        public virtual async Task HandleGetEntityAsync(string modelId, string entityContainer, string keyStr)
        {
            var result = await Manager.GetEntityAsync(modelId, entityContainer, keyStr);
            await WriteOkJsonResponseAsync(HttpContext, async jsonWriter => {
                await WriteGetEntityResponseAsync(jsonWriter, result);
            });
        }

        protected virtual async Task WriteGetEntityResponseAsync(JsonWriter jsonWriter, object entity)
        {
            var jObj = JObject.FromObject(entity);
            await jsonWriter.WritePropertyNameAsync("entity");
            await jObj.WriteToAsync(jsonWriter);
        }

        public virtual async Task HandleCreateEntityAsync(string modelId, string entityContainer)
        {
            using (var reader = new HttpRequestStreamReader(HttpContext.Request.Body, Encoding.UTF8))
            using (var jsReader = new JsonTextReader(reader)) 
            {
                var props = await JObject.LoadAsync(jsReader);
                var result = await Manager.CreateEntityAsync(modelId, entityContainer, props);
                await WriteOkJsonResponseAsync(HttpContext, async jsonWriter => {
                    await WriteCreateEntityResponseAsync(jsonWriter, result);
                });
            }
        }

        protected virtual async Task WriteCreateEntityResponseAsync(JsonWriter jsonWriter, object entity)
        {
            var jObj = JObject.FromObject(entity);
            await jsonWriter.WritePropertyNameAsync("entity");
            await jObj.WriteToAsync(jsonWriter);
        }

        public virtual async Task HandleUpdateEntityAsync(string modelId, string entityContainer, string keyStr)
        {
            using (var reader = new HttpRequestStreamReader(HttpContext.Request.Body, Encoding.UTF8))
            using (var jsReader = new JsonTextReader(reader))
            {
                var props = await JObject.LoadAsync(jsReader);
                var result = await Manager.UpdateEntityAsync(modelId, entityContainer, keyStr, props);
                await WriteOkJsonResponseAsync(HttpContext, async jsonWriter => {
                    await WriteUpdateEntityResponseAsync(jsonWriter, result);
                });
            }
        }

        protected virtual async Task WriteUpdateEntityResponseAsync(JsonWriter jsonWriter, object entity)
        {
            var jObj = JObject.FromObject(entity);
            await jsonWriter.WritePropertyNameAsync("entity");
            await jObj.WriteToAsync(jsonWriter);
        }

        public virtual async Task HandleDeleteEntityAsync(string modelId, string entityContainer, string keyStr)
        {
            await Manager.DeleteEntityAsync(modelId, entityContainer, keyStr);
            await WriteOkJsonResponseAsync(HttpContext, async jsonWriter => {
                await WriteDeleteEntityResponseAsync(jsonWriter);
            });
        }
        
        protected virtual Task WriteDeleteEntityResponseAsync(JsonWriter jsonWriter)
        {
            return Task.CompletedTask;
        }

        /// <summary>
        /// Handles exceptions that might occur inside any other EasyData API request handler.
        /// If the writing to the response content has not started it returns a response with 400 code and the error message.
        /// </summary>
        /// <param name="ex">The ex.</param>
        public virtual async Task HandleExceptionAsync(Exception ex)
        {
            if (HttpContext.Response.HasStarted) {
                throw ex;
            }

            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;

            if (ex is ContainerNotFoundException || ex is EntityNotFoundException)
                HttpContext.Response.StatusCode = StatusCodes.Status404NotFound;

            await WriteErrorJsonResponseAsync(HttpContext, ex.InnerException?.Message ?? ex.Message);
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
        protected static async Task WriteJsonResponseAsync(HttpContext context, string result, Func<JsonWriter, Task> writeContentAction)
        {
            context.Response.ContentType = "application/json; charset=utf-8";
            using (var responseWriter = new HttpResponseStreamWriter(context.Response.Body, _utf8NoBom)) {
                using (JsonWriter jsonWriter = new JsonTextWriter(responseWriter)){
                    await jsonWriter.WriteStartObjectAsync();
                    await jsonWriter.WritePropertyNameAsync("result");
                    await jsonWriter.WriteValueAsync(result);
                    if (writeContentAction != null) {
                        await writeContentAction(jsonWriter);
                    }
                    await jsonWriter.WriteEndObjectAsync();
                    await jsonWriter.FlushAsync();
                }
            }
        }

        /// <summary>
        /// Writes an OK response in JSON format.
        /// This function actually calls <see cref="WriteJsonResponseAsync"/> with "ok" value for the "result" parameter.
        /// </summary>
        /// <param name="context">The HTTP context.</param>
        /// <param name="writeContentAction">The function that actually writes the content.</param>
        protected static async Task WriteOkJsonResponseAsync(HttpContext context, Func<JsonWriter, Task> writeContentAction)
        {
            await WriteJsonResponseAsync(context, "ok", writeContentAction);
        }

        /// <summary>
        /// Writes an ERROR response in JSON format.
        /// This function actually calls <see cref="WriteJsonResponseAsync" /> with "error" value for the "result" parameter.
        /// It also writes a "message" property to the response object with the value passed in "errorMessage" parameter.
        /// </summary>
        /// <param name="context">The HTTP context.</param>
        /// <param name="errorMessage">The error message.</param>
        protected static async Task WriteErrorJsonResponseAsync(HttpContext context, string errorMessage)
        {
            await WriteJsonResponseAsync(context, "error", async jsonWriter => {
                await jsonWriter.WritePropertyNameAsync("message");
                await jsonWriter.WriteValueAsync(errorMessage);
            });
        }
    }
}
