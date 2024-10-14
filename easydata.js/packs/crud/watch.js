import {context} from 'esbuild';
import progress from "@olton/esbuild-plugin-progress";
import pkg from "./package.json" assert {type: "json"};

const production = process.env.MODE === "production"

const banner = `
/*!
 * EasyData.JS Crud v${pkg.version}
 * Copyright 2020-${new Date().getFullYear()} Korzh.com
 * Licensed under MIT
 */
`

const buildOptions = {
    entryPoints: ['./src/public_api.ts'],
    platform: 'node',
    target: 'esnext',
    bundle: true,
    minify: false,
    sourcemap: false,
    banner: {
        js: banner
    },
    external: [
        ...Object.keys(pkg.peerDependencies || {}),
    ],
}

let ctxEsm = await context({
    ...buildOptions,
    outfile: './dist/easydata.crud.esm.js',
    format: 'esm',
    plugins: [
        progress({
            text: 'Building EasyData Crud [ESM]...',
            succeedText: `EasyData Crud [ESM] built successfully in %s ms!`
        }),
    ],
})

let ctxCjs = await context({
    ...buildOptions,
    outfile: './dist/easydata.crud.cjs.js',
    format: 'cjs',
    plugins: [
        progress({
            text: 'Building EasyData Crud [CJS]...',
            succeedText: `EasyData Crud [CJS] built successfully in %s ms!`
        }),
    ],
})

await Promise.all([
    ctxEsm.watch(),
    ctxCjs.watch()
])