
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using System.Reflection;
using System.Linq;

using Newtonsoft.Json;

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

            services.AddEasyData()
                    .AddDefaultExporters()
                    .AddPdfExporter();

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

                    options.UseManager<CustomEasyDataManager>();
                    options.UseModelTuner(model => {
                        model.DisplayFormats.SetDefault(EasyData.DataType.DateTime, "Long date & time");

                        var categoryDesc = model.FindEntityAttr("Category.Description");
                        categoryDesc.DefaultEditor = new TextValueEditor($"TVE_MULTI_{categoryDesc.Id}") {
                            Multiline = true
                        };
                    });

                    options.UseDbContext<AppDbContext>(opts => {
                        opts.SkipForeignKeys = false;

                        //opts.CustomizeModel(model => {
                        //    var customerEntity = model.Entity<Customer>()
                        //        .SetDisplayName("Client")
                        //        .SetDisplayNamePlural("Clients");

                        //    customerEntity
                        //        .Attribute(c => c.Fax)
                        //            .SetShowOnView(false);

                        //    customerEntity
                        //        .Attribute(c => c.PostalCode)
                        //            .SetShowOnView(false);

                        //    customerEntity
                        //        .Attribute(c => c.Country)
                        //            .SetDisplayName("Country name")
                        //            .SetDescription("Country where the client lives");

                        //    var orderEntity = model.Entity<Order>();

                        //    orderEntity
                        //        .Attribute(o => o.OrderDate)
                        //            .SetDisplayFormat("{0:yyyy-MM-dd}");

                        //    orderEntity
                        //        .Attribute(o => o.ShippedDate)
                        //            .SetDisplayFormat("{0:yyyy-MM-dd}");

                        //});
                    });
                });

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


    public class CustomEasyDataManager : EasyDataManagerEF<AppDbContext>
    {
        public CustomEasyDataManager(IServiceProvider services, EasyDataOptions options) 
            : base(services, options)
        {
        }

        public override async Task<EasyDataResultSet> FetchDatasetAsync(
                string modelId,
                string sourceId,
                IEnumerable<EasyFilter> filters = null,
                IEnumerable<EasySorter> sorters = null,
                bool isLookup = false, int? offset = null, int? fetch = null, CancellationToken ct = default)
        { 
        
            var myFilters = new List<EasyFilter>(filters);
            myFilters.Add(new MyCustomFilter(Model));

            return await base.FetchDatasetAsync(modelId, sourceId, myFilters, sorters, isLookup, offset, fetch, ct);
        }
    }

    public class MyCustomFilter : EasyFilter
    {
        public MyCustomFilter(MetaData model) : base(model)
        {
        }

        public override object Apply(MetaEntity entity, bool isLookup, object data)
        {
            if (entity.Name != "Order") return data;

            return GetType().GetMethods(BindingFlags.Instance | BindingFlags.NonPublic)
               .Single(m => m.Name == "FilterQueryable" && m.IsGenericMethodDefinition)
               .MakeGenericMethod(entity.ClrType)
               .Invoke(this, new object[] { entity, isLookup, data });
        }

        private IQueryable<T> FilterQueryable<T>(MetaEntity entity, bool isLookup, object data) where T : class
        {
            return (IQueryable<T>)data;
            //return query.Where(/* your condition is here */);
        }

        public override Task ReadFromJsonAsync(JsonReader reader, CancellationToken ct = default)
        {
            //do nothing since  we will not read the parameters of this filter from a request
            return Task.CompletedTask;
        }
    }
}
