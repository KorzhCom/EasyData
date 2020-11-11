using System;
using System.Collections.Generic;
using System.Text;

using Microsoft.EntityFrameworkCore;

namespace EasyData.Services
{
    public static class EasyDataOptionsExtensions
    {
        public static void UseDbContext<TDbContext>(this EasyDataOptions options) where TDbContext : DbContext
        {
            options.UseManager<EasyDataManagerEF<TDbContext>>();
        }
    }
}
