using System;
using System.Collections.Generic;


namespace EasyData
{
    public class EntityClrTypeCache
    {
        private readonly MetaData _metadata;
        private Dictionary<Type, MetaEntity> _cache = new Dictionary<Type, MetaEntity>();

        public EntityClrTypeCache(MetaData metadata)
        {
            _metadata = metadata;
        }

        public bool TryGetEntity<TEntity>(out MetaEntity entity) where TEntity : class
        {
            if (_cache.Count == 0) {
                UpdateCache();
            }

            return _cache.TryGetValue(typeof(TEntity), out entity);
        }

        protected virtual void UpdateCache()
        {
            _cache.Clear();
            _metadata.EntityRoot.Scan(ent => _cache.Add(ent.ClrType, ent), null);
        }
    }
}
