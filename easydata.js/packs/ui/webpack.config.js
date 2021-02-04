const path = require("path");
const TerserPlugin = require('terser-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');

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
            sourceMap: true,
			terserOptions: {
				compress: {
					pure_funcs: ['console.log', 'console.info', 'console.debug']
				}
			}
        })]
    },
	plugins: [
		new TypedocWebpackPlugin({
            mode: 'file',
            json: '../../../../docs/easydataui.json',
            includeDeclarations: false,
			ignoreCompilerErrors: true
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

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const easyFormsCss = new ExtractTextPlugin("./assets/css/[name].css");

let confEasyForms = {
    entry: {
        "easy-forms": "./styles-easy-forms.js",
    },
    module: {
        rules: [
            {
                test: /.*\.css$/,
                use: easyFormsCss.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            }
        ]
    },
    plugins: [
        easyFormsCss,
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