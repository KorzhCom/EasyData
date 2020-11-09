const path = require("path");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');

let confBundles = {
    entry: {
        "easydata.core": "./src/public_api.ts",
        "easydata.core.min": "./src/public_api.ts"
    },
    devtool: 'source-map',
    stats: {warnings:false},
    output: {
        library: "easydataCore",
        path: path.resolve(__dirname, 'dist/bundles'),
        filename: "[name].js",
        umdNamedDefine: true,
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: [".js", ".ts"]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader"
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
            json: '../../../../docs/easydatacore.json',
            includeDeclarations: false,
			ignoreCompilerErrors: true
        })
	]
};


module.exports = [confBundles];