import {build} from 'esbuild';
import progress from "@olton/esbuild-plugin-progress";
import { dtsPlugin } from 'esbuild-plugin-d.ts';
import autoprefixer from '@olton/esbuild-plugin-autoprefixer';
import unlink from '@olton/esbuild-plugin-unlink';
import pkg from "./package.json" assert {type: "json"};

const production = process.env.MODE === "production"

const banner = `
/*!
 * EasyData.JS UI v${pkg.version}
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
    outfile: './dist/easydata.ui.esm.js',
    format: 'esm',
    plugins: [
        progress({
            text: 'Building EasyData UI [ESM]...',
            succeedText: `EasyData UI [ESM] built successfully in %s ms!`
        }),
        dtsPlugin(),
    ],
})

await build({
    ...buildOptions,
    outfile: './dist/easydata.ui.cjs.js',
    format: 'cjs',
    plugins: [
        progress({
            text: 'Building EasyData UI [CJS]...',
            succeedText: `EasyData UI [CJS] built successfully in %s ms!`
        }),
    ],
})

await build({
    entryPoints: ['./src/easy-grid.js'],
    outfile: './dist/assets/css/easy-grid.js',
    platform: 'browser',
    bundle: true,
    minify: false,
    sourcemap: false,
    plugins: [
        progress({
            text: 'Building EasyData UI:Grid [CSS]...',
            succeedText: `EasyData UI:Grid [CSS] built successfully in %s ms!`
        }),
        autoprefixer(),
        unlink({
            files: ['./dist/assets/css/easy-grid.js']
        }),
    ],
})

await build({
    entryPoints: ['./src/easy-forms.js'],
    outfile: './dist/assets/css/easy-forms.js',
    platform: 'browser',
    bundle: true,
    minify: false,
    sourcemap: false,
    plugins: [
        progress({
            text: 'Building EasyData UI:Forms [CSS]...',
            succeedText: `EasyData UI:Forms [CSS] built successfully in %s ms!`
        }),
        autoprefixer(),
        unlink({
            files: ['./dist/assets/css/easy-forms.js']
        }),
    ],
})

await build({
    entryPoints: ['./src/easy-dialog.js'],
    outfile: './dist/assets/css/easy-dialog.js',
    platform: 'browser',
    bundle: true,
    minify: false,
    sourcemap: false,
    plugins: [
        progress({
            text: 'Building EasyData UI:Dialog [CSS]...',
            succeedText: `EasyData UI:Dialog [CSS] built successfully in %s ms!`
        }),
        autoprefixer(),
        unlink({
            files: ['./dist/assets/css/easy-dialog.js']
        }),
    ],
})
