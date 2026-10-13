---
mode: agent
description: Cria o AppShell persistente (top bar + navegação adaptativa) do Vision Flow
---

# Criar AppShell — Vision Flow

**[PAPEL]** Arquiteto Sênior React + UX.
**[CONTEXTO]** Vision Flow. O AppShell é o equivalente ao MainForm do Delphi:
um layout persistente que envolve TODAS as telas autenticadas. Ele é adaptativo
em 3 breakpoints (mobile / tablet / desktop), conforme definido em
copilot-instructions.md.
**[TAREFA]** Criar o AppShell com top bar persistente e navegação adaptativa.

## Requisitos

### AppTopBar (sempre visível em todos os breakpoints)
- Mobile (`< 768px`): enxuta — hambúrguer (abre drawer) + logo + avatar (menu do usuário).
- Tablet (`768px – 1023px`): compacta — logo + nome da empresa + botão de notificações + avatar.
- Desktop (`>= 1024px`): completa — logo + nome da empresa + CNPJ + regional + contato +
  botão de notificações com badge + botão sair.
- O botão de notificações mostra badge com contagem de não lidas.
- Ações do usuário (sair) ficam no avatar/dropdown no mobile, botão explícito no desktop.

### Navegação adaptativa
- Mobile: **Drawer** acionado pelo hambúrguer no top bar. Fecha ao navegar.
- Tablet: **Rail lateral fixo** (`w-16`), só ícones, tooltip no hover.
- Desktop: **Sidebar colapsável** — `w-16` por padrão, expande para `w-64` no hover
  ou ao clicar no botão de toggle. Largura expandida persiste durante a sessão.
- Itens: Home, Orçamento, Pedidos, Clientes, Agenda, Tarefas, Geolocalização,
  Dashboard, Notificações, Sair.
- Item da rota atual destacado com cor primária do tema.

### Conteúdo
- O conteúdo (`<Outlet />`) ocupa o resto da tela.
- Padding responsivo: `p-4` (mobile), `p-6` (tablet), `p-8` (desktop).
- Scroll apenas na área de conteúdo — top bar e navegação fixos.

### Layout route
- Usar React Router v6 com `createBrowserRouter` e layout route persistente.
- O AppShell é o elemento do layout route, com `<Outlet />` no lugar do conteúdo.
- A moldura NÃO é reconstruída ao navegar entre rotas filhas.

### Dados do Shell
- Nome da empresa, CNPJ, regional, contato e usuário logado vêm de
  `src/mocks/shell/empresa.json`.
- Contagem de notificações não lidas vem de `src/mocks/shell/notificacoes.json`.
- Lidos via `useShellViewModel`.

## Rotas

Aplicar o AppShell apenas nas rotas autenticadas:
`/` (Home), `/pedidos`, `/orcamentos`, `/clientes`, `/agenda`, `/tarefas`,
`/notificacoes`, `/dashboard`.
`/login` fica FORA do shell.

## Restrições

- Estrutura em `src/core/shell/`:
  - `AppShell.tsx` (layout route + `<Outlet />`)
  - `AppTopBar.tsx`
  - `AppSideMenu.tsx` (renderiza rail ou sidebar conforme breakpoint)
  - `AppDrawer.tsx` (drawer mobile via Radix Dialog)
  - `AppMenuItem.tsx` (item individual, adapta label/ícone)
  - `useShellViewModel.ts`
  - `useBreakpoint.ts` (hook: retorna 'mobile' | 'tablet' | 'desktop')
- `useShellViewModel` expõe: `empresa`, `usuarioLogado`, `notificacoesNaoLidas`,
  `loading`, `error`.
- Repository: interface `ShellRepository` em `domain/`,
  `MockShellRepository` + `ApiShellRepository` (stub) em `data/`.
- Componentes com mais de 50 linhas extraídos.
- Sem cor hardcoded. Sem console.log. Sem useState de domínio.
- Strings visíveis em pt_BR via i18n (`useTranslation`) ou constantes `kStr`.
- Zustand (`useShellStore`) apenas se o estado precisar ser compartilhado entre
  `AppTopBar` e `AppSideMenu`. Caso contrário, manter no hook.
- **Sem reconstruir a moldura em rotas filhas** (violação crítica).
- Breakpoints: usar classes Tailwind (`md:`, `lg:`) sempre que possível.
  `useBreakpoint` só para lógica JS (ex: decidir drawer vs sidebar).

## Mocks

- `src/mocks/shell/empresa.json` (nome, cnpj, regional, contato)
- `src/mocks/shell/notificacoes.json` (contagem de não lidas)

## Formato de saída

Cada arquivo em bloco separado, precedido do caminho relativo.
Sem prosa final. Se ambíguo, perguntar antes.