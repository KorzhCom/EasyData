'use strict';

// Provide a title to the process in `ps`.
// Due to an obscure Mac bug, do not start this title with any symbol.
process.title = 'setversion';

const fs = require('fs');
const path = require('path');

const versionJson = require(path.resolve(__dirname, "../version.json"));

const version = versionJson.version;

const packs = ["core", "ui", "crud"];

packs.map(pack => {
	writePackageJson(pack);
	return pack;
});

function writePackageJson(pack) {
	let file = path.resolve(__dirname, `../packs/${pack}/package.json`);
	let packageJson = require(file);

	packageJson.version = version;

	packs.map(pack => {
		if (packageJson.dependencies && packageJson.dependencies[`@easydata/${pack}`]) {
			packageJson.dependencies[`@easydata/${pack}`] = `^${version}`;
		}
		return pack;
	});
	
	fs.writeFile(file, JSON.stringify(packageJson, null, 4), err => {
		if (err) {
			console.log('Error: ' + err);
			process.exit(1);
		}
	});
}
