using System;
using System.Collections.Generic;
using System.Text;

using Microsoft.EntityFrameworkCore;

namespace EasyData.EntityFrameworkCore.Relational
{
    public static class MetaDataEfCoreExtensions
    {

        /// <summary>
        /// Loads the model from a database context.
        /// </summary>
        /// <param name="dbModel">A DbModel object.</param>
        /// <param name="context">A DbContext object to load the model from.</param>
        public static void LoadFromDbContext(this MetaData model, DbContext context)
        {
            LoadFromDbContext(model, context, new DbContextLoaderOptions());
        }

   
        /// <summary>
        /// Loads the model from a database context.
        /// </summary>
        /// <param name="dbModel">A DbModel object.</param>
        /// <param name="context">A DbContext object to load the model from.</param>
        /// <param name="options">Different options</param>
        /// <param name="formats">Different formats which define some options of the model filling.</param>
        public static void LoadFromDbContext(this MetaData model, DbContext context, DbContextLoaderOptions options)
        {
            var loader = new DbContextLoader(model, options);
            loader.LoadFromDbContext(context);
        }
    }
}
