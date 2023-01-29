/// <reference types="vitest" />
import react from '@vitejs/plugin-react';

import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/frontend',

  server: {
    port: 4200,
    host: 'localhost',
    proxy: {
      '/api': 'http://localhost:3333',
    },
  },

  plugins: [
    react(),
    viteTsConfigPaths({
      root: '../../',
    }),
  ],
});
