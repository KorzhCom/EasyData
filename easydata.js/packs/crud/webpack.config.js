const path = require("path");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');

let confBundles = {
    entry: {
        "easydata.crud": "./src/public_api.ts",
        "easydata.crud.min": "./src/public_api.ts"
    },
    devtool: 'source-map',
    stats: {warnings:false},
    output: {
        library: 'easydataCRUD',
        path: path.resolve(__dirname, 'dist/bundles'),
        filename: '[name].js',
        umdNamedDefine: true,
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            }
        ]
    },
    optimization: {
        minimizer: [new UglifyJsPlugin({
            include: /\.min\.js$/,
            sourceMap: true
        })]
    },
	plugins: [
		new TypedocWebpackPlugin({
            mode: 'file',
            json: '../../../../docs/easydata-crud.json',
            includeDeclarations: false,
			ignoreCompilerErrors: true
        }),
		new FileManagerPlugin({
			onEnd: {
				copy: [
				  { source: './assets/**/*', destination: './dist/assets' }
                ]
			}
        })
	]
};

module.exports = [confBundles];