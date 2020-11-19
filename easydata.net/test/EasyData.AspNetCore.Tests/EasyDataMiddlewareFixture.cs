using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.TestHost;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;

using EasyData.Services;
using Korzh.DbUtils;

namespace EasyData.AspNetCore.Tests
{

    public class EasyDataMiddlewareFixture
    {

        private readonly IHost _host;

        private readonly string _connectionString = "Data Source=file::memory:?cache=shared";

        public EasyDataMiddlewareFixture()
        {

            _host = new HostBuilder()
             .ConfigureWebHost(webBuilder =>
             {
                 webBuilder
                     .UseTestServer()
                     .ConfigureServices(services =>
                     {
                         services.AddDbContextPool<TestDbContext>(options => {
                             options.UseSqlite(_connectionString);
                         });

                         services.AddRouting();
                     })
                     .Configure(app =>
                     {
                         app.UseEasyData(options => {
                             options.UseDbContext<TestDbContext>();
                         });

                         app.UseRouting();

                         app.UseEndpoints(endpoints =>
                         {
                             endpoints.MapEasyData((options) => {
                                 options.Endpoint = "/api/data";
                                 options.UseDbContext<TestDbContext>();
                             });
                         });

                         EnsureDbInitialized(app);
                     });
             })
             .Start();
        }

        private void EnsureDbInitialized(IApplicationBuilder app)
        {
            using (var scope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope())
            using (var context = scope.ServiceProvider.GetService<TestDbContext>())
            {
                context.Database.OpenConnection();
                if (context.Database.EnsureCreated()) {
                    DbInitializer.Create(options => {
                        options.UseSqlite(_connectionString);
                        options.UseJsonImporter();
                        options.UseResourceFileUnpacker(typeof(EasyDataMiddlewareFixture).Assembly, "Resources\\Nwind");
                    })
                    .Seed();
                }
            }
        }

        public IHost GetTestHost()
        {
            return _host;
        }
    }
}
