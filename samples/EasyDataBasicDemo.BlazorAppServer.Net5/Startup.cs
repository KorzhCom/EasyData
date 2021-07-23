using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Korzh.DbUtils;
using EasyData.Services;

using EasyDataBasicDemo.BlazorAppServer.Net5.Data;

namespace EasyDataBasicDemo.BlazorAppServer.Net5
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlite(Configuration.GetConnectionString("EasyDataDBSQLite"));

                // Uncomment to use demo with SQL Server express
                // options.UseSqlServer(Configuration.GetConnectionString("EasyDataDB"));
            });

            services.AddRazorPages();
            services.AddServerSideBlazor();
            services.AddSingleton<WeatherForecastService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapEasyData((options) => {
                    options.UseDbContext<AppDbContext>();
                });
                endpoints.MapBlazorHub();
                endpoints.MapFallbackToPage("/_Host");
            });

            EnsureDbInitialized(app, Configuration, env);
        }

        private static void EnsureDbInitialized(IApplicationBuilder app, IConfiguration config, IWebHostEnvironment env)
        {
            using (var scope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope())
            using (var context = scope.ServiceProvider.GetService<AppDbContext>())
            {
                if (context.Database.EnsureCreated())
                {
                    DbInitializer.Create(options => {

                        options.UseSqlite(config.GetConnectionString("EasyDataDBSQLite"));

                        // Uncomment to use demo with SQL Server express
                        // options.UseSqlServer(config.GetConnectionString("EasyDataDB"));
                        options.UseZipPacker(System.IO.Path.Combine(env.ContentRootPath, "App_Data", "EqDemoData.zip"));
                    })
                    .Seed();
                }
            }
        }
    }
}
