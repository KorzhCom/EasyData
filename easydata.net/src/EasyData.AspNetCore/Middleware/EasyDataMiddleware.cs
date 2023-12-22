using System;
using System.Web;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using EasyData.Services;

namespace EasyData.AspNetCore
{

    public static class DataAction 
    {
        public const string GetModel = "GetModel";
        public const string FetchRecord = "FetchRecord";
        public const string FetchDataset = "FetchDataset";
        public const string CreateRecord = "CreateRecord";
        public const string UpdateRecord = "UpdateRecord";
        public const string DeleteRecord = "DeleteRecord";
        public const string DeleteRecordsInBulk = "DeleteRecordsInBulk";
    }

    public class EasyDataMiddleware<THandler> where THandler: EasyDataApiHandler
    {
        private readonly RequestDelegate _next;
        private readonly EasyDataOptions _options;

        private struct Endpoint
        {
            public readonly string Action;
            public readonly Regex Regex;
            public readonly string Method;

            public Endpoint(string action, string regex, string method)
            {
                Action = action;
                Regex = new Regex(regex);
                Method = method;
            }
        }

        private static readonly Endpoint[] _routing =
            {
                new Endpoint(DataAction.GetModel, @"^/models/([^/]+?)$", "GET"),
                new Endpoint(DataAction.FetchDataset, @"^/models/([^/]+?)/sources/([^/]+?)/fetch$", "POST"),
                new Endpoint(DataAction.FetchRecord, @"^/models/([^/]+?)/sources/([^/]+?)/fetch$", "GET"),
                new Endpoint(DataAction.CreateRecord, @"^/models/([^/]+?)/sources/([^/]+?)/create$", "POST"),
                new Endpoint(DataAction.UpdateRecord,@"^/models/([^/]+?)/sources/([^/]+?)/update$", "POST"),
                new Endpoint(DataAction.DeleteRecord, @"^/models/([^/]+?)/sources/([^/]+?)/delete$", "POST"),
                new Endpoint(DataAction.DeleteRecordsInBulk, @"^/models/([^/]+?)/sources/([^/]+?)/bulk-delete", "POST")
            };

        public EasyDataMiddleware(RequestDelegate next, EasyDataOptions options)
        {
            _next = next;
            _options = options;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path;
            if (path.StartsWithSegments(_options.Endpoint, out var command) && !string.IsNullOrEmpty(command)) {
                if (_options.ManagerResolver == null)
                {
                    throw new EasyDataManagerException("EasyDataManagerResolver is not defined.\n" +
                                    "You possibly forgot to add UseManager at EasyData Middleware options");
                }

                var actionUrl = HttpUtility.UrlDecode(command.ToString());
                var action = "";
                var modelId = "";
                var entityTypeName = "";

                foreach (var route in _routing) {
                    var matches = route.Regex.Matches(actionUrl);
                    if (matches.Count == 1 && context.Request.Method.ToUpper() == route.Method) {
                        modelId = matches[0].Groups[1].Value;
                        if (matches[0].Groups.Count > 2) {
                            entityTypeName = matches[0].Groups[2].Value;
                        }
                        action = route.Action;
                        break;
                    }
                }

                if (!string.IsNullOrEmpty(action)) {

                    var manager = _options.ManagerResolver(context.RequestServices, _options);
                    var handler = (THandler)Activator.CreateInstance(typeof(THandler), manager, _options, context);

                    var ct = context.RequestAborted;

                    try {
                        switch (action) {
                            case DataAction.GetModel:
                                await handler.HandleGetModelAsync(modelId, ct);
                                return;
                            case DataAction.FetchRecord:
                                await handler.HandleFetchRecordAsync(modelId, entityTypeName, ct);
                                return;
                            case DataAction.FetchDataset:
                                await handler.HandleFetchDatasetAsync(modelId, entityTypeName, ct);
                                return;
                            case DataAction.CreateRecord:
                                await handler.HandleCreateRecordAsync(modelId, entityTypeName, ct);
                                return;
                            case DataAction.UpdateRecord:
                                await handler.HandleUpdateRecordAsync(modelId, entityTypeName, ct);
                                return;
                            case DataAction.DeleteRecord:
                                await handler.HandleDeleteRecordAsync(modelId, entityTypeName, ct);
                                return;
                            case DataAction.DeleteRecordsInBulk:
                                await handler.HandleDeleteRecordsInBulkAsync(modelId, entityTypeName, ct);
                                return;
                        }
                    }
                    catch (Exception ex) {
                        await handler.HandleExceptionAsync(ex, ct);
                        return;
                    }
                }
            }

            await _next(context);
        }
    }
}
