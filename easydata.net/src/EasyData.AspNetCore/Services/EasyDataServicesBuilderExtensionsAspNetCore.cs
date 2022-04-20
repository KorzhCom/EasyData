using EasyData.Services;

namespace Microsoft.Extensions.DependencyInjection
{

    public static class EasyDataServicesBuilderAspNetCoreExtensions
    {
        /// <summary>
        /// Registers EasyQuery services in the DI container.
        /// </summary>
        /// <param name="services">The <see cref="Microsoft.Extensions.DependencyInjection.IServiceCollection"/> to add services to.</param>
        public static EasyDataServicesBuilder AddEasyData(this IServiceCollection services)
        {
            var builder = new EasyDataServicesBuilder(services);
            return builder;
        }
    }
}
