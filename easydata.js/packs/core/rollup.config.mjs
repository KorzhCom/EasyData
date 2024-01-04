import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import progress from 'rollup-plugin-progress'
import typescript from '@rollup/plugin-typescript'
import typedoc from '@olton/rollup-plugin-typedoc'
import * as path from "path";
import { fileURLToPath } from 'url';
import pkg from './package.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const production = !(process.env.ROLLUP_WATCH),
    sourcemap = !production,
    cache = false

const banner = `
/*!
 * EasyData.JS Core v${pkg.version}
 * Copyright 2020-${new Date().getFullYear()} Korzh.com
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
                json: '../../docs/easydata-core.json',
                out: './docs',
                entryPoints: ['./src/**/*.ts'],
                tsconfig: './tsconfig.json',
            }),
        ],
        output: [
            {
                file: './dist/easydata.core.esm.js',
                format: 'es',
                sourcemap,
                banner,
            },
            {
                file: './dist/easydata.core.cjs.js',
                format: 'cjs',
                sourcemap,
                banner,
            },
        ]
    }
]