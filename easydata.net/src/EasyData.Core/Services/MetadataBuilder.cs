using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;

namespace EasyData.Services
{
    public class MetadataBuilder
    {
        /// <summary>
        /// Entity meta builders.
        /// </summary>
        public IEnumerable<IEntityMetaBuilder> EntityMetaBuilders => _entityMetaBuilders;

        private readonly List<IEntityMetaBuilder> _entityMetaBuilders = new List<IEntityMetaBuilder>();

        /// <summary>
        /// Set entity meta options.
        /// </summary>
        /// <typeparam name="TEntity">Entity type.</typeparam>
        /// <returns>Entity meta builder instance.</returns>
        public EntityMetaBuilder<TEntity> Entity<TEntity>()
        {
            var builder = _entityMetaBuilders.FirstOrDefault(b => b.ClrType == typeof(TEntity));

            // Return entity builder if it has already been created with specified entity type
            if (builder != null) {
                return (EntityMetaBuilder<TEntity>)builder;
            }

            var entityBuilder = new EntityMetaBuilder<TEntity>();

            _entityMetaBuilders.Add(entityBuilder);
            return entityBuilder;
        }

    }


}
