const path = require("path");
const TerserPlugin = require('terser-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const TypedocWebpackPlugin = require('@olton/typedoc-webpack-plugin');

let confBundles = {
    entry: {
        "easydata.ui": "./src/public_api.ts",
        "easydata.ui.min": "./src/public_api.ts"
    },
    devtool: 'source-map',
    stats: {warnings:false},
    output: {
        library: "easydataUI",
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
            json: '../../../../docs/easydataui.json',
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

// const ExtractTextPlugin = require("extract-text-webpack-plugin");
// const easyFormsCss = new ExtractTextPlugin("./assets/css/[name].css");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

let confEasyForms = {
    entry: {
        "easy-forms": "./styles-easy-forms.js",
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: (resourcePath, context) => {
                                return path.relative(path.dirname(resourcePath), context) + "/";
                            },
                        },
                    },
                    "css-loader",
                ],
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "assets/css/[name].css",
        }),
        new FileManagerPlugin({
            events: {
                onEnd: {
                    delete: [
                        './dist/easy-forms.js',
                    ]
                }
            }
		}),
    ]
}

module.exports = [confBundles, confEasyForms];