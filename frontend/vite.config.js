import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O proxy envia /api/* para o backend (Fastify, porta 3333).
// Assim o navegador fala sempre com a mesma origem (localhost:5173) e
// não depende da configuração de CORS do backend (que por padrão só libera GET/POST).
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:3333';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: BACKEND_URL, changeOrigin: true },
    },
  },
  preview: {
    port: 5173,
    proxy: {
      '/api': { target: BACKEND_URL, changeOrigin: true },
    },
  },
});
