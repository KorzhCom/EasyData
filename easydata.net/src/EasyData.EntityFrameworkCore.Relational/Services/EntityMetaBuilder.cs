using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using EasyData.MetaDescriptors;

namespace EasyData.EntityFrameworkCore.Services
{
    /// <summary>
    /// Builder for entity metadata.
    /// </summary>
    public class EntityMetaBuilder<T>:IEntityMetaBuilder where T : class
    {
        /// <inheritdoc />
        public EntityMetadataDescriptor EntityMetadataDescriptor { get; }

        /// <inheritdoc />
        public Type ClrType => typeof(T);

        /// <summary>
        /// Initialize entity metadata descriptor.
        /// </summary>
        public EntityMetaBuilder()
        {
            EntityMetadataDescriptor = new EntityMetadataDescriptor
            {
                ClrType = typeof(T)
            };
        }

        /// <summary>
        /// Set entity display name.
        /// </summary>
        /// <param name="displayName">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityMetaBuilder<T> SetDisplayName(string displayName)
        {
            EntityMetadataDescriptor.DisplayName = displayName;
            return this;
        }

        /// <summary>
        /// Set availability for the entity.
        /// </summary>
        /// <param name="enabled">Enable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityMetaBuilder<T> SetEnabled(bool enabled)
        {
            EntityMetadataDescriptor.IsEnabled = enabled;
            return this;
        }

        /// <summary>
        /// Set entity plural display name.
        /// </summary>
        /// <param name="displayNamePlural">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityMetaBuilder<T> SetDisplayNamePlural(string displayNamePlural)
        {
            EntityMetadataDescriptor.DisplayNamePlural = displayNamePlural;
            return this;
        }

        /// <summary>
        /// Set entity description.
        /// </summary>
        /// <param name="description">Description to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityMetaBuilder<T> SetDescription(string description)
        {
            EntityMetadataDescriptor.Description = description;
            return this;
        }


        /// <summary>
        /// Get entity attribute metadata builder.
        /// </summary>
        /// <param name="propertySelector">Property expression.</param>
        /// <returns>Attribute metadata builder instance.</returns>
        public EntityAttributeMetaBuilder Attribute(Expression<Func<T, object>> propertySelector)
        {
            PropertyInfo propertyInfo;

            if (propertySelector.Body is MemberExpression expression) {
                propertyInfo = (PropertyInfo) expression.Member;
            }
            else {
                var memberExpression = ((UnaryExpression) propertySelector.Body).Operand as MemberExpression;
                propertyInfo = (PropertyInfo) memberExpression.Member;
            }

            var attributeBuilder = new EntityAttributeMetaBuilder(propertyInfo);
            EntityMetadataDescriptor.MetadataAttributes.Add(attributeBuilder.EntityAttributeMetadataDescriptor);
            return attributeBuilder;
        }
    }
}
