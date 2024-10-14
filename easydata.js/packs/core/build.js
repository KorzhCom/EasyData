import {build} from 'esbuild';
import progress from "@olton/esbuild-plugin-progress";
import { dtsPlugin } from 'esbuild-plugin-d.ts';
import pkg from './package.json' assert {type: "json"};

const production = process.env.MODE === "production"

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

await build({
    ...buildOptions,
    outfile: './dist/easydata.core.esm.js',
    format: 'esm',
    plugins: [
        progress({
            text: `Building EasyData Core [ESM]...`,
            succeedText: `EasyData Core [ESM] built successfully in %s ms!`
        }),
        dtsPlugin(),
    ],
})

await build({
    ...buildOptions,
    outfile: './dist/easydata.core.cjs.js',
    format: 'cjs',
    plugins: [
        progress({
            text: `Building EasyData Core [CJS]...`,
            succeedText: `EasyData Core [CJS] built successfully in %s ms!`
        }),
    ],
})

