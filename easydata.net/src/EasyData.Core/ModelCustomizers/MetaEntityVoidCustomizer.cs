using System;
using System.Linq.Expressions;
using System.Reflection;


namespace EasyData
{
    /// <summary>
    /// Represents a special case of an entity builder that
    /// does not really change any MetaEntity object
    /// but rather saves information about which entities we need to ignore (skip)
    /// </summary>
    public class MetaEntityVoidCustomizer<TEntity> : IMetaEntityCustomizer<TEntity> where TEntity : class
    {
        protected MetadataCustomizer ModelBuilder { get; private set; }

        /// <summary>
        /// Initialize the builder
        /// </summary>
        public MetaEntityVoidCustomizer(MetadataCustomizer modelBuilder)
        {
            ModelBuilder = modelBuilder;
        }

        /// <summary>
        /// Does nothing.
        /// </summary>
        /// <param name="displayName">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityCustomizer<TEntity> SetDisplayName(string displayName)
        {
            return this;
        }


        /// <summary>
        /// Set availability for the entity.
        /// </summary>
        /// <param name="enabled">Enable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityCustomizer<TEntity> SetEnabled(bool enabled)
        {
            return this;
        }

        /// <summary>
        /// Does nothing
        /// </summary>
        /// <param name="displayNamePlural">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityCustomizer<TEntity> SetDisplayNamePlural(string displayNamePlural)
        {
            return this;
        }

        /// <summary>
        /// Does nothing
        /// </summary>
        /// <param name="description">Description to set.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityCustomizer<TEntity> SetDescription(string description)
        {
            return this;
        }

        /// <summary>
        /// Does nothing
        /// </summary>
        /// <param name="editable">Editable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityCustomizer<TEntity> SetEditable(bool editable)
        {
            return this;
        }

        private IMetaEntityAttrCustomizer _emptyAttrBuilder;

        public IMetaEntityAttrCustomizer Attribute(Expression<Func<TEntity, object>> propertySelector)
        {
            if (_emptyAttrBuilder == null) { 
                _emptyAttrBuilder = new MetaEntityAttrVoidCustomizer();
            }
            return _emptyAttrBuilder;
        }
    }
}
