using System.Linq;
using System.Reflection;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using EasyData.MetaDescriptors;
using System;

namespace EasyData.EntityFrameworkCore
{
    public abstract class DbContextMetaDataLoader
    {
        protected DbContextMetaDataLoaderOptions Options = new DbContextMetaDataLoaderOptions();
        protected DbContext DbContext;

        protected DbContextMetaDataLoader(DbContext context, DbContextMetaDataLoaderOptions options)
        {
            DbContext = context;
            Options = options;
        }

        protected DbContextMetaDataLoader(DbContext context)
        {
            DbContext = context;
        }

        /// <summary>
        /// Get entity types from db context.
        /// </summary>
        /// <param name="contextModel">Db context Metadata.</param>
        /// <returns>Collection of entity types.</returns>
        protected IEnumerable<IEntityType> GetEntityTypes(IModel contextModel)
        {
            return contextModel.GetEntityTypes().Where(ApplyFilters);
        }

        /// <summary>
        /// Apply filter to each entity type.
        /// </summary>
        /// <param name="entityType">Entity type.</param>
        private bool ApplyFilters(IEntityType entityType)
        {
            return Options.Filters.All(filter => filter.Invoke(entityType));
        }
    }
}
