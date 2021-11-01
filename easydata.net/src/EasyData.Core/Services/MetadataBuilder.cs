using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using EasyData.MetaDescriptors;

namespace EasyData.Services
{
    /// <summary>
    /// Build entity metadata.
    /// </summary>
    public class MetadataBuilder
    {
        /// <summary>
        /// Entity metadata descriptors.
        /// </summary>
        public IEnumerable<IEntityMetadataDescriptor> EntityMetadataDescriptors => _entityMetadataDescriptors;

        private readonly List<IEntityMetadataDescriptor> _entityMetadataDescriptors = new List<IEntityMetadataDescriptor>();

        /// <summary>
        /// Set entity meta options.
        /// </summary>
        /// <typeparam name="TEntity">Entity type.</typeparam>
        /// <returns>Entity metadata descriptor instance.</returns>
        public EntityMetadataDescriptor<TEntity> Entity<TEntity>()
        {
            var descriptor = _entityMetadataDescriptors.FirstOrDefault(b => b.ClrType == typeof(TEntity));

            // Return entity metadata descriptor if it has already been created with specified entity type
            if (descriptor != null) {
                return (EntityMetadataDescriptor<TEntity>)descriptor;
            }

            var entityMetadataDescriptor = new EntityMetadataDescriptor<TEntity>();
            _entityMetadataDescriptors.Add(entityMetadataDescriptor);
            return entityMetadataDescriptor;
        }
    }
}
