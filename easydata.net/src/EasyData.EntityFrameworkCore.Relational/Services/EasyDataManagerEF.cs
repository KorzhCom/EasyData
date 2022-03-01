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
        public override async Task<IEnumerable<EasySorter>> GetDefaultSortersAsync(string modelId, string sourceId, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            var model = await GetModelAsync(modelId);
            var entityType = GetCurrentEntityType(DbContext, sourceId);
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
                string sourceId,
                IEnumerable<EasyFilter> filters = null,
                IEnumerable<EasySorter> sorters = null,
                bool isLookup = false, int? offset = null, int? fetch = null, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            if (filters == null)
                filters = Enumerable.Empty<EasyFilter>();

            await GetModelAsync(modelId);

            var entityType = GetCurrentEntityType(DbContext, sourceId);
            var records = GetRecordsQuery(DbContext, entityType.ClrType,
                    filters, sorters, isLookup, offset, fetch, ct);

            var result = new EasyDataResultSet();

            var modelEntity = Model.EntityRoot.SubEntities.FirstOrDefault(e => e.ClrType == entityType.ClrType);
            var attrIdProps = entityType.GetProperties()
                .Where(prop => !prop.IsShadowProperty())
                .ToDictionary(
                    prop => DataUtils.ComposeKey(sourceId, prop.Name), 
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

            foreach (var record in records) {
                var values = attrs.Select(attr => {
                    var prop = attrIdProps[attr.Id];
                    return (object)(prop.PropertyInfo != null
                        ? prop.PropertyInfo.GetValue(record)
                        : null);
                }).ToList();
                result.Rows.Add(new EasyDataRow(values));
            }

            return result;
        }

        public override async Task<long> GetTotalRecordsAsync(string modelId, string sourceId,
            IEnumerable<EasyFilter> filters = null, bool isLookup = false, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            if (filters == null)
                filters = Enumerable.Empty<EasyFilter>();

            await GetModelAsync(modelId);

            var entityType = GetCurrentEntityType(DbContext, sourceId);
            return GetRecordCount(DbContext, entityType.ClrType, filters, isLookup);
        }

        public override Task<object> FetchRecordAsync(string modelId, string sourceId, 
            Dictionary<string, string> recordKeys, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            var entityType = GetCurrentEntityType(DbContext, sourceId);
            var keys = GetKeys(entityType, recordKeys);
            var record = FindRecord(DbContext, entityType.ClrType, keys.Values);
            if (record == null) {
                throw new RecordNotFoundException(sourceId,
                    $"({string.Join(";", keys.Select(kv => $"{kv.Key.Name}: {kv.Value}"))})");
            }

            return Task.FromResult(record);
        }

        public override async Task<object> CreateRecordAsync(string modelId, string sourceId, JObject props, 
            CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            var entityType = GetCurrentEntityType(DbContext, sourceId);

            var record = Activator.CreateInstance(entityType.ClrType);

            MapProperties(record, props);

            await DbContext.AddAsync(record, ct);
            await DbContext.SaveChangesAsync(ct);

            return record;
        }

        public override async Task<object> UpdateRecordAsync(string modelId, string sourceId, JObject props, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            var entityType = GetCurrentEntityType(DbContext, sourceId);

            var keys = GetKeys(entityType, props);
            var record = FindRecord(DbContext, entityType.ClrType, keys.Values);
            if (record == null) {
                throw new RecordNotFoundException(sourceId,
                    $"({string.Join(";", keys.Select(kv => $"{kv.Key.Name}: {kv.Value}"))})");
            }

            MapProperties(record, props);

            DbContext.Update(record);
            await DbContext.SaveChangesAsync(ct);

            return record;
        }

        public override async Task DeleteRecordAsync(string modelId, string sourceId, JObject props, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();

            var entityType = GetCurrentEntityType(DbContext, sourceId);

            var keys = GetKeys(entityType, props);
            var record = FindRecord(DbContext, entityType.ClrType, keys.Values);
            if (record == null) {
                throw new RecordNotFoundException(sourceId,
                    $"({string.Join(";", keys.Select(kv => $"{kv.Key.Name}: {kv.Value}"))})");
            }

            DbContext.Remove(record);
            await DbContext.SaveChangesAsync(ct);
        }

        /// <inheritdoc />
        public override async Task DeleteRecordsInBulkAsync(string modelId, string sourceId, JObject props, CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();
            var entityType = GetCurrentEntityType(DbContext, sourceId);
            var recordsPKs = GetRecordsPKs(props);
            var recordsToDelete = new List<object>();

            foreach (var pk in recordsPKs) {
                var keys = GetKeys(entityType, pk);
                var record = FindRecord(DbContext, entityType.ClrType, keys.Values);

                if (record == null) {
                    throw new RecordNotFoundException(sourceId,
                        $"({string.Join(";", keys.Select(kv => $"{kv.Key.Name}: {kv.Value}"))})");
                }

                recordsToDelete.Add(record);
            }

            DbContext.RemoveRange(recordsToDelete);
            await DbContext.SaveChangesAsync(ct);
        }

        /// <summary>
        /// Get primary keys of records from the request body.
        /// </summary>
        private IEnumerable<JObject> GetRecordsPKs(JObject fields)
        {
            foreach (var keyValue in fields) {
                if (keyValue.Key.Equals("pks")) {
                    return keyValue.Value.ToObject<JObject[]>();
                }
            }

            throw new Exception("Primary keys were not found.");
        }


        private static IEntityType GetCurrentEntityType(DbContext dbContext, string sourceId)
        {
            var entityType = dbContext.Model.GetEntityTypes()
                .FirstOrDefault(entType => Utils.GetEntityName(entType) == sourceId);

            if (entityType == null) {
                throw new ContainerNotFoundException(sourceId);
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

        private static readonly MethodInfo _findRecordGeneric;
        private static readonly MethodInfo _queryRecordsGeneric;
        private static readonly MethodInfo _countRecordsGeneric;

        static EasyDataManagerEF()
        {
            var methods = typeof(EasyDataManagerEF<TDbContext>).GetMethods(BindingFlags.Instance | BindingFlags.NonPublic)
                .Where(m => m.IsGenericMethodDefinition).ToList();

            _findRecordGeneric = methods.Single(m => m.Name == nameof(FetchRecord));
            _queryRecordsGeneric = methods.Single(m => m.Name == nameof(QueryRecords));
            _countRecordsGeneric = methods.Single(m => m.Name == nameof(CountRecords));
        }

        
        private object FindRecord(DbContext dbContext, Type entityType, IEnumerable<object> keys)
        {
            var targetMethod = _findRecordGeneric.MakeGenericMethod(entityType);
            return targetMethod.Invoke(this, new object[] { dbContext, keys });
        }


        private IQueryable GetRecordsQuery(DbContext dbContext, Type entityType,
            IEnumerable<EasyFilter> filters,
            IEnumerable<EasySorter> sorters,
            bool isLookup, int? offset,
            int? fetch, CancellationToken ct)
        {
            ct.ThrowIfCancellationRequested();

            var targetMethod = _queryRecordsGeneric.MakeGenericMethod(entityType);
            var result = (IQueryable)targetMethod
                       .Invoke(this, new object[] { dbContext, filters, sorters, isLookup, offset, fetch, ct });

            return result;
        }

        private long GetRecordCount(DbContext dbContext, Type entityType, IEnumerable<EasyFilter> filters, bool isLookup)
        {
            var targetMethod = _countRecordsGeneric.MakeGenericMethod(entityType);
            return (long)targetMethod.Invoke(this, new object[] { dbContext, filters, isLookup });
        }

        private T FetchRecord<T>(DbContext dbContext, IEnumerable<object> keys) where T : class
        {
            return dbContext.Set<T>().Find(keys.ToArray());
        }

        private IQueryable QueryRecords<T>(DbContext dbContext,
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

            return query;
        }

        private long CountRecords<T>(DbContext dbContext, IEnumerable<EasyFilter> filters, bool isLookup) where T : class
        {
            var query = dbContext.Set<T>().AsQueryable();
            var entity = Model.EntityRoot.SubEntities.FirstOrDefault(ent => ent.ClrType == typeof(T));
            foreach (var filter in filters) {
                query = (IQueryable<T>)filter.Apply(entity, isLookup, query);
            }
            return query.LongCount();
        }
    }
}