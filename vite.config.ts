import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'Vision Flow',
        short_name: 'VisionFlow',
        description: 'Força de vendas integrada ao ERP Delphi',
        theme_color: '#1AA7A4',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/auth': { target: 'http://localhost:8080', changeOrigin: true },
      '/home': { target: 'http://localhost:8080', changeOrigin: true },
      '/clientes': { target: 'http://localhost:8080', changeOrigin: true },
      '/pedidos': { target: 'http://localhost:8080', changeOrigin: true },
      '/orcamentos': { target: 'http://localhost:8080', changeOrigin: true },
      '/agenda': { target: 'http://localhost:8080', changeOrigin: true },
      '/tarefas': { target: 'http://localhost:8080', changeOrigin: true },
      '/notificacoes': { target: 'http://localhost:8080', changeOrigin: true },
      '/shell': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
});
