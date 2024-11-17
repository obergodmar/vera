/// <reference types="vitest" />
import react from '@vitejs/plugin-react';

import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
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
    react(),
    viteTsConfigPaths({
      root: '../../',
    }),
  ],
});
