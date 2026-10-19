import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  // Carrega .env, .env.local, .env.[mode], etc.
  const env = loadEnv(mode, process.cwd(), '');

  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080';

  const proxyOptions = {
    target: apiTarget,
    changeOrigin: true,
    secure: false,
  };

  return {
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
      host: true,
      proxy: {
        '/health': proxyOptions,
        '/auth': proxyOptions,
        '/home': proxyOptions,
        '/clientes': proxyOptions,
        '/pedidos': proxyOptions,
        '/orcamentos': proxyOptions,
        '/agenda': proxyOptions,
        '/tarefas': proxyOptions,
        '/notificacoes': proxyOptions,
        '/shell': proxyOptions,
        '/cep': proxyOptions,
        '/empresas': proxyOptions,
        '/condicoes-pagamento': proxyOptions,
        '/formas-pagamento': proxyOptions,
        '/transportadoras': proxyOptions,
        '/tabelas-preco': proxyOptions,
        '/produtos': proxyOptions,
      },
    },
  };
});