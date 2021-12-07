
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using Korzh.DbUtils;
using EasyData.Services;
using EasyData;

using EasyDataBasicDemo.Models;

namespace EasyDataBasicDemo
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("EasyDataDB")));

            services.AddRazorPages();
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

            app.UseAuthorization();

            app.UseEndpoints(endpoints => {
                endpoints.MapEasyData((options) => {
                    options.Endpoint = "/api/easy-crud";
                    options.UseModelTuner(model =>
                    {
                        model.DisplayFormats.SetDefault(EasyData.DataType.DateTime, "Long date & time");

                        var categoryDesc = model.FindEntityAttr("Category.Description");
                        categoryDesc.DefaultEditor = new TextValueEditor($"TVE_MULTI_{categoryDesc.Id}")
                        {
                            Multiline = true
                        };
                    });
                    options.UseDbContext<AppDbContext>(opts => {
                        opts.SkipForeignKeys = false;

                        opts.UseMetaBuilder(builder => {
                            builder.Entity<Customer>()
                                .SetDisplayName("Client")
                                .SetDisplayNamePlural("Clients")
                                .Attribute(c => c.Country)
                                    .SetDisplayName("Country name")
                                    .SetDescription("Country where the client lives");

                            builder.Entity<Order>()
                                .Attribute(o => o.OrderDate)
                                    .SetDisplayFormat("{0:yyyy-MM-dd}");
                        });


                    //    opts.UseMetaBuilder()
                    //        .Skip<Category>()
                    //        .Skip<Supplier>()
                    //        .Entity<Customer>(ecfg => ecfg
                    //            .SetDisplayName("Client")
                    //            .SetDisplayNamePlural("Clients")
                    //            .Attribute(c => c.Country, attrConfig => attrConfig
                    //                .SetDisplayName("Country name")
                    //                .SetDescription("Country where the client lives")
                    //            )
                    //        )
                    //        .Entity<Order>(ecfg => ecfg
                    //            .Attribute(o => o.OrderDate)
                    //                .SetDisplayFormat("{0:yyyy-MM-dd}")
                    //        );
                    //    });



                    });
                });
                //.RequireAuthorization();

                endpoints.MapRazorPages();
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
                        options.UseSqlServer(config.GetConnectionString("EasyDataDB"));
                        options.UseZipPacker(System.IO.Path.Combine(env.ContentRootPath, "App_Data", "EqDemoData.zip"));
                    })
                    .Seed();
                }
            }
        }
    }
}
