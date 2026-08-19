import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';

let httpsConfig = false;

// Only setup HTTPS dev certs in local development when dotnet CLI is available
if (env.NODE_ENV !== 'production' && !env.VERCEL && !env.NETLIFY && !env.CI) {
    const baseFolder =
        env.APPDATA !== undefined && env.APPDATA !== ''
            ? `${env.APPDATA}/ASP.NET/https`
            : `${env.HOME}/.aspnet/https`;

    const certificateName = "reactapp1.client";
    const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
    const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

    try {
        if (!fs.existsSync(baseFolder)) {
            fs.mkdirSync(baseFolder, { recursive: true });
        }

        if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
            const res = child_process.spawnSync('dotnet', [
                'dev-certs',
                'https',
                '--export-path',
                certFilePath,
                '--format',
                'Pem',
                '--no-password',
            ], { stdio: 'inherit' });
            if (res.status === 0 && fs.existsSync(certFilePath) && fs.existsSync(keyFilePath)) {
                httpsConfig = {
                    key: fs.readFileSync(keyFilePath),
                    cert: fs.readFileSync(certFilePath),
                };
            }
        } else {
            httpsConfig = {
                key: fs.readFileSync(keyFilePath),
                cert: fs.readFileSync(certFilePath),
            };
        }
    } catch {
        // Fall back to HTTP if dotnet dev-certs or cert files are unavailable
        httpsConfig = false;
    }
}

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7214';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
            '^/weatherforecast': {
                target,
                secure: false
            },
            '^/node-api': {
                target: 'http://localhost:5000/api',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/node-api/, '')
            }
        },
        port: parseInt(env.DEV_SERVER_PORT || '63349'),
        https: httpsConfig
    }
})
