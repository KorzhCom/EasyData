import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from "autoprefixer"
import progress from 'rollup-plugin-progress'
import typescript from '@rollup/plugin-typescript'
// import typedoc from '@olton/rollup-plugin-typedoc'
import noEmit from 'rollup-plugin-no-emit'
import * as path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const production = !(process.env.ROLLUP_WATCH),
      sourcemap = !production

const banner = `
/*!
 * EasyData.JS Demo 2
 * Copyright ${new Date().getFullYear()} Korzh.com
 * Licensed under MIT
 !*/
`

export default [
    {
        input: './ts/easydata.ts',
        watch: {
            include: './ts/**/*.ts',
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
        ],
        output: [
            {
                file: './wwwroot/js/easydata.js',
                format: 'iife',
                sourcemap,
                banner,
                plugins: [
                    terser(),
                ]
            },
        ]
    },
    {
        input: './ts/styles.js',
        plugins: [
            progress({
                clearLine: true,
            }),
            nodeResolve(),
            postcss({
                extract: 'easydata.css',
                minimize: true,
                use: ['less'],
                sourceMap: sourcemap,
                plugins: [
                    autoprefixer(),
                ]
            }),
            noEmit({
                match(fileName, output) {
                    return 'styles.js' === fileName
                }
            }),
        ],
        output: {
            dir: './wwwroot/css',
            banner,
        }
    },
];