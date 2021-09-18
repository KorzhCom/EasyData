using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Builder;

using Microsoft.EntityFrameworkCore;

using EasyData.Services;
using EasyDataBasicDemo;
using Korzh.DbUtils;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options 
    => options.UseSqlServer(builder.Configuration.GetConnectionString("EasyDataDB")));
builder.Services.AddRazorPages();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.MapEasyData(options => {
    options.UseDbContext<AppDbContext>();
});

EnsureDbInitialized(app);

app.Run();


static void EnsureDbInitialized(WebApplication app)
{
    using (var scope = app.Services.GetRequiredService<IServiceScopeFactory>().CreateScope())
    using (var context = scope.ServiceProvider.GetService<AppDbContext>())
    {
        if (context.Database.EnsureCreated())
        {
            DbInitializer.Create(options => {
                options.UseSqlServer(app.Configuration.GetConnectionString("EasyDataDB"));
                options.UseZipPacker(System.IO.Path.Combine(app.Environment.ContentRootPath, "App_Data", "EqDemoData.zip"));
            })
            .Seed();
        }
    }
}
