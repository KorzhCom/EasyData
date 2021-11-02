using System.Collections.Generic;
using System.Linq;
using EasyData.MetaDescriptors;
using EasyData.Services;

namespace EasyData.EntityFrameworkCore.Services
{
    /// <summary>
    /// Build entity metadata.
    /// </summary>
    public class MetadataBuilder
    {
        /// <summary>
        /// Entity metadata descriptors.
        /// </summary>
        public IEnumerable<IEntityMetaBuilder> EntityMetaBuilders => _entityMetaBuilders;

        private readonly List<IEntityMetaBuilder> _entityMetaBuilders = new List<IEntityMetaBuilder>();

        /// <summary>
        /// Set entity meta options.
        /// </summary>
        /// <typeparam name="TEntity">Entity type.</typeparam>
        /// <returns>Entity metadata descriptor instance.</returns>
        public EntityMetaBuilder<TEntity> Entity<TEntity>() where TEntity : class
        {
            var builder = _entityMetaBuilders.FirstOrDefault(b => b.ClrType == typeof(TEntity));

            // Return entity metadata builder if it has already been created with specified entity type
            if (builder != null) {
                return (EntityMetaBuilder<TEntity>)builder;
            }

            var entityMetaBuilder = new EntityMetaBuilder<TEntity>();
            _entityMetaBuilders.Add(entityMetaBuilder);
            return entityMetaBuilder;
        }
    }
}
