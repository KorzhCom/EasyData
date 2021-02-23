using System;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using EasyData.Services;
using System.Web;

namespace EasyData.AspNetCore
{

    public static class DataAction 
    {
        public const string GetModel = "GetModel";
        public const string GetEntity = "GetEntity";
        public const string GetEntities = "GetEntities";
        public const string CreateEntity = "CreateEntity";
        public const string UpdateEntity = "UpdateEntity";
        public const string DeleteEntity = "DeleteEntity";
    }

    public class EasyDataMiddleware<THandler> where THandler: EasyDataApiHandler
    {
        private readonly RequestDelegate _next;
        private HttpContext _context;
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
                new Endpoint(DataAction.GetEntities, @"^/models/([^/]+?)/crud/([^/]+?)/fetch$", "POST"),
                new Endpoint(DataAction.GetEntity, @"^/models/([^/]+?)/crud/([^/]+?)/fetch/([^/]+?)$", "GET"),
                new Endpoint(DataAction.CreateEntity, @"^/models/([^/]+?)/crud/([^/]+?)/create$", "POST"),
                new Endpoint(DataAction.UpdateEntity,@"^/models/([^/]+?)/crud/([^/]+?)/update/([^/]+?)$", "POST"),
                new Endpoint(DataAction.DeleteEntity, @"^/models/([^/]+?)/crud/([^/]+?)/delete/([^/]+?)$", "POST")
            };

        public EasyDataMiddleware(RequestDelegate next, EasyDataOptions options)
        {
            _next = next;
            _options = options;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            _context = context;

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
                var entityId = "";

                foreach (var route in _routing) {
                    var matches = route.Regex.Matches(actionUrl);
                    if (matches.Count == 1 && context.Request.Method.ToUpper() == route.Method) {
                        modelId = matches[0].Groups[1].Value;
                        if (matches[0].Groups.Count > 2) {
                            entityTypeName = matches[0].Groups[2].Value;
                        }
                        if (matches[0].Groups.Count > 3) {
                            entityId = matches[0].Groups[3].Value;
                        }
                        action = route.Action;
                        break;
                    }
                }


                if (!string.IsNullOrEmpty(action)) {

                    var manager = _options.ManagerResolver(_context.RequestServices, _options);
                    var handler = (THandler)Activator.CreateInstance(typeof(THandler), manager, _options, context);

                    try {
                        switch (action) {
                            case DataAction.GetModel:
                                await handler.HandleGetModelAsync(modelId);
                                return;
                            case DataAction.GetEntity:
                                await handler.HandleGetEntityAsync(modelId, entityTypeName, entityId);
                                return;
                            case DataAction.GetEntities:
                                await handler.HandleGetEntitiesAsync(modelId, entityTypeName);
                                return;
                            case DataAction.CreateEntity:
                                await handler.HandleCreateEntityAsync(modelId, entityTypeName);
                                return;
                            case DataAction.UpdateEntity:
                                await handler.HandleUpdateEntityAsync(modelId, entityTypeName, entityId);
                                return;
                            case DataAction.DeleteEntity:
                                await handler.HandleDeleteEntityAsync(modelId, entityTypeName, entityId);
                                return;
                        }
                    }
                    catch (Exception ex) {
                        await handler.HandleExceptionAsync(ex);
                        return;
                    }
                }
            }

            await _next(context);
        }
    }
}
