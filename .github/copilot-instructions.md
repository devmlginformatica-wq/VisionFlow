# Vision Flow — Instruções Globais do Projeto

Este é o projeto **Vision Flow**, uma **força de vendas web/PWA** em React + Vite,
que se integra a um **ERP Delphi existente**. Nesta fase inicial construímos
**apenas o front-end**, com **dados mockados**, mas todo o código já deve estar
**preparado para trocar o Mock pela API real** sem reescrever a apresentação.

## STACK OFICIAL
- React 18 + TypeScript + Vite
- Arquitetura: Feature-First + MVVM
- Estado global: Zustand (tema via Context puro)
- Navegação: React Router v6 (createBrowserRouter, com deep link)
- Dados: Repository Pattern (interface + Mock + Api stub)
- HTTP: fetch nativo (preparado, não usado na fase mock)
- Formulários: react-hook-form + zod (validação + tipagem)
- i18n: i18next + react-i18next (pt_BR padrão, en secundário)
- Tema: ThemeProvider com troca de cor primária e mode (light/dark/system) em runtime
- Estilo: Tailwind CSS puro (sem lib de componentes)
- Primitivos acessíveis: Radix UI (Popover, Dialog, Drawer, Tabs) — apenas primitivos
- Plataformas: Web + PWA (instalável, offline-first)
- Logger: loglevel (nunca console.log)
- PWA: vite-plugin-pwa (Service Worker + Manifest) + IndexedDB (Dexie) para cache offline

## BREAKPOINTS OFICIAIS

| Nome     | Largura          | Tailwind      | Comportamento base                          |
|----------|------------------|---------------|---------------------------------------------|
| Mobile   | `< 768px`        | `base`        | 1 coluna, FAB, drawer, bottom sheet         |
| Tablet   | `768px – 1023px` | `md:`         | 2 colunas, rail lateral fino                |
| Desktop  | `>= 1024px`      | `lg:` / `xl:` | Grid amplo, sidebar, dialog, top bar cheia  |

Regras:
- Toda tela declara explicitamente o que muda em cada breakpoint.
- Sem media queries manuais — usar as classes responsivas do Tailwind.
- `useMediaQuery` (hook próprio) apenas quando precisar de lógica JS
  (ex: abrir bottom sheet vs dialog), nunca para estilização.

## SHELL (moldura de todas as telas autenticadas)

O AppShell é persistente e adaptativo em 3 modos:

| Elemento      | Mobile                | Tablet                    | Desktop                        |
|---------------|-----------------------|---------------------------|--------------------------------|
| Top bar       | Enxuta (hambúrguer + logo + avatar) | Compacta (logo + empresa + ações) | Completa (logo + empresa + CNPJ + regional + ações) |
| Navegação     | Drawer (hambúrguer)   | Rail lateral fixo (`w-16`) | Sidebar colapsável (`w-16` → `w-64` no hover/clique) |
| Conteúdo      | Área cheia            | Ao lado do rail            | Ao lado da sidebar             |

Regras:
- A moldura NUNCA é reconstruída por tela filha (usa layout route + `<Outlet />`).
- Top bar SEMPRE visível em todos os breakpoints.
- Sidebar colapsa por padrão; expande no hover (desktop) ou clique.
- Item ativo da navegação destacado com cor primária.

## EDITOR DE PEDIDO
- Fica DENTRO do AppShell (área de conteúdo).
- Barra de ações contextual no topo do editor (Salvar, Finalizar, Cancelar).
- No mobile, modais viram bottom sheet; no desktop, viram dialog.
- Demais telas de cadastro (cliente) seguem o mesmo padrão.

## ESTRUTURA DE PASTAS
src/
├── main.tsx
├── App.tsx
├── core/{theme,router,errors,di,utils,components,shell}
├── features/<nome>/{domain,data,presentation}
├── shared/{models,extensions}
├── mocks/          (JSONs mockados por feature)
└── i18n/

Cada feature:
features/<nome>/
├── domain/{entities,repositories,services}
├── data/{repositories,datasources}
└── presentation/{viewmodels,pages,components}

## REGRAS DE CÓDIGO (Clean Code — OBRIGATÓRIO)
- Código (componentes, funções, variáveis, tipos) em inglês.
- Strings visíveis em pt_BR via i18n ou constantes kStr.
- Comentários em português.
- Interfaces sem prefixo I. Mock e Api com sufixos.
- View (componente de página) sem regra de negócio. Componente > 50 linhas → arquivo próprio.
- ViewModel via hook customizado (ex: useHomeViewModel) que expõe loading, error, data.
- Repository: interface abstrata em domain/, Mock + Api stub em data/.
- Entidades puras, sem React, com fromJson/toJson/copyWith/equals.
- Sempre async/await (nunca .then()).
- Sem console.log — usar logger. Sem any injustificado.
- Zustand apenas para estado global (auth, shell, notificações compartilhadas).
- Tema via Context puro (não Zustand) — é configuração de UI, não dado de domínio.
- Estado local de UI com useState. Estado de expand de accordion/tab é local.

## ENVELOPE JSON (Mock e API real)
{
  "success": true,
  "data": { },
  "error": null
}

Campos em snake_case. Datas ISO 8601. Monetários number. IDs int.

## ENDPOINTS PADRÃO
POST /auth/login
POST /auth/logout
GET  /home/indicadores
GET  /clientes
GET  /clientes/{id}
GET  /clientes/cnpj/{cnpj}
GET  /pedidos
POST /pedidos
GET  /orcamentos
GET  /agenda
GET  /tarefas
GET  /notificacoes

## FEATURES
- auth: login mockado (admin@visionflow.app / 123456)
- home: boas-vindas, indicadores clicáveis, avisos
- cliente: lista de cards accordion, cadastro em 5 abas, consulta CNPJ
- pedido: lista + editor com 3 abas (Dados Gerais, Produtos, Finalização)
- orcamento: mesma feature do pedido, diferenciada por PedidoTipo
- agenda: lista com filtro pendentes
- tarefa: lista com filtro pendentes
- notificacao: recados não lidos

## TEMA
Cor primária turquesa (#1AA7A4). ThemeProvider troca em runtime via CSS variables.
Light/dark/system. Classe `dark` no `<html>`. Sem cor hardcoded.
Script anti-FOUC no index.html.

## PROIBIÇÕES ABSOLUTAS
❌ Regra de negócio na View
❌ useState para dado de domínio
❌ Instanciar fetch diretamente em componente ou ViewModel (só no datasource)
❌ any sem justificativa
❌ String visível hardcoded
❌ Cor/tamanho/rota hardcoded
❌ Código sem tratamento de erro
❌ Pacote novo sem justificar (react-hook-form, zod e Radix são oficiais)
❌ Concatenação de string em query
❌ console.log
❌ .then()
❌ Componente > 50 linhas sem extrair
❌ Arquivo > 300 linhas
❌ dangerouslySetInnerHTML
❌ Media query manual (usar classes Tailwind)
❌ Reconstruir top bar/menu dentro de tela filha

## FORMATO DE SAÍDA
Cada arquivo em bloco separado, precedido do caminho relativo.
Sem prosa final. Comentários só onde não for óbvio.
Se ambíguo, PERGUNTAR antes de gerar.

---

## FASE OFFLINE-FIRST (ATUAL)

### Decisões travadas (Não sugerir alternativas)
- A fila de sync vive em `features/sync/` (Feature-First). NÃO vai em `core/`.
- Cada feature offline-first tem DOIS datasources em `data/datasources/`:
  - `LocalDatasource` (Dexie) — leitura/escrita local
  - `ApiDatasource` (fetch) — único ponto que fala com a rede
- Cada feature offline-first tem UMA implementação de repository:
  `OfflineFirstXRepository`, que substitui o `ApiRepository` em produção.
  O `MockRepository` continua existindo para dev sem backend.
- `OfflineFirstXRepository`:
  - Lê do Dexie primeiro (resposta imediata)
  - Dispara fetch em background para atualizar o Dexie
  - Em escritas, grava no Dexie com `syncStatus="pending"` e enfileira uma
    `SyncOperation` na fila
- `SyncEngine` vive em `features/sync/domain/services/` e é injetado via
  `core/di`. NUNCA chama fetch direto — usa o `ApiDatasource` da feature.
- `SyncOperation` é entidade pura em `features/sync/domain/entities/` com
  `fromJson`/`toJson`/`copyWith`/`equals`.
- Toda entidade offline-first ganha:
  - `updated_at: string` (ISO 8601) — vem do backend
  - `syncStatus: 'synced' | 'pending' | 'error'` — local, nunca enviado à API
- `SyncQueue` persistida em Dexie (`sync_queue`), FIFO, com:
  `id, entity, entityId, action ('create'|'update'|'delete'), payload,
  createdAt, attempts, lastError`
- Resolução de conflito: `newer-wins`. Antes de enviar update, `SyncEngine`
  faz `GET /{entity}/{id}` e compara `updated_at`. Se o do servidor for mais
  novo, descarta o local e marca `syncStatus="error"` com `lastError`.
- Detecção online/offline via `navigator.onLine` + eventos `online`/`offline`,
  encapsulada em `useNetworkStatus` em `core/utils`.
- Service Worker (`vite-plugin-pwa`) faz cache APENAS do app shell.

### Regras complementares
- ViewModel expõe apenas: `loading`, `error`, `data`, `syncStatus`.
- View nunca enfileira operação. Só chama ViewModel.
- Escritas offline NÃO bloqueiam a UI (Optimistic UI).
- Nenhum componente importa Dexie. Nenhum datasource faz regra de negócio.