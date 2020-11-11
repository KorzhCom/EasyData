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

            var pipeline = builder.CreateApplicationBuilder()
                    .UseMiddleware<EasyDataMiddleware<THandler>>(options)
                    .Build();

            return builder.Map(pattern, pipeline)
                          .WithDisplayName("EasyData API");
        }
    }
}
