using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Reflection;
using Microsoft.EntityFrameworkCore.Metadata;

namespace EasyData.EntityFrameworkCore
{
    using EntityFilter = Func<IEntityType, bool>;
    using PropertyFilter = Func<IProperty, bool>;

    /// <summary>
    /// Contains different options for <see cref="DbContextMetaDataLoader"/>
    /// </summary>
    public class DbContextMetaDataLoaderOptions
    {
        private List<EntityFilter> _entityFilters = new List<EntityFilter>();

        /// <summary>
        /// Gets the list of entity filters
        /// </summary>
        public IReadOnlyList<EntityFilter> EntityFilters => _entityFilters;


        private List<PropertyFilter> _propertyFilters = new List<PropertyFilter>();

        /// <summary>
        /// Gets the list of property filters.
        /// </summary>
        /// <value>The property filters.</value>
        public IReadOnlyList<PropertyFilter> PropertyFilters => _propertyFilters;

        /// <summary>
        /// Adds a filter, which will be used during model loading from <see cref="Microsoft.EntityFrameworkCore.DbContext"/> 
        /// </summary>
        /// <param name="filter"></param>
        [Obsolete("Use AddEntityFilter instead")]
        public void AddFilter(EntityFilter filter)
        {
            AddEntityFilter(filter);
        }

        /// <summary>
        /// Adds an entity filter
        /// that will be used during the loading of the model from a <see cref="Microsoft.EntityFrameworkCore.DbContext" />
        /// </summary>
        /// <param name="filter">The filter.</param>
        /// <returns>DbContextMetaDataLoaderOptions (to use in chained calls).</returns>
        public DbContextMetaDataLoaderOptions AddEntityFilter(EntityFilter filter)
        {
            _entityFilters.Add(filter);
            return this;
        }

        /// <summary>
        /// Adds the property filter.
        /// that will be used during the loading of the model from a <see cref="Microsoft.EntityFrameworkCore.DbContext" />
        /// </summary>
        /// <param name="filter">The filter.</param>
        /// <returns>DbContextMetaDataLoaderOptions (to use in chained calls).</returns>
        public DbContextMetaDataLoaderOptions AddPropertyFilter(PropertyFilter filter)
        { 
            _propertyFilters.Add(filter);
            return this;
        }

        /// <summary>
        /// Adds an entity filter (if the list of property selectors is empty) or bunch of property filters
        /// that makes the model loader skip the specified entity or properties.
        /// </summary>
        /// <typeparam name="TEntity">The type of the model class the represent the entity which should be skipped
        /// (or some of its properties should be skipped).</typeparam>
        /// <param name="propertySelectors">The list of property selectors. Each selector defines a property that should be skipped during the metadata loading.</param>
        /// <returns>DbContextMetaDataLoaderOptions (to use in chained calls).</returns>
        public DbContextMetaDataLoaderOptions Skip<TEntity>(params Expression<Func<TEntity, object>>[] propertySelectors) 
            where TEntity : class
        {
            if (propertySelectors == null || propertySelectors.Length == 0) {
                AddEntityFilter(ent => !ent.ClrType.Equals(typeof(TEntity)));
            }
            else {
                foreach (var propSelector in propertySelectors) {
                    var propInfo = Utils.GetPropertyInfoBySelector(propSelector);
                    AddPropertyFilter(prop => !prop.PropertyInfo.Equals(propInfo));
                }
            }

            return this;
        }

        /// <summary>
        /// Gets or sets a value indicating whether we need to hide primary key fields in the data model.
        /// </summary>
        /// <value><c>true</c> if the primary key fields must be hidden; otherwise, <c>false</c>.</value>
        public bool HidePrimaryKeys { get; set; } = true;

        /// <summary>
        /// Gets or sets a value indicating whether we need to skip foreign key fields and don't include them into the data model.
        /// </summary>
        /// <value><c>true</c> if the foreign key fields must be skipped; otherwise, <c>false</c>.</value>
        public bool SkipForeignKeys { get; set; } = false;

        /// <summary>
        /// Gets or sets a value indicating whether entities must keep order of DbSet declarations.
        /// </summary>
        public bool KeepDbSetDeclarationOrder { get; set; } = false;

        /// <summary>
        /// Gets the delegate that will be called at the end of metadata loading to customize loaded entities and attributes (properties).
        /// </summary>
        public Action<MetadataCustomizer> ModelCustomizer { get; private set; }

        /// <summary>
        /// Sets the model customizer - an action that configures some entities and their properties in the loaded model.
        /// </summary>
        /// <param name="customizer">The procedure that configures the metadata model</param>
        public void CustomizeModel(Action<MetadataCustomizer> customizer)
        {
            ModelCustomizer = customizer;
        }
    }
}
