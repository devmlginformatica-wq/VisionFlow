---
mode: agent
description: Cria a Home do Vision Flow (indicadores + avisos)
---

# Criar Tela — Home (Vision Flow)

**[PAPEL]** Arquiteto Sênior React + Designer UI/UX.
**[CONTEXTO]** Vision Flow. Usuário já autenticado. A tela é **filha do AppShell**
(renderizada via `<Outlet />`), portanto NÃO inclui top bar, menu lateral ou
drawer próprios — apenas o conteúdo da área principal.

**[TAREFA]** Criar a Home com:

## Boas-vindas
- Nome do usuário logado (via `useAuthStore`).
- Se houver pedidos em digitação, botão "Ver pedidos em digitação".

## Indicadores (cards clicáveis)
- "Suas vendas no mês (R$)" → `/dashboard`
- "Suas vendas hoje (R$)" → `/dashboard`
- "Pedidos em digitação" → `/pedidos?filtro=em_digitacao`
- "Orçamentos em digitação" → `/orcamentos?filtro=em_digitacao`
- "Clientes em digitação" → `/clientes?filtro=em_digitacao`
- "Pedidos aguardando aprovação" → `/clientes?filtro=bloqueado`
- "Agendas pendentes" → `/agenda?filtro=pendentes`
- "Tarefas pendentes" → `/tarefa?filtro=pendentes`

## Avisos e novidades
- Se notificações não lidas: contagem + botão "Abrir recados".
- Se vazio: "Tudo em ordem" / "Nenhum aviso no momento".

## Estrutura obrigatória
src/features/home/
├── domain/
│ ├── entities/Indicador.ts
│ ├── entities/Aviso.ts
│ └── repositories/HomeRepository.ts (interface)
├── data/
│ └── repositories/
│ ├── MockHomeRepository.ts
│ └── ApiHomeRepository.ts (stub)
└── presentation/
├── viewmodels/useHomeViewModel.ts
├── pages/HomePage.tsx
└── components/
├── HomeWelcome.tsx
├── HomeIndicadoresGrid.tsx
├── HomeIndicadorCard.tsx
└── HomeAvisos.tsx

## Mocks

- `src/mocks/home/indicadores.json`
- `src/mocks/notificacoes/listar.json`

## Rotas

- `/` (Home). Todos os filtros via query string (`useSearchParams`).

## Responsividade (obrigatório)

- **Mobile (`< 768px`)**: grid de indicadores com **1 coluna**; boas-vindas
  empilhado; avisos em card full-width.
- **Tablet (`768px – 1023px`)**: grid de indicadores com **2 colunas**.
- **Desktop (`>= 1024px`)**: grid de indicadores com **4 colunas**; boas-vindas
  e avisos em linha (welcome à esquerda, avisos à direita).

Sem media query manual — usar classes responsivas do Tailwind (`md:`, `lg:`).

## Estados obrigatórios

- `loading`: skeletons nos cards e no bloco de boas-vindas (`VfSkeleton`).
- `error`: `VfError` com botão "Tentar novamente".
- `empty`: para avisos, exibir "Tudo em ordem" (não é erro, é estado vazio).
- `withData`: renderização normal dos indicadores e avisos.

## Restrições

- Sem cor hardcoded. Sem `console.log`. Sem `useState` de domínio.
- Cards com `VfCard` reutilizável (`src/core/components/VfCard.tsx`).
- Componentes > 50 linhas extraídos. Arquivos > 300 linhas quebrados.
- ViewModel (`useHomeViewModel`) expõe: `usuario`, `indicadores`,
  `notificacoes`, `loading`, `error`.
- ViewModel não acessa `fetch`, `window` ou `localStorage` diretamente.
- Renderiza apenas o conteúdo — o AppShell cuida da moldura.
- **Sem top bar, sem menu lateral, sem drawer nesta tela.**
- Navegação via React Router v6 (`useNavigate`, `Link`, `useSearchParams`).
- Strings via i18n (`useTranslation`) ou constantes `kStr`.

## Testes de aceitação

- Nome do usuário logado aparece corretamente.
- Clicar em cada indicador navega para a rota correta (com query string).
- Notificações não lidas exibem contagem e botão "Abrir recados".
- Sem notificações, exibe "Tudo em ordem".
- Layout se adapta aos 3 breakpoints (1 / 2 / 4 colunas).
- Loading, error e empty states renderizam corretamente.

## Formato de saída

Um arquivo por bloco, precedido do caminho. Sem prosa. Se ambíguo, perguntar antes.