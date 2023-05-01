
cd .\EasyDataAspNetCoreTest01 

@echo ---- installing NPM packages for EasyDataAspNetCoreTest01 ----
call npm install 

@echo ---- setting symlinks to the @easydata source code ----
cd node_modules
mkdir @easydata
cd @easydata

mklink /D core ..\..\..\..\easydata.js\packs\core
mklink /D ui ..\..\..\..\easydata.js\packs\ui
mklink /D crud ..\..\..\..\easydata.js\packs\crud


cd ..\..\..


cd .\EasyDataAspNetCoreTest02 

@echo ---- installing NPM packages for EasyDataAspNetCoreTest02 ----
call npm install 

@echo ---- setting symlinks to the @easydata source code ----
cd node_modules
mkdir @easydata
cd @easydata

mklink /D core ..\..\..\..\easydata.js\packs\core
mklink /D ui ..\..\..\..\easydata.js\packs\ui
mklink /D crud ..\..\..\..\easydata.js\packs\crud
cd ..\..\..


@echo ----- ALL DONE! ---- 
