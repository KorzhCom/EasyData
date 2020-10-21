'use strict';

// Provide a title to the process in `ps`.
// Due to an obscure Mac bug, do not start this title with any symbol.
process.title = 'setlinks';

const fs = require('fs');
const path = require('path');

let unlink = process.argv.length > 2 ? process.argv[2] == "unlink" : false;


let corePath = path.resolve(__dirname, "../../../EasyQuery/EasyQuery.JS/packs/core");
let uiPath = path.resolve(__dirname, "../../../EasyQuery/EasyQuery.JS/packs/ui");
let enterprisePath = path.resolve(__dirname, "../../../EasyQuery/EasyQuery.JS/packs/enterprise");


let easydataUIPath = path.resolve(__dirname, "../../../EasyQuery/EasyQuery.JS/packs/easydata.ui");
let easydataCorePath = path.resolve(__dirname, "../../../EasyQuery/EasyQuery.JS/packs/easydata.core");


// -------------- demo projects --------------

link(corePath, path.resolve(__dirname, "../EasyDataBasicDemo/node_modules/@easyquery/core"));
link(uiPath, path.resolve(__dirname, "../EasyDataBasicDemo/node_modules/@easyquery/ui"));
link(enterprisePath, path.resolve(__dirname, "../EasyDataBasicDemo/node_modules/@easyquery/enterprise"));
link(easydataCorePath, path.resolve(__dirname, "../EasyDataBasicDemo/node_modules/@easydata/core"));
link(easydataUIPath, path.resolve(__dirname, "../EasyDataBasicDemo/node_modules/@easydata/ui"));


function link(to, from) {
	to = trim(to.toLowerCase());
	from = trim(from.toLowerCase());

	if (to === from) throw new Error(`Symlink path is the same as the target path (${to})`);

	if (unlink) {
		try {
			fs.unlinkSync(from);
		} catch (err) {} 
	}
	else {
		let eqDir = RemoveLastDirectoryPartOf(from);
		let nmDir = RemoveLastDirectoryPartOf(eqDir);

		if (!fs.existsSync(nmDir)) {
			fs.mkdirSync(nmDir, {recursive: true});
		}
		if (!fs.existsSync(eqDir)) {
			fs.mkdirSync(eqDir, {recursive: true});
		}

		try {
			fs.symlinkSync(to, from, 'junction');
		} catch (err) {
			if (err.code !== 'EEXIST') throw err;
		} 
	  
		let linkString;
		try {
			linkString = fs.readlinkSync(from);
		} catch (err) {
		// from is not a link
			throw new Error(`Source path (${from}) is busy by the folder`);
		}

		linkString = trim(linkString.toLowerCase());
		if (to !== linkString) {
			fs.unlinkSync(from);
			return link(to, from);  
		}
	}
}

function trim(path)     
{     
	let res = path.replace(/\\$/, "");
	return res;
} 

function RemoveLastDirectoryPartOf(dir)
{
    var the_arr = dir.split(path.sep);
    the_arr.pop();
    return( the_arr.join(path.sep) );
}