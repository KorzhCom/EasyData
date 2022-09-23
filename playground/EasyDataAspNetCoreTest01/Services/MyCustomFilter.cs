using System.Reflection;

using Newtonsoft.Json;
using EasyData.Services;
using EasyData;


namespace EasyDataBasicDemo
{
    public class MyCustomFilter : EasyFilter
    {
        public MyCustomFilter(MetaData model) : base(model)
        {
        }

        public override object Apply(MetaEntity entity, bool isLookup, object data)
        {
            if (entity.Name != "Order") return data;

            return GetType().GetMethods(BindingFlags.Instance | BindingFlags.NonPublic)
               .Single(m => m.Name == "FilterQueryable" && m.IsGenericMethodDefinition)
               .MakeGenericMethod(entity.ClrType)
               .Invoke(this, new object[] { entity, isLookup, data });
        }

        private IQueryable<T> FilterQueryable<T>(MetaEntity entity, bool isLookup, object data) where T : class
        {
            return (IQueryable<T>)data;
            //return query.Where(/* your condition is here */);
        }

        public override Task ReadFromJsonAsync(JsonReader reader, CancellationToken ct = default)
        {
            //do nothing since  we will not read the parameters of this filter from a request
            return Task.CompletedTask;
        }
    }
}
