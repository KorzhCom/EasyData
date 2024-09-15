import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from "autoprefixer"
import progress from 'rollup-plugin-progress'
import typescript from '@rollup/plugin-typescript'
import typedoc from '@olton/rollup-plugin-typedoc'
import noEmit from 'rollup-plugin-no-emit'
import * as path from "path";
import { fileURLToPath } from 'url';
import pkg from './package.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const production = !(process.env.ROLLUP_WATCH),
    sourcemap = !production,
    cache = false

const banner = `
/*
 * EasyData.JS UI v${pkg.version}
 * Copyright 2020-${new Date().getFullYear()} Korzh.com
 * Licensed under MIT
 */
`

const onwarn = warn => {
    if (/Generated an empty chunk/.test(warn)) return;
    console.error( warn )
}

const cssOutput = {
    dir: './dist/assets/css',
} 

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
                json: '../../docs/easydata-ui.json',
                out: './docs',
                entryPoints: ['./src/**/*.ts'],
                tsconfig: './tsconfig.json'
            }),
        ],
        external: ["@easydata/core"],
        output: [
            {
                file: './dist/easydata.ui.cjs.js',
                format: 'cjs',
                sourcemap,
                banner,
                globals: {
                    "@easydata/core": "easydataCore"
                }
            },
            {
                file: './dist/easydata.ui.esm.js',
                format: 'esm',
                sourcemap,
                banner,
                globals: {
                    "@easydata/core": "easydataCore"
                }
            },
        ]
    },
    {
        input: './src/easy-forms.js',
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
                    return 'easy-forms.js' === fileName
                }
            }),
        ],
        output: cssOutput,
        onwarn,
    },
    {
        input: './src/easy-dialog.js',
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
                    return 'easy-dialog.js' === fileName
                }
            }),
        ],
        output: cssOutput,
        onwarn,
    },
    {
        input: './src/easy-grid.js',
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
                    return 'easy-grid.js' === fileName
                }
            }),
        ],
        output: cssOutput,
        onwarn,
    }
];