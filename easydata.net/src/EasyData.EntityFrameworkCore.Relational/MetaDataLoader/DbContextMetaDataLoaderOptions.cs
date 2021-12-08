using System;
using System.Collections.Generic;

using Microsoft.EntityFrameworkCore.Metadata;

namespace EasyData.EntityFrameworkCore
{
    using EntityFilter = Func<IEntityType, bool>;

    /// <summary>
    /// Contains different options for <see cref="DbContextMetaDataLoader"/>
    /// </summary>
    public class DbContextMetaDataLoaderOptions
    {
        /// <summary>
        /// The Filters
        /// </summary>
        public IReadOnlyList<EntityFilter> Filters => _filters;

        private List<EntityFilter> _filters = new List<EntityFilter>();

        /// <summary>
        /// Adds a filter, which will be used during model loading from <see cref="Microsoft.EntityFrameworkCore.DbContext"/> 
        /// </summary>
        /// <param name="filter"></param>
        public void AddFilter(EntityFilter filter)
        {
            _filters.Add(filter);
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
        public bool SkipForeignKeys { get; set; } = true;

        /// <summary>
        /// Gets or sets a value indicating whether entities must keep order of DbSet declarations.
        /// </summary>
        public bool KeepDbSetDeclarationOrder { get; set; } = false;


        /// <summary>
        /// Store metadata.
        /// </summary>
        public Action<MetadataModelBuilder> ModelConfigurator { get; private set; }

        /// <summary>
        /// Build metadata.
        /// </summary>
        /// <param name="configurator">The procedure that configures the metadata model</param>
        public void Customize(Action<MetadataModelBuilder> configurator)
        {
            ModelConfigurator = configurator;
        }

    }
}
