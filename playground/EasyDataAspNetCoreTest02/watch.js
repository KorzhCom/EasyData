import { context } from 'esbuild';
import progress from "@olton/esbuild-plugin-progress";
import unlink from "@olton/esbuild-plugin-unlink";
import autoprefixer from "@olton/esbuild-plugin-autoprefixer";

const production = process.env.MODE === "production"

let ctxLib = await context({
    entryPoints: ['./ts/easydata.ts'],
    outfile: './wwwroot/js/easydata.js',
    bundle: true,
    minify: production,
    sourcemap: !production,
    plugins: [
        progress({
            text: 'Building EasyData for Test01...',
            succeedText: `EasyData for Test01 built successfully in %s ms! Watching for changes...`
        }),
    ],
})

let ctxCss = await context({
    entryPoints: ['./ts/styles.js'],
    outfile: './wwwroot/css/easydata.js',
    bundle: true,
    minify: production,
    sourcemap: false,
    plugins: [
        progress({
            text: 'Building EasyData CSS for Test01...',
            succeedText: `EasyData CSS for Test01 built successfully in %s ms! Watching for changes...`
        }),
        autoprefixer(),
        unlink({
            files: ['./wwwroot/css/easydata.js']
        })
    ],
})

await Promise.all([
    ctxLib.watch(),
    ctxCss.watch()
])

