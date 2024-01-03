call npm cache clean --force 
call nx reset
call npx lerna clean
rmdir /S /Q node_modules
del package-lock.json
call npm update