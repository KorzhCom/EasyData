import { context } from 'esbuild';
import progress from "@olton/esbuild-plugin-progress";
import pkg from './package.json' assert {type: "json"};

const banner = `
/*!
 * EasyData.JS Core v${pkg.version}
 * Copyright 2020-${new Date().getFullYear()} Korzh.com
 * Licensed under MIT
 */
`

const buildOptions = {
    entryPoints: ['./src/public_api.ts'],
    outfile: './dist/easydata.core.esm.js',
    platform: 'node',
    target: 'esnext',
    bundle: true,
    minify: false,
    sourcemap: false,
    banner: {
        js: banner
    },
}

let ctxEsm = await context({
    ...buildOptions,
    outfile: './dist/easydata.core.esm.js',
    format: 'esm',
    plugins: [
        progress({
            text: 'Building EasyData Core [ESM]...',
            succeedText: `EasyData Core [ESM] built successfully in %s ms!`
        }),
    ],
})

let ctxCjs = await context({
    ...buildOptions,
    outfile: './dist/easydata.core.djs.js',
    format: 'cjs',
    plugins: [
        progress({
            text: 'Building EasyData Core [CJS]...',
            succeedText: `EasyData Core [CJS] built successfully in %s ms!`
        }),
    ],
})

await Promise.all([
    ctxEsm.watch(),
    ctxCjs.watch()
])

