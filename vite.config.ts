import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/auth': {
        target: 'https://proyecto-db-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'https://proyecto-db-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
