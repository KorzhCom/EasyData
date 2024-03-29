﻿using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Reflection;


namespace EasyData.EntityFrameworkCore
{
    /// <summary>
    /// Builder for entity metadata.
    /// </summary>
    public class MetaEntityCustomizer<TEntity> : IMetaEntityCustomizer<TEntity> where TEntity : class
    {
        public MetaEntity Entity { get; private set; }

        private readonly MetaEntityAttrVoidCustomizer _voidAttributeBuilder;
        private Dictionary<PropertyInfo, IMetaEntityAttrCustomizer> _builders = new Dictionary<PropertyInfo, IMetaEntityAttrCustomizer>();


        /// <summary>
        /// Initialize entity builder
        /// </summary>
        public MetaEntityCustomizer(MetaEntity entity)
        {
            Entity = entity;
            _voidAttributeBuilder = new MetaEntityAttrVoidCustomizer();
        }

        /// <summary>
        /// Set entity display name.
        /// </summary>
        /// <param name="displayName">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityCustomizer<TEntity> SetDisplayName(string displayName)
        {
            Entity.Name = displayName;
            return this;
        }

        /// <summary>
        /// Set entity plural display name.
        /// </summary>
        /// <param name="displayNamePlural">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityCustomizer<TEntity> SetDisplayNamePlural(string displayNamePlural)
        {
            Entity.NamePlural = displayNamePlural;
            return this;
        }

        /// <summary>
        /// Set entity description.
        /// </summary>
        /// <param name="description">Description to set.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityCustomizer<TEntity> SetDescription(string description)
        {
            Entity.Description = description;
            return this;
        }

        /// <summary>
        /// Set entity availability for editing.
        /// </summary>
        /// <param name="editable">Editable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityCustomizer<TEntity> SetEditable(bool editable)
        {
            Entity.IsEditable = editable;
            return this;
        }


        /// <summary>
        /// Get entity attribute metadata builder.
        /// </summary>
        /// <param name="propertySelector">Property expression.</param>
        /// <returns>Attribute metadata builder instance.</returns>
        public IMetaEntityAttrCustomizer Attribute(Expression<Func<TEntity, object>> propertySelector)
        {
            var propertyInfo = Utils.GetPropertyInfoBySelector(propertySelector);

            if (!_builders.TryGetValue(propertyInfo, out var attrBuilder)) {
                var metaAttr = Entity.FindAttribute(attr => attr.PropInfo.Equals(propertyInfo));
                if (metaAttr != null) {
                    attrBuilder = new MetaEntityAttrCustomizer(metaAttr);
                }
                else {
                    attrBuilder = _voidAttributeBuilder;
                }
            }

            return attrBuilder;
        }
    }

}
