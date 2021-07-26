using System;
using System.Collections.Generic;

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
        /// Initializes a new instance of the <see cref="EasyDataOptions"/> class.
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

        /// <summary>
        /// Resolves filter by class for model
        /// </summary>
        /// <param name="filterClass">The filter class.</param>
        /// <param name="model">The model</param>
        /// <returns></returns>
        public EasyFilter ResolveFilter(string filterClass, MetaData model)
        {
            if (!_filterClasses.TryGetValue(filterClass, out var filterType))
                return null;

            return (EasyFilter)Activator.CreateInstance(filterType, model);
        }

        private readonly Dictionary<string, Type> _filterClasses = new Dictionary<string, Type>();

        /// <summary>
        /// 
        /// </summary>
        /// <param name="filterClass"></param>
        /// <param name="filterType"></param>
        public void RegisterFilter(string filterClass, Type filterType)
        {
            if (!typeof(EasyFilter).IsAssignableFrom(filterType))
                throw new ArgumentException($"Filter type should be inherited form '{typeof(EasyFilter)}'");

            _filterClasses[filterClass] = filterType;
        }

        /// <summary>
        /// Registers filter
        /// </summary>
        /// <typeparam name="TFilter">The filter type</typeparam>
        /// <param name="filterClass">The filter class name</param>
        public void RegisterFilter<TFilter>(string filterClass) where TFilter: EasyFilter
        {
            _filterClasses[filterClass] = typeof(TFilter);
        }

        /// <summary>
        /// Gets the model tuner - an action which is called after the model loading and allows to "tune" your model before sending it to the client-side.
        /// </summary>
        /// <value>The model tuner.</value>
        public Action<MetaData> ModelTuner { get; private set; }

        /// <summary>
        /// Defines the model tuner. See more about the model tuner in <see cref="ModelTuner"/> property description
        /// </summary>
        /// <param name="tuner">The model tuner.</param>
        public void UseModelTuner(Action<MetaData> tuner)
        {
            ModelTuner = tuner;
        }

    }
}
