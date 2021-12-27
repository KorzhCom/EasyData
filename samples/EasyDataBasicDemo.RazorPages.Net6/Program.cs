using Microsoft.EntityFrameworkCore;
using EasyData.EntityFrameworkCore;
using EasyData.Services;

using EasyDataBasicDemo;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddDbContext<AppDbContext>(options => {
    options.UseSqlite(builder.Configuration.GetConnectionString("EasyDataDBSQLite"));

    // Uncomment to use demo with SQL Server express
    // options.UseSqlServer(builder.Configuration.GetConnectionString("EasyDataDB"));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment()) {
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapEasyData((options) => {
    options.UseDbContext<AppDbContext>();
});
app.MapRazorPages();

app.EnsureDbInitialized(builder.Configuration, app.Environment);

app.Run();
