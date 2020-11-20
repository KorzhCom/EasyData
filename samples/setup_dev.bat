rem cd .\EasyDataBasicDemo.Net5 
rem call npm install 

rem cd ..\EasyDataBasicDemo.NetCore31 
rem npm install 

set easyDataJsCoreDir=..\easydata.js\packs\core 

mkdir EasyDataAspNetCoreDemo01\node_modules\@easydata

mklink /D .\EasyDataAspNetCoreDemo01\node_modules\@easydata\core ..\easydata.js\packs\core
