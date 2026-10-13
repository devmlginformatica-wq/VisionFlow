#!/usr/bin/env bash
# =============================================================================
# Vision Flow — Configura o projeto React + Vite PWA
# Uso: bash setup-config.sh
# =============================================================================

set -e

echo "════════════════════════════════════════════════════════════════"
echo "  Vision Flow — Configurando projeto"
echo "════════════════════════════════════════════════════════════════"

# -----------------------------------------------------------------------------
# 1. tailwind.config.js
# -----------------------------------------------------------------------------
echo "▶ Escrevendo tailwind.config.js"
cat > tailwind.config.js <<'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          foreground: 'var(--color-primary-foreground)',
          soft: 'var(--color-primary-soft)',
        },
      },
    },
  },
  plugins: [],
};
EOF

# -----------------------------------------------------------------------------
# 2. vite.config.ts
# -----------------------------------------------------------------------------
echo "▶ Escrevendo vite.config.ts"
cat > vite.config.ts <<'EOF'
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
});
EOF

# -----------------------------------------------------------------------------
# 3. tsconfig.app.json
# -----------------------------------------------------------------------------
echo "▶ Escrevendo tsconfig.app.json"
cat > tsconfig.app.json <<'EOF'
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
EOF

# -----------------------------------------------------------------------------
# 4. src/index.css
# -----------------------------------------------------------------------------
echo "▶ Escrevendo src/index.css"
cat > src/index.css <<'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* CSS variables do tema — valores padrão (turquesa Vision Flow) */
:root {
  --color-primary: #1AA7A4;
  --color-primary-hover: #178F8C;
  --color-primary-foreground: #FFFFFF;
  --color-primary-soft: rgba(26, 167, 164, 0.1);
}

html, body, #root {
  height: 100%;
  margin: 0;
}

body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOF

# -----------------------------------------------------------------------------
# 5. src/App.tsx
# -----------------------------------------------------------------------------
echo "▶ Escrevendo src/App.tsx"
cat > src/App.tsx <<'EOF'
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-soft">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Vision Flow</h1>
        <p className="mt-2 text-gray-600">
          Projeto configurado. Pronto para gerar features.
        </p>
      </div>
    </div>
  );
}
EOF

# -----------------------------------------------------------------------------
# 6. Limpar boilerplate do Vite
# -----------------------------------------------------------------------------
echo "▶ Removendo boilerplate do Vite"
rm -f src/App.css src/assets/react.svg public/vite.svg
rmdir src/assets 2>/dev/null || true

# -----------------------------------------------------------------------------
# 7. Ajustar index.html
# -----------------------------------------------------------------------------
echo "▶ Ajustando index.html"
if [ -f index.html ]; then
  sed -i 's|<title>.*</title>|<title>Vision Flow</title>|' index.html
fi

# -----------------------------------------------------------------------------
# 8. Fim
# -----------------------------------------------------------------------------
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  ✅ Configuração concluída!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "▶ Arquivos configurados:"
echo "  - tailwind.config.js"
echo "  - vite.config.ts"
echo "  - tsconfig.app.json"
echo "  - src/index.css"
echo "  - src/App.tsx"
echo "  - index.html (título)"
echo ""
echo "▶ Próximos passos:"
echo "  1) O servidor dev provavelmente vai recarregar sozinho"
echo "  2) Se não, rode: npm run dev"
echo "  3) Abra http://localhost:5173/"
echo "  4) Você deve ver uma tela com 'Vision Flow' em turquesa"
echo ""
