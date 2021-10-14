using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

using Newtonsoft.Json;

namespace EasyData.Services
{
    public sealed class SubstringFilter : EasyFilter
    {
        public static string Class = "__substring";

        private string _filterText;

        public SubstringFilter(Metadata model): base(model) {}

        public override object Apply(MetaEntity entity, bool isLookup, object data)
        {
            if (string.IsNullOrWhiteSpace(_filterText))
                return data;

            return GetType().GetMethods(BindingFlags.Instance | BindingFlags.NonPublic)
                   .Single(m => m.Name == "Apply"
                       && m.IsGenericMethodDefinition)
                   .MakeGenericMethod(entity.ClrType)
                   .Invoke(this, new object[] { entity, isLookup, data });
        }

        // Is callable by public Apply
        private IQueryable<T> Apply<T>(MetaEntity entity, bool isLookup, object data) where T: class
        {
            var query = (IQueryable<T>)data;
            return query.FullTextSearchQuery(_filterText, GetFilterOptions(entity, isLookup));
        }

        public override async Task ReadFromJsonAsync(JsonReader reader, CancellationToken ct = default)
        {
            if (!await reader.ReadAsync(ct).ConfigureAwait(false)
               || reader.TokenType != JsonToken.StartObject)
            {
                throw new BadJsonFormatException(reader.Path);
            }

            while (await reader.ReadAsync(ct).ConfigureAwait(false)) {
                if (reader.TokenType == JsonToken.PropertyName) {
                    var propName = reader.Value.ToString();
                    switch (propName) {
                        case "value":
                            _filterText = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                            break;
                        default:
                            await reader.SkipAsync(ct).ConfigureAwait(false);
                            break;
                    }
                }
                else if (reader.TokenType == JsonToken.EndObject) {
                    break;
                }
            }
        }

        private FullTextSearchOptions GetFilterOptions(MetaEntity entity, bool isLookup)
        {
            return new FullTextSearchOptions
            {
                Filter = (prop) => {
                    var attr = entity?.FindAttribute(a => a.PropInfo == prop);
                    if (attr == null)
                        return false;

#pragma warning disable CS0618 // Type or member is obsolete
                    if (!attr.IsVisible || !attr.ShowOnView)
#pragma warning restore CS0618 // Type or member is obsolete
                        return false;

                    if (isLookup && !attr.ShowInLookup && !attr.IsPrimaryKey)
                        return false;

                    return true;
                },
                Depth = 0
            };
        }
    }
}
