import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import progress from 'rollup-plugin-progress'
import typescript from '@rollup/plugin-typescript'
import typedoc from '@olton/rollup-plugin-typedoc'
import multi from '@rollup/plugin-multi-entry'
import * as path from "path";
import { fileURLToPath } from 'url';
import noEmit from 'rollup-plugin-no-emit'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from "autoprefixer"
import pkg from './package.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const production = !(process.env.ROLLUP_WATCH),
    sourcemap = !production,
    cache = false

const banner = `
/*!
 * EasyData.JS CRUD v${pkg.version}
 * Copyright ${new Date().getFullYear()} Korzh.com
 * Licensed under MIT
 */
`

export default [
    {
        input: './src/public_api.ts',
        cache,
        watch: {
            include: 'src/**',
            clearScreen: false
        },
        plugins: [
            progress({ clearLine: true, }),
            typescript({ sourceMap: sourcemap, }),
            nodeResolve({ browser: true, }),
            commonjs(),
            typedoc({
                json: '../../docs/easydata-crud.json',
                out: './docs',
                entryPoints: ['./src/**/*.ts'],
                tsconfig: './tsconfig.json'
            }),
        ],
        external: [
            "@easydata/core", "@easydata/ui"
        ],
        context: "window",
        output: [
            {
                file: './dist/easydata.crud.js',
                format: 'umd',
                sourcemap,
                banner,
                name: "easydataCRUD",
                plugins: [
                ],
                globals: {
                    "@easydata/core": "easydata.core",
                    "@easydata/ui": "easydata.ui",
                }
            },
            {
                file: './dist/easydata.crud.min.js',
                format: 'umd',
                sourcemap,
                banner,
                name: "easydataCRUD",
                plugins: [
                    terser({
                        keep_classnames: true,
                        keep_fnames: true,
                    }),
                ],
                globals: {
                    "@easydata/core": "easydata.core",
                    "@easydata/ui": "easydata.ui",
                }
            },
        ]
    },
    {
        input: './src/ed-view.js',
        cache,
        plugins: [
            progress({ clearLine: true, }),
            postcss({
                extract: true,
                minimize: false,
                use: ['less'],
                sourceMap: sourcemap,
                plugins: [
                    autoprefixer(),
                ]
            }),
            noEmit({
                match(fileName, output) {
                    return 'ed-view.js' === fileName
                }
            }),
        ],
        output: {
            dir: './dist/assets/css',
        },
        onwarn: message => {
            if (/Generated an empty chunk/.test(message)) return;
            console.error( message )
        }
    },
]