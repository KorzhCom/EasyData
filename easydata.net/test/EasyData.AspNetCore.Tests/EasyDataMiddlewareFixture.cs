using System;
using System.Data.Common;

using Microsoft.Data.Sqlite;

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

    public class EasyDataMiddlewareFixture: IDisposable
    {

        private readonly IHost _host;

        private readonly SqliteConnection _connection;

        public EasyDataMiddlewareFixture()
        {
            _connection = new SqliteConnection("Data Source=file::memory:");

            _host = new HostBuilder()
             .ConfigureWebHost(webBuilder =>
             {
                 webBuilder
                     .UseTestServer()
                     .ConfigureServices(services =>
                     {
                         services.AddEntityFrameworkSqlite();
                         services.AddDbContext<TestDbContext>(options => {
                             options.UseSqlite(_connection);
                             options.UseInternalServiceProvider(services.BuildServiceProvider());
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
                        options.UseSqlite(_connection);
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

        public void Dispose()
        {
            _connection.Dispose();
        }
    }
}
