using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using EasyData.Services;

namespace EasyData.MetaDescriptors
{
    /// <summary>
    /// Contains metadata information about entity.
    /// </summary>
    public class EntityMetadataDescriptor
    {
        /// <summary>
        /// Set of entity attributes metadata.
        /// </summary>
        public HashSet<EntityAttributeMetadataDescriptor> MetadataAttributes { get; } = new HashSet<EntityAttributeMetadataDescriptor>(new AttributeComparer());

        /// <summary>
        /// Name to use for this entity in the UI.
        /// </summary>
        public string DisplayName { get; set; }

        /// <summary>
        /// Plural name to use in the UI.
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
        /// Whether the entity is editable or not.
        /// </summary>
        public bool? IsEditable { get; set; }

        /// <summary>
        /// Entity type.
        /// </summary>
        public Type ClrType { get; set; }

        /// <summary>
        /// Compare entity attributes metadata.
        /// </summary>
        private class AttributeComparer : IEqualityComparer<EntityAttributeMetadataDescriptor>
        {
            public bool Equals(EntityAttributeMetadataDescriptor x, EntityAttributeMetadataDescriptor y)
            {
                if (x == null || y == null) {
                    return false;
                }

                return x.PropertyInfo.Equals(y.PropertyInfo);
            }

            public int GetHashCode(EntityAttributeMetadataDescriptor obj)
            {
                return obj.PropertyInfo.GetHashCode();
            }
        }
    }
}
