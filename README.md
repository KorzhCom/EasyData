# EasyData

| Build .NET | Build JS | Nuget | Npm |
|---|---|---|---|
| [![Build status](https://github.com/KorzhCom/EasyData/workflows/EasyData.NET%20Pipeline/badge.svg?branch=master&event=push)](https://github.com/KorzhCom/EasyData/actions?query=workflow%3A%22EasyData.NET+Pipeline%22+event%3Apush+branch%3Amaster)  | [![Build status](https://github.com/KorzhCom/EasyData/workflows/EasyData.JS%20Pipeline/badge.svg?branch=master&event=push)](https://github.com/KorzhCom/EasyData/actions?query=workflow%3A%22EasyData.JS+Pipeline%22+event%3Apush+branch%3Amaster) | [![NuGet](https://img.shields.io/nuget/v/EasyData.AspNetCore.svg)](https://www.nuget.org/packages/EasyData.AspNetCore) | [![Npm](https://img.shields.io/npm/v/@easydata/crud/latest)](https://www.npmjs.com/package/@easydata/crud) |

## About

EasyData library lets you quickly build a UI for CRUD (Create, Read, Update, Delete) operations in any ASP.NET Core application that uses Entity Framework Core.

Basically, EasyData does the following two things:
 
* First, it “reads” your DbContext object in order to obtain the necessary metadata.

* Then, based on that metadata, it provides an API endpoint for all CRUD operations and renders the UI (pages and dialogs) that communicate with the API endpoint for data-management tasks.

The real advantage here is that whenever you change something in your DbContext (add a new DbSet or a property in the model class), the UI automatically adjusts to those changes.

So, as you can see, EasyData can be very useful for quick prototyping of any database-related ASP.NET Core project. In just minutes you'll have a working web app with all CRUD forms for your database.

## Quick demo

![EasyData quick demo](https://cdn.korzh.com/img/easydata-demo01.gif "EasyData quick demo")


## Getting started

First of all, to test EasyData you can open and run one of the [sample projects](https://github.com/korzh/EasyData/tree/master/samples) available in this repository. 

Installing EasyData to your own project takes the following 3 simple steps:

### 1. Install EasyData NuGet packages

* EasyData.AspNetCore
* EasyData.EntityFrameworkCore.Relational

### 2. Add EasyData middleware in `Startup.Configure`

```c#
using EasyData.Services;
.    .    .    .    .

    app.UseEndpoints(endpoints =>
    {
        endpoints.MapEasyData(options => {
            options.UseDbContext<AppDbContext>();
        });

        endpoints.MapRazorPages();
    });

```

In the middleware options we also specify the type of DbContext object that will be used as the source of the metadata.

### 3. Set up a catch-all page for all CRUD operations

If you're using Razor Pages, add a new page (for example `EasyData.chstml`). If it’s MVC, you'll need a controller and a view.
This page will "catch" all URLs that begin with a certain prefix (`/easydata` by default but it's configurable). So, we use a special catch-all parameter in the route definition (`"/easydata/{**entity}"`).

We also add EasyData styles and the script file (`easydata.min.js`), which renders the data-management UI and handles all CRUD operations on the client-side.

```razor
@page "/easydata/{**entity}"
@{
    ViewData["Title"] = "EasyData";
}
<link rel="stylesheet" href="https://cdn.korzh.com/ed/1.2.3/easydata.min.css" />

<div id="EasyDataContainer"></div>

@section Scripts {
    <script src="https://cdn.korzh.com/ed/1.2.3/easydata.min.js" type="text/javascript"></script>
    <script>
        window.addEventListener('load', function () {
            new easydata.crud.EasyDataViewDispatcher().run()
        });
    </script>
}
```

That’s it. Now you can run your web app, open the `/easydata` URL and enjoy CRUD functionality.


## Main features

### 1.  Declarative approach

All aspects of your CRUD UI are controlled by the data structure defined in DbContext. If you need to tune it up (for example, to hide a table or some fields, or, perhaps, to change their names), there are special attributes for your model classes and properties with which to do that.

### 2. Automatic UI rendering

All data forms and dialogs are rendered automatically by EasyData.JS script according to the metadata acquired from the DbContext and your annotations on model classes and their properties.

The script can be used with any framework or library used on the client-side, such as Razor Pages, MVC Views, Angular, React, Vue, etc.

### 3. Ad hoc data filtering

In the data view mode, EasyData provides a data-filtering functionality, which works out of the box and requires no additional setup or coding.

## Advanced tasks

Sometimes you may need to make some adjustments to the default behavior of EasyData. Here we listed the solutions for the most common problems.

### Filtering entities (tables) and their attributes (fields)

By default, EasyData works with all entities (tables) defined in your DbContext. As well as with all fields in those tables. 
However, very often you need to hide some tables or fields from your end-users.
You can do it using `MetaEntity` and `MetaEntityAttr` annotations that can be specified for model classes and properties correspondingly. 

Here is an example of how to hide the table defined by the `Customer` model class:

```c#
[MetaEntity(false)]
public class Customer
{
 .   .   .   .
}
```

The same approach (but with `MetaEntityAttr` attribute now) we can use to hide some property (field):

```c#
public class User
{
    [MetaEntityAttr(false)]
    public string PasswordHash { get; set; }
}
```

Both these annotations also have other properties that allow you to adjust the way your tables and fields are represented in the CRUD UI.

For example, the following line:

```c#
[MetaEntity(DisplayName = “Client”, DisplayNamePlural = “Clients”, Description = “List of clients”]
public class Customer
{
 .   .   .   .
}
```
will set the display names and the description for the `Customers` table.


Here is another example, now for a property in some model class:

```c#
public class BlogPost 
{
    [MetaEntityAttr(DisplayName = “Created”, Editable = false, ShowOnView = true, ShowInLookup = false)]
    public DateTime DateCreated { get; set;}
    .    .    .    .    .
}
```
Here we change the default display name for this field, make it non-editable (since this value is set on record creation and it can’t be changed later), and tell EasyData to show this field in the main view (with data table) but hide it in lookup dialogs.

`MetaEntityAttr` annotation also has `ShowOnCreate` and `ShowOnEdit` properties that allow you to show/hide the field from the "Create Record" or "Edit Record" dialog, respectively.

### Changing the default endpoint

The default EasyData API endpoint is `/api/easydata/` but it’s very easy to change it to any possible path. 

Server-side configuration:

```c#
app.UseEndpoints(endpoints => {
    endpoints.MapEasyData(options => {
        options.Endpoint = "/api/super-easy-crud";
        options.UseDbContext<ApplicationDbContext>();
    });
     .     .     .     .     .
});
```

On the client-side we can pass some options (including the endpoint) to the dispatcher’s constructor:

```html
    <script>
        window.addEventListener('load', function () {
            new easydata.crud.EasyDataViewDispatcher({
                endpoint: '/api/super-easy-crud'
            }).run()
        });
    </script>
```

### One entity CRUD page

Sometimes you don't need CRUD for all entities in your database but only for a few of them (or even only one). So, you don't need to show that root page with entity selection. You just can start with a data table view for one particular entity. 

Especially for this case, there is `rootEntity` option in `EasyDataViewDispatcher` class. If it's set, EasyData will no show the default root page with the list of entities but will render the view page for the specified entity (table) instead.

```html
<script>
    window.addEventListener('load', function () {
        new easydata.crud.EasyDataViewDispatcher({
            rootEntity: 'Order'
        }).run()
    });
</script>
```
### Display Formats

It’s also possible to set the display format for each entity attribute (table field). The format looks like `{0:XX}` where `XX` here is a format string that has the same meaning as in [string.Format](https://docs.microsoft.com/en-us/dotnet/standard/base-types/composite-formatting#format-string-component) function. 

Beloew you will find a few examples of using display formats.

This one tells EasyData to use the default "Long Date" format for OrderDate values: 

```c#
[MetaEntityAttr(DisplayFormat = "{0:D}")]
public DateTime? OrderDate { get; set; }
```

Here we use a custom format for date values:
```c#
[MetaEntityAttr(DisplayFormat = "{0:yyyy-MMM-dd}")]
public DateTime? OrderDate { get; set; }
```

Here we make it to use a currency format with 2 decimal digits
```c#
 [MetaEntityAttr(DisplayFormat = "{0:C2}")]
 public decimal Freight { get; set; }
```

With this format EasyData will show only digits (no grouping by thousands) and will add leading 0-s up to 8 digits totally (if necessary)
```c#
 [MetaEntityAttr(DisplayFormat = "{0:D8}")]
 public int Amount { get; set; }
```

## FAQ

> __Q:__ **What versions of .NET and ASP.NET do EasyQuery supports?**  
> __A:__ Currently we support .NET Core 3.1 and .NET 5 and, obviously, all versions of ASP.NET Core and Entity Framework Core that can work with these versions of .NET (Core). It’s not a great deal to add support for previous versions of .NET Core or even .NET Framework 4.x. If you really need it, please create a [GitHub issue](https://github.com/KorzhCom/EasyData/issues) about that.

> __Q:__ **I don’t like annotations. They ruin my pure data structures with some implementation-specific code. Do you support a Fluent API approach for setting all those filters, constraints, validators, and value editors?**   
> __A:__ Not yet. You can add a new [GitHub issue](https://github.com/KorzhCom/EasyData/issues) about that to make it happen faster.

> __Q:__ **I have a question regarding EasyData. Where to send it?**  
> __A:__ Feel free to [submit an issue](https://github.com/korzh/EasyData/issues) here. We'll try to help you as soon as possible. 
However, please don't be too demanding with your requests :). Remember that EasyData is an open-source project that we maintain on our spare time.
