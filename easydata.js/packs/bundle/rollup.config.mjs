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
 * EasyData.JS Bundle v${pkg.version}
 * Copyright ${new Date().getFullYear()} Korzh.com
 * Licensed under MIT
 */
`

export default [
    {
        input: './src/index.ts',
        cache,
        watch: {
            include: 'src/**',
            clearScreen: false
        },
        plugins: [
            progress({ clearLine: true, }),
            typescript({ sourceMap: sourcemap, declaration: false, }),
            nodeResolve({ browser: true, }),
            commonjs(),
            postcss({
                extract: false,
                minimize: false,
                use: ['less'],
                sourceMap: sourcemap,
                plugins: [
                    autoprefixer(),
                ]
            }),
        ],
        context: "window",
        output: [
            {
                file: './dist/easydata.js',
                format: 'umd',
                sourcemap,
                banner,
                name: "easydata",
                extend: true,
                plugins: [
                ],
            },
            {
                file: './dist/easydata.min.js',
                format: 'umd',
                sourcemap,
                banner,
                name: "easydata",
                extend: true,
                plugins: [
                    terser({
                        keep_classnames: true,
                        keep_fnames: true,
                    }),
                ],
            },
        ]
    },
]