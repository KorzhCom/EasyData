using System;
using System.Collections.Generic;
using System.Text;

using Microsoft.EntityFrameworkCore.Metadata;

namespace EasyData.EntityFrameworkCore
{
    using EntityFilter = Func<IEntityType, bool>;

    /// <summary>
    /// Contains different options for <see cref="DbContextLoader"/>
    /// </summary>
    public class DbContextLoaderOptions
    {
        /// <summary>
        /// The Filtes
        /// </summary>
        public IReadOnlyList<EntityFilter> Filters => _filters;

        private List<EntityFilter> _filters = new List<EntityFilter>();

        /// <summary>
        /// Adds a filter, which will be used during model loading from <see cref="DbContext"/> 
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

    }
}
