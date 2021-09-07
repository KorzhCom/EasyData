using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;

namespace EasyData.Services
{
    public class EntityMetaBuilder<TEntity> : IEntityMetaBuilder
    {
        /// <summary>
        /// Entity attributes meta information.
        /// </summary>
        private List<EntityAttributeMetaBuilder> attributeMetaBuilders = new List<EntityAttributeMetaBuilder>();

        /// <inheritdoc />
        public string DisplayName { get; private set; }

        /// <inheritdoc />
        public bool? Enabled { get; private set; }

        /// <inheritdoc />
        public string DisplayNamePlural { get; private set; }

        /// <inheritdoc />
        public string Description { get; private set; }

        /// <inheritdoc />
        public Type ClrType => typeof(TEntity);

        /// <inheritdoc />
        public List<EntityAttributeMetaBuilder> AttributeMetaBuilders => attributeMetaBuilders;

        /// <summary>
        /// Set entity display name.
        /// </summary>
        /// <param name="displayName">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityMetaBuilder<TEntity> SetDisplayName(string displayName)
        {
            DisplayName = displayName;
            return this;
        }

        /// <summary>
        /// Set availability for the entity.
        /// </summary>
        /// <param name="enabled">Enable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityMetaBuilder<TEntity> SetEnabled(bool enabled)
        {
            Enabled = enabled;
            return this;
        }

        /// <summary>
        /// Set entity plural display name.
        /// </summary>
        /// <param name="displayNamePlural">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityMetaBuilder<TEntity> SetDisplayNamePlural(string displayNamePlural)
        {
            DisplayNamePlural = displayNamePlural;
            return this;
        }

        /// <summary>
        /// Set entity description.
        /// </summary>
        /// <param name="description">Description to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityMetaBuilder<TEntity> SetDescription(string description)
        {
            Description = description;
            return this;
        }

        /// <summary>
        /// Get entity attribute meta builder.
        /// </summary>
        /// <param name="propertySelector">Property expression.</param>
        /// <returns>Attribute meta builder instance.</returns>
        public EntityAttributeMetaBuilder Attribute(Expression<Func<TEntity, object>> propertySelector)
        {
            var property = (PropertyInfo)((MemberExpression)propertySelector.Body).Member;
            var attributeBuilder = new EntityAttributeMetaBuilder(property);
            attributeMetaBuilders.Add(attributeBuilder);
            return attributeBuilder;
        }
    }
}
