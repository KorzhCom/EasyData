const path = require("path");
const TerserPlugin = require('terser-webpack-plugin');
const TypedocWebpackPlugin = require('@olton/typedoc-webpack-plugin');

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
        minimizer: [new TerserPlugin({
            include: /\.min\.js$/,
			terserOptions: {
                sourceMap: true,
				compress: {
					pure_funcs: ['console.log', 'console.info', 'console.debug']
				}
			}
        })]
    },
	plugins: [
		new TypedocWebpackPlugin({
            json: '../../../../docs/easydatacore.json',
            out: "docs",
            entryPoints: ["./src/**/*.ts"],
            tsconfig: "tsconfig.json",
            compilerOptions: {}
        })
	]
};


module.exports = [confBundles];