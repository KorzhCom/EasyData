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
    public class VoidMetaEntityBuilder<TEntity> : IMetaEntityBuilder<TEntity> where TEntity : class
    {
        protected MetadataModelBuilder ModelBuilder { get; private set; }

        /// <summary>
        /// Initialize the builder
        /// </summary>
        public VoidMetaEntityBuilder(MetadataModelBuilder modelBuilder)
        {
            ModelBuilder = modelBuilder;
        }

        /// <summary>
        /// Does nothing.
        /// </summary>
        /// <param name="displayName">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityBuilder<TEntity> SetDisplayName(string displayName)
        {
            return this;
        }


        /// <summary>
        /// Set availability for the entity.
        /// </summary>
        /// <param name="enabled">Enable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityBuilder<TEntity> SetEnabled(bool enabled)
        {
            return this;
        }

        /// <summary>
        /// Does nothing
        /// </summary>
        /// <param name="displayNamePlural">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityBuilder<TEntity> SetDisplayNamePlural(string displayNamePlural)
        {
            return this;
        }

        /// <summary>
        /// Does nothing
        /// </summary>
        /// <param name="description">Description to set.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityBuilder<TEntity> SetDescription(string description)
        {
            return this;
        }

        /// <summary>
        /// Does nothing
        /// </summary>
        /// <param name="editable">Editable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityBuilder<TEntity> SetEditable(bool editable)
        {
            return this;
        }

        private IMetaEntityAttrBuilder _emptyAttrBuilder;

        public IMetaEntityAttrBuilder Attribute(Expression<Func<TEntity, object>> propertySelector)
        {
            if (_emptyAttrBuilder == null) { 
                _emptyAttrBuilder = new VoidMetaEntityAttrBuilder();
            }
            return _emptyAttrBuilder;
        }
    }
}
