# EasyData

EasyData library lets you quickly build a UI for CRUD (Create, Retrieve, Update, Delete) operations in any ASP.NET Core application that uses Entity Framework Core.

Basically, EasyData does the following two things:
 
* First, it “reads” your DbContext object in order to obtain the necessary metadata.

* Then, based on that metadata, it provides an API endpoint for all CRUD operations and renders the UI (pages and dialogs) that communicate with the API endpoint for data-management tasks.

The real advantage here is that whenever you change something in your DbContext (add a new DbSet or a new property in the model class), the UI will automatically adjust to those changes.

So, as you can see, EasyData can be very useful for quick prototyping of any database-related ASP.NET Core project. In just minutes you'll have a working web app with all CRUD forms for your database.


## Getting started

Installing EasyData to your project takes the following 3 simple steps:

### 1. Install EasyData NuGet packages

* EasyData.AspNetCore
* EasyData.EntityFrameworkCore.Relational

### 2. Add EasyData middleware in `Startup.Configure`

```c#
using EasyData.Services;
.    .    .    .    .

    app.UseEndpoints(endpoints =>
    {
        endpoints.MapEasyData(optionsTuner: (options) => {
            options.UseManager<EasyDataManagerEF<AppDbContext>>();
        });

        endpoints.MapRazorPages();
    });

```

In the middleware options we also specify the type of DbContext that will be used as the source of the metadata.

### 3. Set up a catch-all page for all CRUD operations

If you're using Razor Pages, add a new page (for example `EasyData.chstml`). If it’s MVC, you'll need a controller and a view.
This page will "catch" all URLs that begin with a certain prefix (`/easydata` in our example). So, we use a special catch-all parameter in the route definition (`"/easydata/{**entity}"`).

We also add `easydata.crud.min.js` script, which facilitates the rendering of data-management UI and handles all CRUD operations.

```
@page "/easydata/{**entity}"
@{
    ViewData["Title"] = "EasyData";
}

<div id="EasyDataContainer"></div>

@section Scripts {

    <script src="https://cdn.korzh.com/ed/1.1.0/easydata.crud.min.js" type="text/javascript"></script>
}
```

That’s it. Now you can run your web app, open the `/easydata` URL and enjoy CRUD functionality.


## Main features

### 1.  Declarative approach

All aspects of your CRUD UI are controlled by the data structure defined in DbContext. If you need to tune it up (e.g., to to hide a table or some fields or perhaps change their names), there are special attributes for your model classes and properties with which to do that.

### 2. Automatic UI rendering

All data forms and dialogs are rendered automatically by EasyQuery.JS script according to the metadata acquired from the DbContext and your annotations on model classes and their properties.
The script can be used with any framework or library used on the client side, such as Razor Pages, MVC Views, Angular, React, Vue, etc.

### 3. Ad hoc data filtering

In the data view mode, EasyData provides with a data-filtering functionality, which works out of the box and requires no additional setup or coding.

## Questions, Suggestions?

Feel free to [submit an issue](https://github.com/korzh/EasyData/issues) here. We'll try to help you as soon as possible. 
However, please don't be too demanding with your requests :). Remember that EasyData is an open-source project that we maintain on our spare time.
