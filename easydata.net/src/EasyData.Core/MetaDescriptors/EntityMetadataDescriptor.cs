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
    public class EntityMetadataDescriptor<TEntity>: IEntityMetadataDescriptor
    {
        /// <summary>
        /// Set of entity properties metadata.
        /// </summary>
        public HashSet<EntityPropertyMetadataDescriptor> MetadataProperties { get; } = new HashSet<EntityPropertyMetadataDescriptor>(new PropertyComparer());

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
        public Type ClrType => typeof(TEntity);

        /// <summary>
        /// Set entity display name.
        /// </summary>
        /// <param name="displayName">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityMetadataDescriptor<TEntity> SetDisplayName(string displayName)
        {
            DisplayName = displayName;
            return this;
        }

        /// <summary>
        /// Set availability for the entity.
        /// </summary>
        /// <param name="enabled">Enable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityMetadataDescriptor<TEntity> SetEnabled(bool enabled)
        {
            IsEnabled = enabled;
            return this;
        }

        /// <summary>
        /// Set entity plural display name.
        /// </summary>
        /// <param name="displayNamePlural">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityMetadataDescriptor<TEntity> SetDisplayNamePlural(string displayNamePlural)
        {
            DisplayNamePlural = displayNamePlural;
            return this;
        }

        /// <summary>
        /// Set entity description.
        /// </summary>
        /// <param name="description">Description to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityMetadataDescriptor<TEntity> SetDescription(string description)
        {
            Description = description;
            return this;
        }

        /// <summary>
        /// Get entity property metadata descriptor.
        /// </summary>
        /// <param name="propertySelector">Property expression.</param>
        /// <returns>Property metadata descriptor instance.</returns>
        public EntityPropertyMetadataDescriptor Property(Expression<Func<TEntity, object>> propertySelector)
        {
            PropertyInfo property;
            if (propertySelector.Body is MemberExpression expression) {
                property = (PropertyInfo)expression.Member;
            }
            else {
                var memberExpression = ((UnaryExpression)propertySelector.Body).Operand as MemberExpression;
                property = (PropertyInfo)memberExpression.Member;
            }

            var propertyMetadataDescriptor = new EntityPropertyMetadataDescriptor
            {
                PropertyInfo = property
            };
            MetadataProperties.Add(propertyMetadataDescriptor);
            return propertyMetadataDescriptor;
        }

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
