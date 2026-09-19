import fs from 'node:fs';
import path from 'node:path';
import child_process from 'node:child_process';
import { env } from 'node:process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Requests the React app sends to the ASP.NET Core backend during development
const backendPaths = ['/api/easydata', '/weatherforecast'];

// The backend URL: SpaProxy starts `npm run dev` with the ASP.NET Core environment variables set
const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7177';

// Serve the dev server over HTTPS with the ASP.NET Core development certificate
function getDevCertificate() {
    const baseFolder = env.APPDATA !== undefined && env.APPDATA !== ''
        ? `${env.APPDATA}/ASP.NET/https`
        : `${env.HOME}/.aspnet/https`;

    const certificateName = 'easydatabasicdemo.react';
    const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
    const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

    if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
        fs.mkdirSync(baseFolder, { recursive: true });
        const result = child_process.spawnSync('dotnet', [
            'dev-certs', 'https',
            '--export-path', certFilePath,
            '--format', 'Pem',
            '--no-password',
        ], { stdio: 'inherit' });

        if (result.status !== 0) {
            throw new Error('Could not create the ASP.NET Core development certificate.');
        }
    }

    return { key: fs.readFileSync(keyFilePath), cert: fs.readFileSync(certFilePath) };
}

export default defineConfig(({ command }) => ({
    plugins: [react()],
    server: command === 'serve' ? {
        port: 44458,
        strictPort: true,
        https: getDevCertificate(),
        proxy: Object.fromEntries(backendPaths.map(p => [`^${p}`, { target, secure: false }])),
    } : undefined,
}));
