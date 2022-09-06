# EasyData - instructions for contributors

## Repository structure

* __easydata.js__ - JS (TypeScript actually) library source code

* __easydata.net__ - .NET library source code

* __samples__ - sample projects that uses compiled packages and JS files

* __playground__ - testing projects that work with the latest source code directly

* __tools__ - different build tools and scripts


## Getting started

To start working with EasyData repository as a contributer you will need to do the following:

### Windows 

1. Install [NodeJS](https://nodejs.org/en/) (version 12.x or later) if it was not installed on your PC before

2. Install [.NET](https://dotnet.microsoft.com/en-us/download) version 6.0 or higher

3. Open Command Prompt (cmd) in administrator mode ("Run as adminstrator" menu item)

4. Run `setup_dev.bat` script - it will do the rest


### Linux or Mac

(coming soon)


## Launching a playground project

1. Open `playground/EasyDataAspNetCoreTest01` project folder (or any other in the `playground` folder) in a command prompt window.

2. Run `watch` command there to build the scripts and watch for the changes there to rebuld if necessary

3. Open another Command Prompt in the same folder

4. Run `dotnet run` command to start the demo project. 

That's it. You can open the demo web app by https://localhost:5001/

