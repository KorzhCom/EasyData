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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const
    dev = (process.env.NODE_ENV !== 'production'),
    sourcemap = dev

const banner = `
/*!
 * EasyData.JS UI
 * Copyright ${new Date().getFullYear()} Korzh.com
 * Licensed under MIT
 !*/
`

export default [
    {
        input: './src/public_api.ts',
        watch: {
            include: 'src/**/*.ts',
            clearScreen: false
        },
        plugins: [
            progress({
                clearLine: true,
            }),
            typescript(),
            nodeResolve({
                browser: true
            }),
            commonjs(),
            typedoc({
                json: '../../docs/easydata-ui.json',
                out: './docs',
                entryPoints: ['./src/**/*.ts'],
                tsconfig: './tsconfig.json'
            }),
        ],
        output: [
            {
                file: './dist/bundles/easydata.ui.es.js',
                format: 'es',
                sourcemap,
                banner,
                plugins: [
                    terser(),
                ]
            },
            {
                file: './dist/bundles/easydata.ui.cjs.js',
                format: 'cjs',
                sourcemap,
                banner,
                plugins: [
                    terser(),
                ]
            }
        ]
    },
    {
        input: './src/easy-forms.js',
        plugins: [
            progress({
                clearLine: true,
            }),
            postcss({
                extract: true,
                minimize: true,
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
        output: {
            dir: './dist/assets/css',
            banner,
        }
    },
    {
        input: './src/easy-dialog.js',
        plugins: [
            progress({
                clearLine: true,
            }),
            postcss({
                extract: true,
                minimize: true,
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
        output: {
            dir: './dist/assets/css',
            banner,
        }
    },
    {
        input: './src/easy-grid.js',
        plugins: [
            progress({
                clearLine: true,
            }),
            postcss({
                extract: true,
                minimize: true,
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
        output: {
            dir: './dist/assets/css',
            banner,
        }
    }
];