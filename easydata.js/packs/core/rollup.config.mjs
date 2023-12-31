import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import progress from 'rollup-plugin-progress'
import typescript from '@rollup/plugin-typescript'
import typedoc from '@olton/rollup-plugin-typedoc'
import * as path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const
    dev = (process.env.NODE_ENV !== 'production'),
    sourcemap = dev

const banner = `
/*!
 * EasyData.JS Core
 * Copyright ${new Date().getFullYear()} Korzh.com
 * Licensed under MIT
 !*/
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
                json: '../../docs/easydata-core.json',
                out: './docs',
                entryPoints: ['./src/**/*.ts'],
                tsconfig: './tsconfig.json',
            }),
        ],
        output: [
            {
                file: './dist/easydata.core.es.js',
                format: 'es',
                sourcemap,
                banner,
                plugins: [
                    terser(),
                ]
            },
            {
                file: './dist/easydata.core.cjs.js',
                format: 'cjs',
                sourcemap,
                banner,
                plugins: [
                    terser(),
                ]
            }
        ]
    }
]