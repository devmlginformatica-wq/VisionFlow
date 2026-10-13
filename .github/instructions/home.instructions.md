---
applyTo: "src/features/home/**/*.{ts,tsx}"
---

# Regras específicas — Módulo Home

## Escopo
Estas regras se aplicam a **qualquer arquivo** dentro de `src/features/home/`
(entity, repository, viewmodel, página, componente). São regras permanentes
da feature, não instruções de criação.

## Estrutura esperada
src/features/home/
├── domain/
│ ├── entities/{Indicador,Aviso}.ts
│ └── repositories/HomeRepository.ts
├── data/
│ └── repositories/{Mock,Api}HomeRepository.ts
└── presentation/
├── viewmodels/useHomeViewModel.ts
├── pages/HomePage.tsx
└── components/
├── HomeWelcome.tsx
├── HomeIndicadoresGrid.tsx
├── HomeIndicadorCard.tsx
└── HomeAvisos.tsx

## Conteúdo da Home

### Boas-vindas
- Nome do usuário logado (via `useAuthStore`).
- Se houver pedidos em digitação, mostrar botão "Ver pedidos em digitação"
  (navega para `/pedidos?filtro=em_digitacao`).

### Indicadores clicáveis
Cada card navega para a feature correspondente com filtro:

| Indicador                          | Rota destino                       |
|------------------------------------|------------------------------------|
| Suas vendas no mês (R$)            | `/dashboard`                       |
| Suas vendas hoje (R$)              | `/dashboard`                       |
| Pedidos em digitação               | `/pedidos?filtro=em_digitacao`     |
| Orçamentos em digitação            | `/orcamentos?filtro=em_digitacao`  |
| Clientes em digitação              | `/clientes?filtro=em_digitacao`    |
| Pedidos aguardando aprovação       | `/clientes?filtro=bloqueado`       |
| Agendas pendentes                  | `/agenda?filtro=pendentes`         |
| Tarefas pendentes                  | `/tarefa?filtro=pendentes`         |

### Avisos / novidades
- Se notificações não lidas: mostrar contagem + botão "Abrir recados".
- Se vazio: "Tudo em ordem — Nenhum aviso no momento".

## Regras da feature

- A Home é **filha do AppShell** (via `<Outlet />`). Nunca renderiza top bar,
  menu lateral ou drawer próprios.
- O `useHomeViewModel` expõe: `usuario`, `indicadores`, `notificacoes`,
  `loading`, `error`.
- O ViewModel não acessa `fetch`, `window` ou `localStorage` diretamente —
  tudo via `HomeRepository`.
- Cards usam o componente genérico `VfCard` (`src/core/components/VfCard.tsx`).
- Sem cor hardcoded. Sem `console.log`. Sem `useState` de domínio.
- Componentes > 50 linhas extraídos. Arquivos > 300 linhas quebrados.

## Responsividade

- **Mobile (`< 768px`)**: indicadores em **1 coluna**; boas-vindas e avisos
  empilhados.
- **Tablet (`768px – 1023px`)**: indicadores em **2 colunas**.
- **Desktop (`>= 1024px`)**: indicadores em **4 colunas**; boas-vindas à
  esquerda e avisos à direita, na mesma linha.

Sem media query manual — usar classes Tailwind (`md:`, `lg:`).

## Estados obrigatórios

- `loading`: skeletons nos cards e no bloco de boas-vindas (`VfSkeleton`).
- `error`: `VfError` com botão "Tentar novamente".
- `empty`: para avisos, exibir "Tudo em ordem" (estado vazio, não erro).
- `withData`: renderização normal.

## Navegação

- Navegação via React Router v6 (`useNavigate`, `Link`, `useSearchParams`).
- Indicadores clicáveis usam `Link` (para permitir abrir em nova aba).
- Preservar query string (`?filtro=...`) ao navegar.

## Testes de aceitação

- Nome do usuário logado aparece corretamente.
- Cada indicador navega para a rota correta (com filtro).
- Notificações não lidas exibem contagem + botão "Abrir recados".
- Sem notificações, exibe "Tudo em ordem".
- Layout se adapta aos 3 breakpoints (1 / 2 / 4 colunas).
- Loading, error e empty states renderizam corretamente.