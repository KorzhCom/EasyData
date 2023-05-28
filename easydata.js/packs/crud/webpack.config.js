const path = require("path");
const TerserPlugin = require('terser-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TypedocWebpackPlugin = require('@olton/typedoc-webpack-plugin');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

const confBundles = {
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
            json: '../../../../docs/easydata-crud.json',
            out: "docs",
            entryPoints: ["./src/**/*.ts"],
            tsconfig: "tsconfig.json",
            compilerOptions: {}
        }),
		new FileManagerPlugin({
            events: {
                onEnd: {
                    copy: [
                        { source: './assets/css/*', destination: './dist/assets/css' }
                    ]
                }
            }
        })
	]
};

const confBrowser = {
    entry: {
        "easydata": [
			"./styles-easydata.js",
			"./api-easydata.js"
		],
        "easydata.min": [
			"./styles-easydata.js",
			"./api-easydata.js"
		]
    },
    stats: {warnings:false},
	devtool: "source-map",
	resolve: {
		extensions: [".js", ".css"]
	},
    output: {
		library: "easydata",
        path: path.resolve(__dirname, 'dist/browser'),
        filename: "[name].js",
		libraryTarget: 'window'
    },
    module: {
        rules: [
			{
				test: /\.css$/,
				use: [
                    { loader: process.env.NODE_ENV !== 'production' 
                        ? 'style-loader' 
                        : MiniCssExtractPlugin.loader },
					{ loader: 'css-loader', options: { url: false } },
					{
						loader: 'postcss-loader',
						options: {
                            postcssOptions: {
                                plugins: [
                                	autoprefixer()
                                ],
                            },
							sourceMap: true
						}
					}
				]
			}
        ]
    },
    optimization: {
        minimizer: [new TerserPlugin({
            include: /\.min\.js$/,
			extractComments: true,
			terserOptions: {
                sourceMap: true,
				compress: {
					pure_funcs: ['console.log', 'console.info', 'console.debug']
				}
			}
        })]
    },
	plugins: [
        new MiniCssExtractPlugin({
			filename: "[name].css"
		}),
		new OptimizeCssAssetsPlugin({
		  assetNameRegExp: /\.min.css$/g
		}),
		new webpack.ProvidePlugin({
		  Promise: 'es6-promise'
		})
	]
}

module.exports = [confBundles, confBrowser];