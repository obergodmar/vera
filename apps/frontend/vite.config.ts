/// <reference types="vitest" />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { replaceFiles } from '@nx/vite/plugins/rollup-replace-files.plugin';
import react from '@vitejs/plugin-react';

import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../dist/apps/frontend',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  cacheDir: '../../node_modules/.vite/frontend',

  server: {
    port: 80, // Для работы авторизации
    host: '0.0.0.0',
    proxy: {
      // '/api': 'https://vera.example.com',
      '/api': 'http://localhost:4500',
    },
  },

  plugins: [
    replaceFiles([
      {
        replace: 'apps/frontend/src/environments/environment.ts',
        with: 'apps/frontend/src/environments/environment.prod.ts',
      },
    ]),
    react(),
    nxViteTsPaths(),
  ],
});
