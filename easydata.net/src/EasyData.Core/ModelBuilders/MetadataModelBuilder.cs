using System;
using System.Collections.Generic;

namespace EasyData
{
    /// <summary>
    /// Build entity metadata.
    /// </summary>
    public class MetadataModelBuilder
    {
        private MetaData _metadata;

        public MetadataModelBuilder(MetaData metadata)
        { 
            _metadata = metadata;
        }

        private Dictionary<Type, object> _builders = new Dictionary<Type, object> ();

        /// <summary>
        /// Gets the builder for an entity by its type.
        /// This is a virtual method that can be overriden in descendants
        /// </summary>
        /// <typeparam name="TEntity">Entity type.</typeparam>
        /// <returns>Entity metadata builder instance.</returns>
        protected virtual IMetaEntityBuilder<TEntity> GetEntityBuilder<TEntity>() where TEntity : class
        {
            if (_builders.TryGetValue(typeof(TEntity), out var builderObj)) {
                return builderObj as IMetaEntityBuilder<TEntity>;
            }
            else {
                var entity = _metadata.EntityRoot.FindEntity(ent => ent.ClrType == typeof(TEntity));

                IMetaEntityBuilder<TEntity> builder;
                if (entity != null) {
                    builder = new MetaEntityBuilder<TEntity>(entity);
                }
                else {
                    builder = new VoidMetaEntityBuilder<TEntity>(this);
                }
                _builders.Add(typeof(TEntity), builder);

                return builder;
            }
        }

        /// <summary>
        /// Gets the builder for an entity by its type
        /// </summary>
        /// <typeparam name="TEntity">Entity type.</typeparam>
        /// <returns>Entity metadata builder instance.</returns>
        public IMetaEntityBuilder<TEntity> Entity<TEntity>() where TEntity : class
        {
            return GetEntityBuilder<TEntity>();
        }
    }
}
