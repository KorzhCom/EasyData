using Korzh.DbUtils;

public static class DbInitializerExtension
{
    public static void EnsureDbInitialized(this IApplicationBuilder app, IConfiguration config, IWebHostEnvironment env)
    {
        using var scope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope();
        using var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

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

