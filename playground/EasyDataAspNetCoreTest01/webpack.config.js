const path = require("path");
const webpack = require('webpack');

module.exports = {
    entry: ["./ts/styles-crud.js", "./ts/easydata.ts"],
    stats: { warnings: false },
    devtool: "source-map",
    output: {
        library: 'easydata',
        path: path.resolve(__dirname, 'wwwroot/js'),
        filename: "easydata.js"
    },
    resolve: {
        extensions: [".js", ".ts"]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader"
            },
            {
                test: /\.css$/,
                loader: 'style-loader'
            },
            {
                test: /\.css$/,
                loader: 'css-loader',
                options: {
                    url: false
                }
            }
        ]
    },
    watchOptions: {
        aggregateTimeout: 2000
    },
    plugins: [
		new webpack.ProvidePlugin({
		  Promise: ['es6-promise', 'Promise']
		})
	]
};