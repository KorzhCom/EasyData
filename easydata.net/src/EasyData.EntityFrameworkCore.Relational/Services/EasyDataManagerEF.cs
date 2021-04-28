using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

using Newtonsoft.Json.Linq;

using EasyData.EntityFrameworkCore;
using System.Threading;

namespace EasyData.Services
{
    public class EasyDataManagerEF<TDbContext>: EasyDataManager where TDbContext: DbContext
    {
        protected readonly TDbContext DbContext;


        public EasyDataManagerEF(IServiceProvider services, EasyDataOptions options): base(services, options)
        {
            DbContext = (TDbContext)services.GetService(typeof(TDbContext)) 
                ?? throw new ArgumentNullException($"DbContext is not registered in services: {typeof(TDbContext)}");

        }

        public override Task LoadModelAsync(string modelId, CancellationToken ct = default)
        {
            Model.Id = modelId;
            var loaderOptions = new DbContextMetaDataLoaderOptions();
            Options.MetaDataLoaderOptionsBuilder?.Invoke(loaderOptions);
            Model.LoadFromDbContext(DbContext, loaderOptions);
            return Task.FromResult(Model);
        }

        public override async Task<EasyDataResultSet> GetEntitiesAsync(string modelId, string entityContainer, IEnumerable<EasyFilter> filters = null, bool isLookup = false, int? offset = null, int? fetch = null, CancellationToken ct = default)
        {
            if (filters == null)
                filters = Enumerable.Empty<EasyFilter>();

            await GetModelAsync(modelId);

            var entityType = GetCurrentEntityType(DbContext, entityContainer);
            var entities = await ListAllEntitiesAsync(DbContext, entityType.ClrType, filters, isLookup, offset, fetch, ct);

            var result = new EasyDataResultSet();

            var props = entityType.GetProperties();
            foreach (var prop in props) {
                var attrId = DataUtils.ComposeKey(entityType.Name.Split('.').Last(), prop.Name);
                var attr = Model.FindEntityAttr(attrId);
                result.Cols.Add(new EasyDataCol(new EasyDataColDesc {
                    Id =  attrId,
                    Label = DataUtils.PrettifyName(prop.Name),
                    AttrId = attr?.Id,
                    DisplayFormat = attr?.DisplayFormat,
                    Type = attr != null ? attr.DataType :DataUtils.GetDataTypeBySystemType(prop.ClrType)
                }));
            }

            foreach (var entity in entities) {
                result.Rows.Add(new EasyDataRow(props.Select(prop => prop.PropertyInfo.GetValue(entity)).ToList()));
            }

            return result;

        }

        public override async Task<long> GetTotalEntitiesAsync(string modelId, string entityContainer,
            IEnumerable<EasyFilter> filters = null, bool isLookup = false, CancellationToken ct = default)
        {
            if (filters == null)
                filters = Enumerable.Empty<EasyFilter>();

            await GetModelAsync(modelId);

            var entityType = GetCurrentEntityType(DbContext, entityContainer);
            return await CountAllEntitiesAsync(DbContext, entityType.ClrType, filters, isLookup, ct);
        }

        public override async Task<object> GetEntityAsync(string modelId, string entityContainer, string keyStr, CancellationToken ct = default)
        {
            var entityType = GetCurrentEntityType(DbContext, entityContainer);
            var keys = GetKeys(entityType, keyStr);
            return await FindEntityAsync(DbContext, entityType.ClrType, keys, ct);
        }

        public override async Task<object> CreateEntityAsync(string modelId, string entityContainer, JObject props, CancellationToken ct = default)
        {
            var entityType = GetCurrentEntityType(DbContext, entityContainer);
        
            var entity = Activator.CreateInstance(entityType.ClrType);

            MapProperties(entity, props);

            await DbContext.AddAsync(entity, ct);
            await DbContext.SaveChangesAsync(ct);

            return entity;
        }

        public override async Task<object> UpdateEntityAsync(string modelId, string entityContainer, string keyStr, JObject props, CancellationToken ct = default)
        {
            var entityType = GetCurrentEntityType(DbContext, entityContainer);
      
            var keys = GetKeys(entityType, keyStr);
            var entity = await FindEntityAsync(DbContext, entityType.ClrType, keys, ct);
            if (entity == null) {
                throw new EntityNotFoundException(entityContainer, keyStr);
            }

            MapProperties(entity, props);

            DbContext.Update(entity);
            await DbContext.SaveChangesAsync(ct);

            return entity;
        }

        public override async Task DeleteEntityAsync(string modelId, string entityContainer, string keyStr, CancellationToken ct = default)
        {
            var entityType = GetCurrentEntityType(DbContext, entityContainer);
         
            var keys = GetKeys(entityType, keyStr);
            var entity = await FindEntityAsync(DbContext, entityType.ClrType, keys, ct);
            if (entity == null) {
                throw new EntityNotFoundException(entityContainer, keyStr);
            }

            DbContext.Remove(entity);
            await DbContext.SaveChangesAsync(ct);
        }

        private IEntityType GetCurrentEntityType(DbContext dbContext, string entityContainer)
        {
            var entityType = dbContext.Model.GetEntityTypes()
                .FirstOrDefault(ent => 
                    ent.Name.Split('.').LastOrDefault() == entityContainer);

            if (entityType == null) {
                throw new ContainerNotFoundException(entityContainer);
            }

            return entityType;
        }

        private void MapProperties(object entity, JObject props)
        {
            foreach (var entProp in props) {
                var prop = entity.GetType().GetProperty(entProp.Key);
                if (prop != null){
                    prop.SetValue(entity, entProp.Value.ToObject(prop.PropertyType));
                }
            }
        }

        private List<object> GetKeys(IEntityType entityType, string keyString)
        {
            var keyStrings = keyString.Split(':').ToList();
            var keyProps = entityType.GetProperties().Where(prop => prop.IsPrimaryKey()).ToList();

            if (keyStrings.Count != keyProps.Count) {
                throw new Exception();
            }

            //change to support attrId:keyValue format in future
            var keyObjs = new List<object>(Enumerable.Repeat<object>(null, keyStrings.Count));
            for (int i = 0; i < keyStrings.Count; i++) {
                var type = keyProps[i].ClrType;
                var typeConverter = TypeDescriptor.GetConverter(type);
                keyObjs[i] = typeConverter.ConvertFromString(keyStrings[i]);
            }

            return keyObjs;
          
        }

        private async Task<object> FindEntityAsync(DbContext dbContext, Type entityType, List<object> keys, CancellationToken ct)
        {
            var methods = GetType().GetMethods(BindingFlags.Instance | BindingFlags.NonPublic).ToList();
            var task = (Task)methods
                       .Single(m => m.Name == "FindEntityAsync"
                            && m.IsGenericMethodDefinition)
                       .MakeGenericMethod(entityType)
                       .Invoke(this, new object[] { dbContext, keys, ct});

            await task.ConfigureAwait(false);
            return (object)((dynamic)task).Result;
        }

        private async Task<List<object>> ListAllEntitiesAsync(DbContext dbContext, Type entityType, IEnumerable<EasyFilter> filters, bool isLookup, int? offset,
            int? fetch, CancellationToken ct)
        {
            var methods = GetType().GetMethods(BindingFlags.Instance | BindingFlags.NonPublic).ToList();
            var task = (Task)methods
                       .Single(m => m.Name == "ListAllEntitiesAsync"
                            && m.IsGenericMethodDefinition)
                       .MakeGenericMethod(entityType)
                       .Invoke(this, new object[] { dbContext, filters, isLookup, offset, fetch, ct });

            await task.ConfigureAwait(false);
            return (List<object>)((dynamic)task).Result;
        }

        private async Task<long> CountAllEntitiesAsync(DbContext dbContext, Type entityType, IEnumerable<EasyFilter> filters, bool isLookup, 
            CancellationToken ct)
        {
            var methods = GetType().GetMethods(BindingFlags.Instance | BindingFlags.NonPublic).ToList();
            var task = (Task)methods
                       .Single(m => m.Name == "CountAllEntitiesAsync"
                            && m.IsGenericMethodDefinition)
                       .MakeGenericMethod(entityType)
                       .Invoke(this, new object[] { dbContext, filters, isLookup, ct});

            await task.ConfigureAwait(false);
            return (long)((dynamic)task).Result;
        }

        private async Task<T> FindEntityAsync<T>(DbContext dbContext, List<object> keys, CancellationToken ct) where T : class
        {
            return await dbContext.Set<T>().FindAsync(keys.ToArray(), ct);
        }

        private async Task<List<object>> ListAllEntitiesAsync<T>(DbContext dbContext, IEnumerable<EasyFilter> filters, bool isLookup,
            int? offset, int? fetch, CancellationToken ct) where T : class
        {
            var query = dbContext.Set<T>().AsQueryable();
            var entity = Model.EntityRoot.SubEntities.FirstOrDefault(ent => ent.ClrType == typeof(T));
            foreach (var filter in filters)
            {
                query = (IQueryable<T>)filter.Apply(entity, isLookup, query);
            }

            if (offset.HasValue) {
                query = query.Skip(offset.Value);
            }
            if (fetch.HasValue) {
                query = query.Take(fetch.Value);
            }
            return await query.Cast<object>().ToListAsync(ct);
        }

        private async Task<long> CountAllEntitiesAsync<T>(DbContext dbContext, IEnumerable<EasyFilter> filters, bool isLookup, CancellationToken ct) where T : class
        {
            var query = dbContext.Set<T>().AsQueryable();
            var entity = Model.EntityRoot.SubEntities.FirstOrDefault(ent => ent.ClrType == typeof(T));
            foreach (var filter in filters)
            {
                query = (IQueryable<T>)filter.Apply(entity, isLookup, query);
            }
            return await query.LongCountAsync(ct);
        }
    }
}
