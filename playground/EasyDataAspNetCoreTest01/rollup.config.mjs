import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from "autoprefixer"
import progress from 'rollup-plugin-progress'
import typescript from '@rollup/plugin-typescript'
// import typedoc from '@olton/rollup-plugin-typedoc'
import noEmit from 'rollup-plugin-no-emit'
import multi from '@rollup/plugin-multi-entry'
import * as path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const production = !(process.env.ROLLUP_WATCH),
    sourcemap = !production

const banner = `
/*!
 * EasyData.JS Demo
 * Copyright ${new Date().getFullYear()} Korzh.com
 * Licensed under MIT
 !*/
`

export default [
    {
        input: ['./ts/styles.js', './ts/easydata.ts'],
        watch: {
            clearScreen: false
        },
        plugins: [
            progress({ clearLine: true, }),
            multi(),
            typescript({sourceMap: sourcemap, declaration: false, }),
            nodeResolve({
            }),
            commonjs(),
            postcss({
                extract: false,
                minimize: true,
                use: ['less'],
                sourceMap: sourcemap,
                plugins: [
                    autoprefixer(),
                ]
            }),
        ],
        output: [
            {
                file: './wwwroot/js/easydata-all.js',
                format: 'iife',
                name: 'easydata',
                sourcemap,
                banner,
                plugins: [
                ]
            },
            {
                file: './wwwroot/js/easydata-all.min.js',
                format: 'iife',
                name: 'easydata',
                sourcemap,
                banner,
                plugins: [
                    terser()
                ]
            },
        ]
    },
];