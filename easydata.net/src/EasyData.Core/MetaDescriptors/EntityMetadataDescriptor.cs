using System;
using System.Collections.Generic;
using System.Text;

namespace EasyData.MetaDescriptors
{
    /// <summary>
    /// Contains metadata information about entity.
    /// </summary>
    public class EntityMetadataDescriptor
    {
        /// <summary>
        /// Set of entity properties metadata.
        /// </summary>
        public HashSet<EntityPropertyMetadataDescriptor> MetadataProperties { get; private set; } = new HashSet<EntityPropertyMetadataDescriptor>(new PropertyComparer());

        /// <summary>
        /// Name to use for this entity in the UI.
        /// </summary>
        public string DisplayName { get; set; }

        /// <summary>
        /// Plural name to use for this property in the UI.
        /// </summary>
        public string DisplayNamePlural { get; set; }

        /// <summary>
        /// Whether to include the entity in EasyData or not.
        /// </summary>
        public bool IsEnabled { get; set; } = true;

        /// <summary>
        /// Detailed description of the entity.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Entity type.
        /// </summary>
        public Type ClrType { get; set; }

        /// <summary>
        /// Compare entity properties metadata.
        /// </summary>
        private class PropertyComparer : IEqualityComparer<EntityPropertyMetadataDescriptor>
        {
            public bool Equals(EntityPropertyMetadataDescriptor x, EntityPropertyMetadataDescriptor y)
            {
                if (x == null || y == null) {
                    return false;
                }

                return x.PropertyInfo.Equals(y.PropertyInfo);
            }

            public int GetHashCode(EntityPropertyMetadataDescriptor obj)
            {
                return obj.PropertyInfo.GetHashCode();
            }
        }
    }
}
