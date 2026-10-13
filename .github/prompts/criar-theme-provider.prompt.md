---
mode: agent
description: Cria o ThemeProvider global (modo claro/escuro/sistema + cor primária em runtime)
---

# Criar ThemeProvider — Vision Flow

**[PAPEL]** Arquiteto Sênior React + Designer de UI/UX.
**[CONTEXTO]** Vision Flow. O ThemeProvider é a fonte única de verdade do tema:
controla o mode (light/dark/system) e a cor primária em runtime. Todas as telas
consomem via hook `useTheme()`. O tema é aplicado via CSS variables + classe
`dark` no `<html>`, seguindo o padrão do Tailwind. É **Context puro**, não
Zustand — tema é configuração de UI, não dado de domínio.

**[TAREFA]** Criar o ThemeProvider com persistência, sincronização com
`prefers-color-scheme` e aplicação de CSS variables.

## Requisitos

- Modo: `'light' | 'dark' | 'system'`. Padrão inicial: `'system'`.
- Cor primária: string hex (ex: `'#1AA7A4'`). Padrão: turquesa do Vision Flow.
- Preset de cores: 5 cores em `presetPrimaries` (array de `{ name, value }`).
- Ao trocar o mode, aplica/remove a classe `dark` no `<html>`.
- Ao trocar a cor primária, atualiza CSS variables:
  - `--color-primary`
  - `--color-primary-hover` (versão escurecida ~10%)
  - `--color-primary-foreground` (branco ou preto, escolhido por contraste)
  - `--color-primary-soft` (versão clara, ~10% de opacidade, para fundos)
- Em mode `'system'`, escuta mudanças de `prefers-color-scheme` em runtime
  (via `matchMedia` com cleanup no unmount).
- Persiste `mode` e `primaryColor` em `localStorage` com chave `'visionflow:theme'`.
- Hidrata o estado a partir do localStorage no primeiro render (sem flash).
- Antes do React montar, um script inline no `index.html` aplica a classe `dark`
  e as CSS variables iniciais para evitar FOUC (flash of unstyled content).

## API do hook useTheme()

```ts
type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;                 // modo escolhido pelo usuário
  resolvedMode: 'light' | 'dark';  // modo efetivo (system resolvido)
  primaryColor: string;            // hex atual
  setThemeMode: (mode: ThemeMode) => void;
  setPrimaryColor: (color: string) => void;
  presetPrimaries: ReadonlyArray<{ name: string; value: string }>;
}