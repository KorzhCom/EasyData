using Microsoft.EntityFrameworkCore;

using EasyData.Services;

using Korzh.DbUtils;
using EasyData;

using EasyDataBasicDemo;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options
    => options.UseSqlite(builder.Configuration.GetConnectionString("EasyDataDB")));
builder.Services.AddRazorPages();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.UseDeveloperExceptionPage();
}
else {
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.MapEasyData((options) => {
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

EnsureDbInitialized(app);

app.Run();


static void EnsureDbInitialized(WebApplication app)
{
    using (var scope = app.Services.GetRequiredService<IServiceScopeFactory>().CreateScope())
    using (var context = scope.ServiceProvider.GetService<AppDbContext>()) {
        if (context.Database.EnsureCreated()) {
            DbInitializer.Create(options => {
                options.UseSqlite(app.Configuration.GetConnectionString("EasyDataDB"));
                options.UseZipPacker(System.IO.Path.Combine(app.Environment.ContentRootPath, "App_Data", "EqDemoData.zip"));
            })
            .Seed();
        }
    }
}
