using System.Threading;
using System.Threading.Tasks;

using Newtonsoft.Json;

namespace EasyData.Services
{
    public abstract class EasyFilter
    {
        protected readonly Metadata Model;

        public EasyFilter(Metadata model)
        {
            Model = model;
        }

        public abstract Task ReadFromJsonAsync(JsonReader reader, CancellationToken ct = default);
        
        public abstract object Apply(MetaEntity entity, bool isLookup, object data);
    }
}
