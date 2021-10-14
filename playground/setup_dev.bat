cd .\EasyDataAspNetCoreTest01 
call npm install 

cd node_modules
mkdir @easydata
cd @easydata

mklink /D core ..\..\..\..\easydata.js\packs\core
mklink /D ui ..\..\..\..\easydata.js\packs\ui
mklink /D crud ..\..\..\..\easydata.js\packs\crud


cd ..\..\..


cd .\EasyDataAspNetCoreTest02 
call npm install 
cd node_modules
mkdir @easydata
cd @easydata

mklink /D core ..\..\..\..\easydata.js\packs\core
mklink /D ui ..\..\..\..\easydata.js\packs\ui
mklink /D crud ..\..\..\..\easydata.js\packs\crud
cd ..\..\..


cd ..
