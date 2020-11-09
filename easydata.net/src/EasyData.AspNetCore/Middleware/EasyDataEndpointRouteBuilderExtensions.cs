using System;

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
            string endpoint = "/api/easydata", 
            Action<EasyDataOptions> optionsTuner = null)
        {
            return MapEasyData<EasyDataApiHandler>(builder, endpoint, optionsTuner);
        }


        public static IEndpointConventionBuilder MapEasyData<THandler>(
            this IEndpointRouteBuilder builder, 
            string endpoint = "/api/easydata", 
            Action<EasyDataOptions> optionsTuner = null) where THandler : EasyDataApiHandler
        {
            endpoint = endpoint.ToString().TrimEnd('/');

            var pattern = RoutePatternFactory.Parse(endpoint + "/{**slug}");

            var options = new EasyDataOptions(builder.ServiceProvider);
            optionsTuner?.Invoke(options);

            options.Endpoint = endpoint;

            var pipeline = builder.CreateApplicationBuilder()
                    .UseMiddleware<EasyDataMiddleware<THandler>>(options)
                    .Build();

            return builder.Map(pattern, pipeline)
                          .WithDisplayName("EasyData API");
        }
    }
}
