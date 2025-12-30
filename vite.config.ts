import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
})
