using Microsoft.Extensions.DependencyInjection;
using EasyData.Export;

namespace EasyData.Services
{
    /// <summary>
    /// A special class which is used during EasyQuery services registration in DI.
    /// </summary>
    public class EasyDataServicesBuilder
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="EasyQueryServicesBuilder"/> class.
        /// </summary>
        /// <param name="services">The services.</param>
        public EasyDataServicesBuilder(IServiceCollection services)
        {
            Services = services;
        }

        /// <summary>
        /// Gets the DI services.
        /// </summary>
        /// <value>The DI services.</value>
        public readonly IServiceCollection Services;


        public EasyDataServicesBuilder AddDataExporter<T>(string format) where T: IDataExporter, new()
        {
            EasyDataManager.RegisterExporter(format, new T());
            return this;
        }
    }
}
