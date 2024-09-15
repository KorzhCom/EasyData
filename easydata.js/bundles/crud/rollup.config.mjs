import {nodeResolve} from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import progress from 'rollup-plugin-progress'
import * as path from "path";
import { fileURLToPath } from 'url';
import noEmit from 'rollup-plugin-no-emit'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from "autoprefixer"
import pkg from './package.json' with { type: 'json' };
import buble from '@rollup/plugin-buble'
import cleanup from 'rollup-plugin-cleanup'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const production = !(process.env.ROLLUP_WATCH),
    sourcemap = !production,
    cache = false

const banner = `
/*!
 * EasyData.JS CRUD Bundle v${pkg.version}
 * Copyright 2020-${new Date().getFullYear()} Korzh.com
 * Licensed under MIT
 */
`

const onwarn = warn => {
    if (/Generated an empty chunk/.test(warn) || warn.code === 'FILE_NAME_CONFLICT') return;
    console.error( warn )
}


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
            cleanup(),
            buble({
                transforms: {forOf: false}
            }),
            nodeResolve({ browser: true, }),
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
            file: './dist/easydata.css',
            banner,
        },
        onwarn,
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
            file: './dist/easydata.min.css',
            banner,
        },
        onwarn,
    },
]