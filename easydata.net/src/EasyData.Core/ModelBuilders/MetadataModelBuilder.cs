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

        //private Dictionary<Type, EntityMetaBuilder> _builders = new Dictionary<Type, Services.EntityMetaBuilder> ();

        protected virtual IMetaEntityBuilder<TEntity> GetBuilder<TEntity>() where TEntity : class
        {
            var entity = _metadata.EntityRoot.FindEntity(ent => ent.ClrType == typeof(TEntity));

            return entity != null ? new MetaEntityBuilder<TEntity>(entity) : null;
        }

        /// <summary>
        /// Set entity meta options.
        /// </summary>
        /// <typeparam name="TEntity">Entity type.</typeparam>
        /// <returns>Entity metadata descriptor instance.</returns>
        public IMetaEntityBuilder<TEntity> Entity<TEntity>() where TEntity : class
        {
            var entityBuilder = GetBuilder<TEntity>();

            // Return entity metadata builder if it has already been created with specified entity type
            if (entityBuilder == null) {
                entityBuilder = new SkipMetaEntityBuilder<TEntity>(this);
            }

            return entityBuilder;
        }
    }
}
