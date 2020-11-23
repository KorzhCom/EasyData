using System;
using System.Collections.Generic;
using System.Text;
using EasyData.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace EasyData.Services
{
    public static class EasyDataOptionsExtensions
    {
        public static void UseDbContext<TDbContext>(this EasyDataOptions easyDataOptions, Action<DbContextMetaDataLoaderOptions> loaderOptionsBuilder = null) where TDbContext : DbContext
        {
            if (loaderOptionsBuilder != null) {
                easyDataOptions.MetaDataLoaderOptionsBuilder = (options) => loaderOptionsBuilder(options as DbContextMetaDataLoaderOptions);
            }
            easyDataOptions.UseManager<EasyDataManagerEF<TDbContext>>();
        }
    }
}
