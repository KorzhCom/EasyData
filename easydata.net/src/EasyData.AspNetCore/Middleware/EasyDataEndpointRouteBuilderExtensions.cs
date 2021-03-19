using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Routing.Patterns;

using EasyData.AspNetCore;
using EasyData.Services;

namespace Microsoft.AspNetCore.Builder
{
    public static class EasyDataEndpointRouteBuilderExtensions
    {
        public static IEndpointConventionBuilder MapEasyData(
            this IEndpointRouteBuilder builder, 
            Action<EasyDataOptions> optionsTuner = null)
        {
            return MapEasyData<EasyDataApiHandler>(builder, optionsTuner);
        }


        public static IEndpointConventionBuilder MapEasyData<THandler>(
            this IEndpointRouteBuilder builder, 
            Action<EasyDataOptions> optionsTuner = null) where THandler : EasyDataApiHandler
        {
            var options = new EasyDataOptions(builder.ServiceProvider);
            optionsTuner?.Invoke(options);

            options.Endpoint = options.Endpoint.ToString().TrimEnd('/');

            var pattern = RoutePatternFactory.Parse(options.Endpoint + "/{**slug}");

            var app = builder.CreateApplicationBuilder();
            app.UseMiddleware<EasyDataMiddleware<THandler>>(options);

            // return 404 if the request was not processed by EasyDataMiddleware 
            // to prevent the exception on reaching the end of pipeline
            app.Run(context =>
            {
                context.Response.StatusCode = 404;
                return Task.CompletedTask;
            });

            return builder.Map(pattern, app.Build())
                          .WithDisplayName("EasyData API");
        }
    }
}
