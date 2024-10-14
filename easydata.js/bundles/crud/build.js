import {build} from 'esbuild';
import progress from "@olton/esbuild-plugin-progress";
import pkg from "./package.json" assert {type: "json"};

const production = process.env.MODE === "production"

const banner = `
/*!
 * EasyData.JS Crud Bundle v${pkg.version}
 * Copyright 2020-${new Date().getFullYear()} Korzh.com
 * Licensed under MIT
 */
`

await build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    minify: false,
    sourcemap: false,
    outfile: './dist/easydata.js',
    format: 'iife',
    plugins: [
        progress({
            text: 'Building EasyData Crud [IIFE]...',
            succeedText: `EasyData Crud [IIFE] built successfully in %s ms!`
        }),
    ],
    banner: {
        js: banner
    },
})

await build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    minify: true,
    sourcemap: false,
    outfile: './dist/easydata.min.js',
    format: 'iife',
    plugins: [
        progress({
            text: 'Building EasyData Crud [IIFE]...',
            succeedText: `EasyData Crud [IIFE] built successfully in %s ms!`
        }),
    ],
    banner: {
        js: banner
    },
})

