using System;
using System.Collections.Generic;
using System.Text;

namespace EasyData.Services
{
    public delegate EasyDataManager EasyDataManagerResolver(IServiceProvider services, EasyDataOptions options);

    public class EasyDataOptions
    {
        public string Endpoint { get; set; } = "/api/easydata";

        public EasyDataManagerResolver ManagerResolver {get; private set;}

        /// <summary>
        /// Defines the function which creates and returns an instance of EasyQuery manager. 
        /// The manager defines all basic operations with the models and queries: creating, loading, saving and query building itself.
        /// </summary>
        /// <param name="managerResolver">The manager resolver.</param>
        public void UseManager(EasyDataManagerResolver managerResolver)
        {
            ManagerResolver = managerResolver;
        }

        /// <summary>
        /// Defines the function which creates and returns an instance of EasyData manager. 
        /// The manager defines all basic operations with the models and queries: creating, loading, saving and query building itself.
        /// </summary>
        /// <typeparam name="TEDManager"></typeparam>
        public void UseManager<TEDManager>() where TEDManager : EasyDataManager
        {
            UseManager((services, options) => (TEDManager)Activator.CreateInstance(typeof(TEDManager), services, options));
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="EasyQueryOptions"/> class.
        /// </summary>
        /// <param name="services">The DI services.</param>
        public EasyDataOptions(IServiceProvider services)
        {
           
        }

        /// <summary>
        /// Gets or sets the options builder for metadata loader.
        /// This action will be called before metadata loader creation to adjust the options passed to it
        /// </summary>
        /// <value>The options builder for metadata loader.</value>
        public Action<object> MetaDataLoaderOptionsBuilder { get; set; }
    }
}
