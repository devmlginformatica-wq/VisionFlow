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
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'Vision Flow',
          short_name: 'VisionFlow',
          description: 'Força de vendas integrada ao ERP Delphi',
          theme_color: '#1AA7A4',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            { src: 'pwa-icon.svg', sizes: 'any', type: 'image/svg+xml' },
            { src: 'pwa-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
          runtimeCaching: [
            {
              urlPattern: ({ url }) =>
                /^\/(?:health|auth|home|clientes|pedidos|orcamentos|agenda|tarefas|notificacoes|shell|cep|empresas|condicoes-pagamento|formas-pagamento|transportadoras|tabelas-preco|produtos)(?:\/|$)/.test(
                  url.pathname,
                ),
              handler: 'NetworkOnly',
            },
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