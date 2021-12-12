using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Newtonsoft.Json.Linq;

using EasyData.EntityFrameworkCore;
namespace EasyData.Services
{
    public class EasyDataManagerEF<TDbContext> : EasyDataManager where TDbContext : DbContext
    {
        protected readonly TDbContext DbContext;

        public EasyDataManagerEF(IServiceProvider services, EasyDataOptions options) : base(services, options)
        {
            DbContext = (TDbContext)services.GetService(typeof(TDbContext))
                ?? throw new ArgumentNullException($"DbContext is not registered in services: {typeof(TDbContext)}");
        }

        public override Task LoadModelAsync(string modelId, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            Model.Id = modelId;
            var loaderOptions = new DbContextMetaDataLoaderOptions();
            Options.MetaDataLoaderOptionsBuilder?.Invoke(loaderOptions);
            Model.LoadFromDbContext(DbContext, loaderOptions);
            return base.LoadModelAsync(modelId, ct);
        }
        public override async Task<IEnumerable<EasySorter>> GetDefaultSortersAsync(string modelId, string entityContainer, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            var model = await GetModelAsync(modelId);
            var entityType = GetCurrentEntityType(DbContext, entityContainer);
            var modelEntity = Model.EntityRoot.SubEntities.FirstOrDefault(e => e.ClrType == entityType.ClrType);

            return modelEntity.Attributes
                    .Where(a => a.Sorting != 0)
                    .OrderBy(a => Math.Abs(a.Sorting))
                    .Select(a => new EasySorter
                    {
                        FieldName = a.PropName,
                        Direction = a.Sorting > 0 ? SortDirection.Ascending : SortDirection.Descending
                    });
        }

        public override async Task<EasyDataResultSet> FetchDatasetAsync(string modelId,
                string entityContainer,
                IEnumerable<EasyFilter> filters = null,
                IEnumerable<EasySorter> sorters = null,
                bool isLookup = false, int? offset = null, int? fetch = null, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            if (filters == null)
                filters = Enumerable.Empty<EasyFilter>();

            await GetModelAsync(modelId);

            var entityType = GetCurrentEntityType(DbContext, entityContainer);
            var entities = await ListAllEntitiesAsync(DbContext, entityType.ClrType,
                    filters, sorters, isLookup, offset, fetch, ct);

            var result = new EasyDataResultSet();

            var modelEntity = Model.EntityRoot.SubEntities.FirstOrDefault(e => e.ClrType == entityType.ClrType);
            var attrIdProps = entityType.GetProperties()
                .ToDictionary(
                    prop => DataUtils.ComposeKey(entityContainer, prop.Name), 
                    prop => prop);

            var attrs = modelEntity.Attributes.Where(attr => attr.Kind != EntityAttrKind.Lookup);

            foreach (var attr in attrs) {
                var dataType = attr.DataType;
                var dfmt = attr.DisplayFormat;

                if (string.IsNullOrEmpty(dfmt)) {
                    dfmt = Model.DisplayFormats.GetDefault(attr.DataType)?.Format;
                }

                var prop = attrIdProps[attr.Id];
                result.Cols.Add(new EasyDataCol(new EasyDataColDesc {
                    Id = attr.Id,
                    Label = attr.Caption,
                    AttrId = attr?.Id,
                    DisplayFormat = dfmt,
                    DataType = dataType,
                    Description = attr.Description
                }));
            }

            foreach (var entity in entities) {
                var values = attrs.Select(attr => attrIdProps[attr.Id].PropertyInfo.GetValue(entity)).ToList();
                result.Rows.Add(new EasyDataRow(values));
            }

            return result;
        }

        public override async Task<long> GetTotalRecordsAsync(string modelId, string entityContainer,
            IEnumerable<EasyFilter> filters = null, bool isLookup = false, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            if (filters == null)
                filters = Enumerable.Empty<EasyFilter>();

            await GetModelAsync(modelId);

            var entityType = GetCurrentEntityType(DbContext, entityContainer);
            return await CountAllEntitiesAsync(DbContext, entityType.ClrType, filters, isLookup, ct);
        }

        public override async Task<object> FetchRecordAsync(string modelId, string entityContainer, 
            Dictionary<string, string> recordKeys, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            var entityType = GetCurrentEntityType(DbContext, entityContainer);
            var keys = GetKeys(entityType, recordKeys);
            return await FindEntityAsync(DbContext, entityType.ClrType, keys.Values, ct);
        }

        public override async Task<object> CreateRecordAsync(string modelId, string entityContainer, JObject props, 
            CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            var entityType = GetCurrentEntityType(DbContext, entityContainer);

            var entity = Activator.CreateInstance(entityType.ClrType);

            MapProperties(entity, props);

            await DbContext.AddAsync(entity, ct);
            await DbContext.SaveChangesAsync(ct);

            return entity;
        }

        public override async Task<object> UpdateRecordAsync(string modelId, string entityContainer, JObject props, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            var entityType = GetCurrentEntityType(DbContext, entityContainer);

            var keys = GetKeys(entityType, props);
            var entity = await FindEntityAsync(DbContext, entityType.ClrType, keys.Values, ct);
            if (entity == null) {
                throw new RecordNotFoundException(entityContainer,
                    $"({string.Join(";", keys.Select(kv => $"{kv.Key.Name}: {kv.Value}"))})");
            }

            MapProperties(entity, props);

            DbContext.Update(entity);
            await DbContext.SaveChangesAsync(ct);

            return entity;
        }

        public override async Task DeleteRecordAsync(string modelId, string entityContainer, JObject props, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            var entityType = GetCurrentEntityType(DbContext, entityContainer);

            var keys = GetKeys(entityType, props);
            var entity = await FindEntityAsync(DbContext, entityType.ClrType, keys.Values, ct);
            if (entity == null) {
                throw new RecordNotFoundException(entityContainer, 
                    $"({string.Join(";", keys.Select(kv => $"{kv.Key.Name}: {kv.Value}"))})");
            }

            DbContext.Remove(entity);
            await DbContext.SaveChangesAsync(ct);
        }

        private static IEntityType GetCurrentEntityType(DbContext dbContext, string entityContainer)
        {
            var entityType = dbContext.Model.GetEntityTypes()
                .FirstOrDefault(ent => Utils.GetEntityNameByType(ent.ClrType) == entityContainer);

            if (entityType == null) {
                throw new ContainerNotFoundException(entityContainer);
            }

            return entityType;
        }

        private static void MapProperties(object entity, JObject props)
        {
            foreach (var entProp in props) {
                var prop = entity.GetType().GetProperty(entProp.Key);
                if (prop != null) {
                    prop.SetValue(entity, entProp.Value.ToObject(prop.PropertyType));
                }
            }
        }

        private static Dictionary<IProperty, object> GetKeys(IEntityType entityType, Dictionary<string, string> keys)
        {
            var keyProps = entityType.GetProperties()
                .Where(prop => prop.IsPrimaryKey())
                .ToList();

            if (keys.Count != keyProps.Count) {
                throw new EasyDataManagerException("Wrong number of key fields");
            }  

            return keyProps.ToDictionary(
                prop => prop, 
                prop => TypeDescriptor.GetConverter(prop.ClrType)
                                   .ConvertFromString(keys[prop.Name]));
        }

        private static Dictionary<IProperty, object> GetKeys(IEntityType entityType, JObject props)
        {
            var keyProps = entityType.GetProperties()
                .Where(prop => prop.IsPrimaryKey())
                .ToList();

            return keyProps.ToDictionary(
                p => p,
                p => props.TryGetValue(p.Name, out var token) 
                    ? token.ToObject(p.ClrType) 
                    : throw new EasyDataManagerException($"Key value is not found: {p.Name}"));
        }

        static EasyDataManagerEF()
        {
            var methods = typeof(EasyDataManagerEF<TDbContext>).GetMethods(BindingFlags.Instance | BindingFlags.NonPublic)
                .Where(m => m.IsGenericMethodDefinition).ToList();

            _findEntityAsync = methods.Single(m => m.Name == nameof(FindEntityAsync));
            _listAllEntitiesAsync = methods.Single(m => m.Name == nameof(ListAllEntitiesAsync));
            _countAllEntitiesAsync = methods.Single(m => m.Name == nameof(CountAllEntitiesAsync));
        }

        private static readonly MethodInfo _findEntityAsync;
        
        private async Task<object> FindEntityAsync(DbContext dbContext, Type entityType, IEnumerable<object> keys, CancellationToken ct)
        {
            ct.ThrowIfCancellationRequested();

            var targetMethod = _findEntityAsync.MakeGenericMethod(entityType);
            var task = (Task)targetMethod.Invoke(this, new object[] { dbContext, keys, ct });

            await task.ConfigureAwait(false);
            return (object)((dynamic)task).Result;
        }

        private static readonly MethodInfo _listAllEntitiesAsync;

        private async Task<List<object>> ListAllEntitiesAsync(DbContext dbContext, Type entityType,
            IEnumerable<EasyFilter> filters,
            IEnumerable<EasySorter> sorters,
            bool isLookup, int? offset,
            int? fetch, CancellationToken ct)
        {
            ct.ThrowIfCancellationRequested();

            var targetMethod = _listAllEntitiesAsync.MakeGenericMethod(entityType);
            var task = (Task)targetMethod
                       .Invoke(this, new object[] { dbContext, filters, sorters, isLookup, offset, fetch, ct });

            await task.ConfigureAwait(false);
            return (List<object>)((dynamic)task).Result;
        }

        private static readonly MethodInfo _countAllEntitiesAsync;

        private async Task<long> CountAllEntitiesAsync(DbContext dbContext, Type entityType, IEnumerable<EasyFilter> filters, bool isLookup,
            CancellationToken ct)
        {
            ct.ThrowIfCancellationRequested();

            var targetMethod = _countAllEntitiesAsync.MakeGenericMethod(entityType);
            var task = (Task)targetMethod.Invoke(this, new object[] { dbContext, filters, isLookup, ct });

            await task.ConfigureAwait(false);
            return (long)((dynamic)task).Result;
        }

        private async Task<T> FindEntityAsync<T>(DbContext dbContext, IEnumerable<object> keys, CancellationToken ct) where T : class
        {
            ct.ThrowIfCancellationRequested();
            return await dbContext.Set<T>().FindAsync(keys.ToArray(), ct);
        }

        private async Task<List<object>> ListAllEntitiesAsync<T>(DbContext dbContext,
            IEnumerable<EasyFilter> filters,
            IEnumerable<EasySorter> sorters,
            bool isLookup,
            int? offset, int? fetch, CancellationToken ct) where T : class
        {
            ct.ThrowIfCancellationRequested();

            var query = dbContext.Set<T>().AsQueryable();
            var entity = Model.EntityRoot.SubEntities.FirstOrDefault(ent => ent.ClrType == typeof(T));
            if (filters != null) {
                foreach (var filter in filters) {
                    query = (IQueryable<T>)filter.Apply(entity, isLookup, query);
                }
            }

            if (sorters != null) {
                using (var e = sorters.GetEnumerator()) {
                    if (e.MoveNext()) {
                        var sorter = e.Current;
                        var isDescending = sorter.Direction == SortDirection.Descending;
                        var orderedQuery = query.OrderBy(sorter.FieldName, isDescending);
                        while (e.MoveNext()) {
                            sorter = e.Current;
                            isDescending = sorter.Direction == SortDirection.Descending;
                            orderedQuery = orderedQuery.ThenBy(sorter.FieldName, isDescending);
                        }
                        query = orderedQuery.AsQueryable();
                    }
                }
            }

            if (offset.HasValue) {
                query = query.Skip(offset.Value);
            }

            if (fetch.HasValue) {
                query = query.Take(fetch.Value);
            }

            return await query.Cast<object>().ToListAsync(ct);
        }

        private async Task<long> CountAllEntitiesAsync<T>(DbContext dbContext, IEnumerable<EasyFilter> filters, bool isLookup, 
            CancellationToken ct) where T : class
        {
            ct.ThrowIfCancellationRequested();

            var query = dbContext.Set<T>().AsQueryable();
            var entity = Model.EntityRoot.SubEntities.FirstOrDefault(ent => ent.ClrType == typeof(T));
            foreach (var filter in filters) {
                query = (IQueryable<T>)filter.Apply(entity, isLookup, query);
            }
            return await query.LongCountAsync(ct);
        }
    }
}