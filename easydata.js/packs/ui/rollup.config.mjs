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
                json: '../../../../docs/easydataui.json',
                out: './docs2',
                entryPoints: ['./src/**/*.ts'],
                tsconfig: './tsconfig.json'
            }),
        ],
        output: [
            {
                file: './dist2/bundles/easydata.ui.es.js',
                format: 'es',
                sourcemap,
                banner,
                plugins: [
                    terser(),
                ]
            },
            {
                file: './dist2/bundles/easydata.ui.cjs.js',
                format: 'cjs',
                name: 'easydataUI',
                sourcemap,
                banner,
                plugins: [
                    terser(),
                ]
            },
            {
                file: './dist2/bundles/easydata.ui.js',
                format: 'iife',
                name: 'easydataUI',
                sourcemap,
                banner,
                plugins: [
                    terser(),
                ]
            }
        ]
    },
    {
        input: ['./assets.js'],
        plugins: [
            progress({
                clearLine: true,
            }),
            postcss({
                extract: 'easy-ui.css',
                minimize: true,
                use: ['less'],
                sourceMap: sourcemap,
                plugins: [
                    autoprefixer(),
                ]
            }),
            noEmit({
                match(fileName, output) {
                    return fileName === 'assets.js'
                }
            }),
        ],
        output: {
            dir: './dist2/assets/css',
            banner,
        }
    }
];