using Microsoft.EntityFrameworkCore;

using EasyData.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options => {
    options.UseSqlite(builder.Configuration.GetConnectionString("EasyDataDBSQLite"));

    // Uncomment to use demo with SQL Server express
    // options.UseSqlServer(builder.Configuration.GetConnectionString("EasyDataDB"));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.MapEasyData(options => {
    options.UseDbContext<AppDbContext>();
});

app.MapControllers();

// The React app handles every other route (in production it is served from wwwroot)
app.MapFallbackToFile("index.html");

app.EnsureDbInitialized(builder.Configuration, app.Environment);

app.Run();
