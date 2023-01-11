using EasyData.Services;
using EasyData;


namespace EasyDataBasicDemo
{
    public class CustomEasyDataManager : EasyDataManagerEF<AppDbContext>
    {
        public CustomEasyDataManager(IServiceProvider services, EasyDataOptions options) 
            : base(services, options)
        {
        }

        public override async Task<EasyDataResultSet> FetchDataAsync(
                string modelId,
                string sourceId,
                IEnumerable<EasyFilter> filters = null,
                IEnumerable<EasySorter> sorters = null,
                bool isLookup = false, int? offset = null, int? fetch = null, CancellationToken ct = default)
        { 
        
            var myFilters = new List<EasyFilter>(filters);
            myFilters.Add(new MyCustomFilter(Model));

            return await base.FetchDataAsync(modelId, sourceId, myFilters, sorters, isLookup, offset, fetch, ct);
        }
    }
}
