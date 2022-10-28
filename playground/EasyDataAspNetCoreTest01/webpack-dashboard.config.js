const path = require("path");
const webpack = require('webpack');

module.exports = {
    entry: ["./ts/styles.js", "./ts/dashboard.ts"],
    stats: { warnings: false },
    devtool: "source-map",
    output: {
        library: 'dashboard',
        path: path.resolve(__dirname, 'wwwroot/js'),
        filename: "dashboard.js"
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