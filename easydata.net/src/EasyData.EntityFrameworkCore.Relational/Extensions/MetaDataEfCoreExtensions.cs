using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace EasyData.EntityFrameworkCore
{
    public static class MetaDataEfCoreExtensions
    {

        /// <summary>
        /// Loads the model from a database context.
        /// </summary>
        /// <param name="model">A DbModel object.</param>
        /// <param name="context">A DbContext object to load the model from.</param>
        public static void LoadFromDbContext(this MetaData model, DbContext context)
        {
            LoadFromDbContext(model, context, new DbContextMetaDataLoaderOptions());
        }


        /// <summary>
        /// Loads the model from a database context.
        /// </summary>
        /// <param name="model">A DbModel object.</param>
        /// <param name="context">A DbContext object to load the model from.</param>
        /// <param name="options">Different options</param>
        public static void LoadFromDbContext(this MetaData model, DbContext context, DbContextMetaDataLoaderOptions options)
        {
            var loader = new MetaDataLoaderEF(context, model, options);
            loader.LoadFromDbContext();
        }
    }
}
