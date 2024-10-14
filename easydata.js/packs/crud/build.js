import {build} from 'esbuild';
import progress from "@olton/esbuild-plugin-progress";
import { dtsPlugin } from 'esbuild-plugin-d.ts';
import autoprefixer from '@olton/esbuild-plugin-autoprefixer';
import unlink from '@olton/esbuild-plugin-unlink';
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

await build({
    ...buildOptions,
    outfile: './dist/easydata.crud.esm.js',
    format: 'esm',
    plugins: [
        progress({
            text: 'Building EasyData Crud [ESM]...',
            succeedText: `EasyData Crud [ESM] built successfully in %s ms!`
        }),
        dtsPlugin(),
    ],
})

await build({
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

await build({
    entryPoints: ['./src/css.ts'],
    outfile: './dist/assets/css/ed-view.js',
    platform: 'browser',
    bundle: true,
    minify: false,
    sourcemap: false,
    plugins: [
        progress({
            text: 'Building EasyData Crud [CSS]...',
            succeedText: `EasyData Crud [CSS] built successfully in %s ms!`
        }),
        autoprefixer(),
        unlink({
            files: ['./dist/assets/css/ed-view.js']
        }),
    ],
})
