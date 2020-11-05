using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using EasyData.Services;
using EasyData.AspNetCore;

namespace Microsoft.AspNetCore.Builder
{
    public static class EasyDataMiddlewareExtensions
    {

        public static IApplicationBuilder UseEasyData(this IApplicationBuilder app, Action<EasyDataOptions> optionsTuner = null)
        {
            return UseEasyData<EasyDataApiHandler>(app, optionsTuner);
        }

        public static IApplicationBuilder UseEasyData<THandler>(this IApplicationBuilder app, Action<EasyDataOptions> optionsTuner = null) where THandler : EasyDataApiHandler
        {
            var options = new EasyDataOptions(app.ApplicationServices);
            optionsTuner?.Invoke(options);
            return app.UseMiddleware<EasyDataMiddleware<THandler>>(options);
        }
    }
}
