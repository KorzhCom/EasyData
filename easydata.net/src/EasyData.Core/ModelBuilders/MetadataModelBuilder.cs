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

        protected virtual IMetaEntityBuilder<TEntity> GetBuilder<TEntity>() where TEntity : class
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
        /// Set entity meta options.
        /// </summary>
        /// <typeparam name="TEntity">Entity type.</typeparam>
        /// <returns>Entity metadata descriptor instance.</returns>
        public IMetaEntityBuilder<TEntity> Entity<TEntity>() where TEntity : class
        {
            return GetBuilder<TEntity>();
        }
    }
}
