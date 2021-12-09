using System;
using System.Collections.Generic;

namespace EasyData.EntityFrameworkCore
{
    /// <summary>
    /// Build entity metadata.
    /// </summary>
    public class MetadataCustomizer
    {
        private readonly MetaData _metadata;
        private readonly EntityClrTypeCache _entityCache;

        public MetadataCustomizer(MetaData metadata)
        { 
            _metadata = metadata;
            _entityCache = new EntityClrTypeCache(_metadata);
        }

        private Dictionary<Type, object> _builderCache = new Dictionary<Type, object> ();

        /// <summary>
        /// Gets the customizer for an entity by its type.
        /// This is a virtual method that can be overriden in descendants
        /// </summary>
        /// <typeparam name="TEntity">Entity type.</typeparam>
        /// <returns>An instance of IMetaEntityCustomizer&lt;TEntity&gt;.</returns>
        protected virtual IMetaEntityCustomizer<TEntity> GetEntityBuilder<TEntity>() where TEntity : class
        {
            if (_builderCache.TryGetValue(typeof(TEntity), out var builderObj)) {
                return builderObj as IMetaEntityCustomizer<TEntity>;
            }
            else {
                IMetaEntityCustomizer<TEntity> builder;
                if (_entityCache.TryGetEntity<TEntity>(out var entity)) {
                    builder = new MetaEntityCustomizer<TEntity>(entity);
                }
                else {
                    builder = new MetaEntityVoidCustomizer<TEntity>(this);
                }
                _builderCache[typeof(TEntity)] = builder;

                return builder;
            }
        }

        /// <summary>
        /// Gets the entity customizer by its type
        /// </summary>
        /// <typeparam name="TEntity">Entity type.</typeparam>
        /// <returns>An instance of IMetaEntityCustomizer&lt;TEntity&gt;.</returns>
        public IMetaEntityCustomizer<TEntity> Entity<TEntity>() where TEntity : class
        {
            return GetEntityBuilder<TEntity>();
        }
    }
}
