---
mode: agent
description: Adiciona ao AppTopBar um seletor de tema (modo claro/escuro/sistema + paleta de cores)
---

# Adicionar Seletor de Tema ao AppTopBar — Vision Flow

**[PAPEL]** Arquiteto Sênior React + Designer de UI/UX.
**[CONTEXTO]** Vision Flow. Já existe o AppShell com AppTopBar. Já existe o
ThemeProvider (src/core/theme/ThemeProvider.tsx) como **Context puro** com
`setPrimaryColor(color: string)` e `setThemeMode(mode: 'light' | 'dark' | 'system')`.
Já existe `presetPrimaries` com 5 cores preset em `src/core/theme/colors.ts`.

**[TAREFA]** Adicionar ao AppTopBar um botão que abre um seletor de tema, com
duas seções: Modo (Claro / Escuro / Sistema) e Cor Principal (5 cores preset).

## Comportamento

- Um único botão com ícone no AppTopBar, à direita, **antes do botão de
  notificações** (desktop) ou **antes do avatar** (mobile/tablet).
- O ícone reflete o estado atual (lucide-react):
  * Modo claro  → `Sun`
  * Modo escuro → `Moon`
  * Modo system → `SunMoon`
- Ao clicar, abre um **Popover do Radix** (`@radix-ui/react-popover`) com
  conteúdo personalizado:

  **Seção "Modo":**
  - 3 botões segmentados: Claro | Escuro | Sistema
  - O item ativo destacado com a cor primária do tema
    - Ao clicar: `setThemeMode(modo)` via useTheme()`

  **Seção "Cor Principal":**
  - `flex flex-wrap gap-2` com um círculo para cada item de `presetPrimaries`
  - O círculo da cor atual tem:
    * borda grossa (2.5px) na cor primária atual
    * ícone `Check` branco centralizado
  - Os outros círculos têm borda fina discreta
  - Ao clicar: `setPrimaryColor(cor)` via `useTheme()`

- Fechar o popover automaticamente após a escolha (controlar via estado local
  do Popover, não via rota).

## Responsividade

- Mobile (`< 768px`): botão aparece antes do avatar. Popover abre alinhado
  à direita, com `max-w-[280px]`.
- Tablet (`768px – 1023px`): botão aparece antes do botão de notificações.
- Desktop (`>= 1024px`): botão aparece antes do botão de notificações, com
  tooltip "Tema" no hover.

## Restrições

- NÃO usar cor hardcoded — sempre tokens do tema via `useTheme()` ou CSS variables.
- NÃO usar `useState` para dado de domínio. O estado do tema vem do `ThemeProvider`.
- Ler o estado do tema via `useTheme()` no AppTopBar (para o ícone atualizar).
- Chamar `setPrimaryColor` / `setThemeMode` via `useTheme()`.
- Componentes com mais de 50 linhas extraídos para arquivo próprio:
  * `src/core/shell/ThemeSelectorButton.tsx` (o botão + lógica)
  * `src/core/shell/ThemeSelectorMenu.tsx` (o conteúdo do popover)
- Usar Tailwind para estilização. Sem CSS-in-JS.
- Sem `console.log`.
- Acessibilidade: `aria-label` no botão, navegação por teclado no popover
  (Radix resolve por padrão).

## Arquivos

- Criar: `src/core/shell/ThemeSelectorButton.tsx`
- Criar: `src/core/shell/ThemeSelectorMenu.tsx`
- Editar: `src/core/shell/AppTopBar.tsx` (inserir o `ThemeSelectorButton`
  entre o logo/empresa e os botões de notificações/sair)

## Formato de saída

Cada arquivo em bloco separado, precedido do caminho relativo.
Sem prosa final. Se ambíguo, perguntar antes.