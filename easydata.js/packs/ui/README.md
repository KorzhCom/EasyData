# @easydata/ui (a part of EasyData library)

## What is EasyData?

EasyData is an open-source library that allows you to simplify data management and data visualization tasks in your web applications. Here we are talking about usual CRUD (create, retrieve, update, delete) operations first of all.

EasyData introduces a declarative approach to building a user interface for most data operations. 
You simply describe your data: entities (tables), attributes (fields), relationships between them, data types, constraints, etc., and EasyData automatically, at run-time renders the necessary forms and dialogs to view, search and edit the data.

## What is @easydata/ui package?

This is the UI package of the client-side part of the EasyData library (also called EasyData.JS). 
It contains some basic utilties for DOM manipulation and all classes and widgets (like data grid, forms, dialogs, value editors, etc.) necessary to render the user interface for CRUD operations. 
This utilities, classes and widgets are used in other packages of EasyData.JS library such as `@easydata/crud`.

## How to start?

@easydata NPM packages make up the client-side part of EasyData. It means that you need something on your server-side to utilize EasyData in your project. The possible options are:

### 1. ASP.NET Core projects

To start with ASP.NET Core backend you can simply clone [EasyData repository on GitHub](https://github.com/KorzhCom/EasyData/) and try one of the sample projects included in that repository. After that, you can follow [the instruction](https://github.com/KorzhCom/EasyData/blob/master/README.md) published there to apply EasyData to your own project.

### 2. Any other backend platform.

Sorry, but it's not possible yet :(

Please [submit an issue on GitHub](https://github.com/KorzhCom/EasyData/issues) (or vote for an existing one) to encourage us to add the support for your platform of choice faster.

## Documentation

 * [GitHub repo README] (https://github.com/KorzhCom/EasyData/blob/master/README.md) 
 * [An overview and some basic instructions](https://korzh.com/blog/crud-asp-net-core-with-easydata)
 * [Sample projects](https://github.com/KorzhCom/EasyData/tree/master/samples) (for ASP.NET Core only for now)

## License
This package (together with all other packages in @easydata) is distributed under MIT license.

