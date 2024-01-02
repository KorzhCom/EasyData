import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import progress from 'rollup-plugin-progress'
import typescript from '@rollup/plugin-typescript'
import typedoc from '@olton/rollup-plugin-typedoc'
import * as path from "path";
import { fileURLToPath } from 'url';
import noEmit from 'rollup-plugin-no-emit'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from "autoprefixer"
import pkg from './package.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const
    dev = (process.env.NODE_ENV !== 'production'),
    sourcemap = dev

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
        watch: {
            include: 'src/**',
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
                json: '../../docs/easydata-crud.json',
                out: './docs',
                entryPoints: ['./src/**/*.ts'],
                tsconfig: './tsconfig.json'
            }),
        ],
        output: [
            {
                file: './dist/easydata.crud.es.js',
                format: 'es',
                sourcemap,
                banner,
                plugins: [
                    terser(),
                ]
            },
            {
                file: './dist/easydata.crud.cjs.js',
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
        input: './src/css-easydata.js',
        plugins: [
            progress({
                clearLine: true,
            }),
            nodeResolve(),
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
                    return 'css-easydata.js' === fileName
                }
            }),
        ],
        output: {
            file: './lib/easydata.min.css',
        },
        onwarn: message => {
            if (/Generated an empty chunk/.test(message)) return;
            console.error( message )
        }
    },
    {
        input: './src/css-easydata.js',
        plugins: [
            progress({
                clearLine: true,
            }),
            nodeResolve(),
            postcss({
                extract: true,
                minimize: false,
                use: ['less'],
                sourceMap: false,
                plugins: [
                    autoprefixer(),
                ]
            }),
            noEmit({
                match(fileName, output) {
                    return 'css-easydata.js' === fileName
                }
            }),
        ],
        output: {
            file: './lib/easydata.css',
        },
        onwarn: message => {
            if (/Generated an empty chunk/.test(message)) return;
            console.error( message )
        }
    },
    {
        input: './src/api-easydata.js',
        plugins: [
            progress({
                clearLine: true,
            }),
            nodeResolve({
                browser: true
            }),
            commonjs(),
        ],
        output: [
            {
                file: './lib/easydata.min.js',
                format: 'iife',
                name: 'easydata',
                sourcemap,
                banner,
                plugins: [
                    terser(),
                ]
            }
        ]
    },
    {
        input: './src/api-easydata.js',
        plugins: [
            progress({
                clearLine: true,
            }),
            nodeResolve({
                browser: true
            }),
            commonjs(),
        ],
        output: [
            {
                file: './lib/easydata.js',
                format: 'iife',
                name: 'easydata',
                sourcemap: false,
                banner,
                plugins: [
                ]
            }
        ]
    },
]