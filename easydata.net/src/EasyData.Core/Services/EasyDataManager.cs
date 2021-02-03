using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace EasyData.Services
{

    public class EasyDataColDesc 
    {
        public string Id { get; set; }

        public string Label { get; set; }

        public DataType Type { get; set; }

        public string AttrId { get; set; }
        public string DisplayFormat { get; set; }
        

    }

    public class EasyDataCol
    {
        public readonly string id;

        public readonly string label;

        public readonly DataType type;

        public readonly string orginAttrId;

        public readonly string dfmt;

        public EasyDataCol(EasyDataColDesc desc)
        {
            id = desc.Id;
            orginAttrId = desc.AttrId;
            label = desc.Label;
            type = desc.Type;
            dfmt = desc.DisplayFormat;
        }
    }

    public class EasyDataRow : List<object>
    {
        public EasyDataRow(IEnumerable<object> collection) : base(collection)
        {
        }
    }


    public class EasyDataResultSet
    {

        public List<EasyDataCol> cols { get;  } = new List<EasyDataCol>();

        public List<EasyDataRow> rows { get; } = new List<EasyDataRow>();
    }
 
    public class EasyDataManagerException: Exception
    {
        public EasyDataManagerException(string message) : base(message)
        { }
    }

    public class EntityNotFoundException : Exception
    {
        public EntityNotFoundException(string entityContainer, string entityKey)
            : base($"Entity with id {entityKey} is not found in container: {entityContainer}")
        { }
    }

    public class ContainerNotFoundException : EasyDataManagerException
    {
        public ContainerNotFoundException(string entityContainer) : base($"Container is not found: {entityContainer}")
        { }
    }

    public abstract class EasyDataManager: IDisposable
    {

        protected readonly IServiceProvider Services;

        protected readonly EasyDataOptions Options;

        protected MetaData Model { get; private set; } = new MetaData();


        public EasyDataManager(IServiceProvider services, EasyDataOptions options)
        {
            Services = services;
            Options = options;
        }

        public async Task<MetaData> GetModelAsync(string modelId)
        {
            if (Model.Id !=modelId) {
                //TODO: Try to load model from cache

                await LoadModelAsync(modelId);
            }

            return Model;
        }


        public abstract Task LoadModelAsync(string modelId);

        public abstract Task<EasyDataResultSet> GetEntitiesAsync(string modelId, string entityContainer, string filter = null, bool isLookup = false, int? offset = null, int? fetch = null);

        public abstract Task<long> GetTotalEntitiesAsync(string modelId, string entityContainer, string filter = null, bool isLookup = false);

        public abstract Task<object> GetEntityAsync(string modelId, string entityContainer, string keyStr);

        public abstract Task<object> CreateEntityAsync(string modelId, string entityContainer, JObject props);

        public abstract Task<object> UpdateEntityAsync(string modelId, string entityContainer, string keyStr, JObject props); 

        public abstract Task DeleteEntityAsync(string modelId, string entityContainer, string keyStr);

        /// <summary>
        /// Releases unmanaged and - optionally - managed resources.
        /// </summary>
        /// <param name="disposing"><c>true</c> to release both managed and unmanaged resources; <c>false</c> to release only unmanaged resources.</param>
        protected virtual void Dispose(bool disposing)
        {
            //no resources to dispose
            //we just have defined this method for derived classes
        }

        /// <summary>
        /// Performs application-defined tasks associated with freeing, releasing, or resetting unmanaged resources.
        /// </summary>
        public void Dispose()
        {
            Dispose(disposing: true);
            GC.SuppressFinalize(this);
        }
    }
}
