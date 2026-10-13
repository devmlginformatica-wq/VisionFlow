---
mode: agent
description: Cria o módulo Pedido/Orçamento completo
---

# Criar Tela — Módulo Pedido (Vision Flow)

**[PAPEL]** Arquiteto Sênior React + UX para força de vendas B2B.
**[CONTEXTO]** Vision Flow. Pedido e Orçamento compartilham a feature `pedido/`,
diferenciados por `PedidoTipo` (`'pedido' | 'orcamento'`). A tela é **filha do
AppShell** (renderizada via `<Outlet />`) — NÃO incluir top bar, menu lateral ou
drawer próprios.

**[TAREFA]** Criar módulo Pedido/Orçamento completo (lista + editor em 3 abas).

## Estrutura obrigatória
src/features/pedido/
├── domain/
│ ├── entities/Pedido.ts
│ ├── entities/ItemPedido.ts
│ ├── entities/PedidoTipo.ts (enum)
│ ├── repositories/PedidoRepository.ts (interface)
│ ├── services/PedidoTotais.ts (função pura de cálculo)
│ └── validators/pedidoSchema.ts (zod)
├── data/
│ └── repositories/
│ ├── MockPedidoRepository.ts
│ └── ApiPedidoRepository.ts (stub)
└── presentation/
├── viewmodels/
│ ├── usePedidoViewModel.ts (orquestra tudo)
│ ├── usePedidoListaViewModel.ts (lista)
│ └── usePedidoEditorViewModel.ts (editor)
├── pages/
│ ├── PedidoListaPage.tsx (/pedidos e /orcamentos)
│ └── PedidoEditorPage.tsx (/pedidos/novo, /pedidos/:id, etc.)
└── components/
├── lista/
│ ├── PedidoCard.tsx
│ ├── PedidoFiltros.tsx
│ └── PedidoBusca.tsx
├── editor/
│ ├── PedidoEditorHeader.tsx (título + ações)
│ ├── AbaDadosGerais.tsx
│ ├── AbaProdutos.tsx
│ ├── AbaFinalizacao.tsx
│ └── PedidoTotais.tsx (resumo readonly)
└── modais/
├── AdicionarProdutoModal.tsx
└── EditarItemModal.tsx

## LISTA (`/pedidos` e `/orcamentos`)

- Filtros: Todos, Em digitação, Aguardando aprovação, Aprovados, Cancelados.
- Busca por nº, cliente, data.
- Cards com nº, cliente, data, valor, status.
- FAB "Novo Pedido" (ou "Novo Orçamento", conforme `tipo`).
- Aceita query `?filtro=`.

## NAVEGAÇÃO (obrigatório)

Esta é a regra mais importante do módulo. Deve ser implementada exatamente assim:

| Ação do usuário | Comportamento | Rota / Modal |
|---|---|---|
| Clicar num **pedido** da lista | Navega para o editor | **Rota** `/pedidos/:id` |
| Clicar no **FAB "Novo Pedido"** | Navega para o editor vazio | **Rota** `/pedidos/novo` |
| Clicar em **"Adicionar Produto"** (Aba 2) | Abre modal de busca de produto | **Modal** |
| Clicar num **item** da lista (Aba 2) | Abre modal de edição do item | **Modal** |
| Acessar `/orcamentos` | Mesma feature, `PedidoTipo = 'orcamento'` | Rota diferente, mesmo componente |

- Rotas de pedido (`/pedidos/novo`, `/pedidos/:id`) **preservam o estado da lista**
  ao voltar (filtros, scroll). Usar `useSearchParams` para filtros e `navigate(-1)` para voltar.
- Modais de produto/item **não** alteram a URL. Fecham via ESC, clique no overlay ou
  botão "Cancelar".
- Ao "Finalizar Pedido" ou "Salvar": voltar para a lista (`/pedidos` ou `/orcamentos`)
  com o filtro anterior.

## Diferenciação Pedido vs Orçamento

- Mesma feature, mesmo componente `PedidoEditorPage`.
- `PedidoTipo` é lido de:
  - `?tipo=orcamento` (query string) OU
  - segmento da rota (`/orcamentos/...` → tipo = `'orcamento'`).
- A feature adapta:
  - Título ("Novo Pedido" vs "Novo Orçamento").
  - FAB da lista.
  - Rota base (`/pedidos` vs `/orcamentos`).
  - Ação final ("Finalizar Pedido" vs "Salvar Orçamento").
- **Não duplicar componentes** — apenas parametrizar.

## EDITOR (3 abas)

### Aba 1 — Dados Gerais
- Empresa (combo), Cliente (combo), Data emissão (readonly auto), Condição pgto (combo),
  Forma pgto (combo), Data entrega (picker), Endereço faturamento (readonly do cliente),
  Endereço entrega (combo), Endereço cobrança (combo), Transportadora (combo), Frete (BRL).
- Trocar cliente recarrega combos de endereço.
- Formulário via `react-hook-form` + `zod` (schema em `domain/validators/pedidoSchema.ts`).

### Aba 2 — Produtos
- Lista de itens (código, descrição, unidade, qtde, valor, desconto, total, menu ⋮).
- Botão "Adicionar Produto" → **modal** com busca, filtro família/marca, lista de
  produtos (código, unidade, valor, tabela de preço), quantidade + / -, botão adicionar.
- **Clicar num item** → **modal** com 3 grupos:
  1) Info Gerais: tabela preço (combo), qtde, preço venda (readonly), desconto, total,
     obs, sequência, código no cliente.
  2) Dados Adicionais (readonly): código, descrição, família, marca, pesos, cubagem,
     dimensões, unidade, qtde embalagem, permite venda sem estoque, estoque.
  3) Preço: grid com tabelas (nome | faixa | valor | vigência), linha atual destacada.

### Aba 3 — Finalização
- Nro pedido cliente, observações, observações NF.
- Totais (readonly): Quantidade Mix, Volume, Cubagem, Peso Líquido, Peso Bruto,
  Total Bruto, Total Desconto, Total Líquido (com frete).
- Botão "Finalizar Pedido".
- **Cálculo de totais em `domain/services/PedidoTotais.ts` — função pura, testável,
  sem dependência de React.**

## ROTAS

- `/pedidos`, `/pedidos?filtro=`, `/pedidos/novo`, `/pedidos/:id`
- `/orcamentos`, `/orcamentos/novo`, `/orcamentos/:id`

## MOCKS

- `src/mocks/pedido/listar.json`
- `src/mocks/pedido/detalhe_1001.json`
- `src/mocks/empresas/listar.json`
- `src/mocks/clientes/listar.json`
- `src/mocks/transportadoras/listar.json`
- `src/mocks/condicoes_pagamento/listar.json`
- `src/mocks/formas_pagamento/listar.json`
- `src/mocks/produtos/listar.json`
- `src/mocks/tabelas_preco/listar.json`

## Responsividade (obrigatório)

### Lista
- **Mobile (`< 768px`)**: cards empilhados, 1 coluna. FAB no canto inferior direito.
- **Tablet (`768px – 1023px`)**: cards em 2 colunas.
- **Desktop (`>= 1024px`)**: cards em 3 colunas; filtros na lateral esquerda (opcional).

### Editor (3 abas)
- **Mobile (`< 768px`)**: abas scrolláveis no topo; conteúdo empilhado; botões de ação
  em barra fixa no rodapé.
- **Tablet (`768px – 1023px`)**: abas fixas; formulário em 2 colunas quando fizer sentido.
- **Desktop (`>= 1024px`)**: abas no topo; formulário em grid com labels à esquerda;
  ações no header; totais visíveis em painel lateral (Aba 3).

### Modais (adicionar produto, editar item)
- **Mobile (`< 768px`)**: bottom sheet (Radix Dialog estilizado como sheet).
- **Tablet e Desktop (`>= 768px`)**: dialog centralizado.
- Decisão via `useMediaQuery()` (hook próprio) ou classes Tailwind.

Sem media query manual — usar classes responsivas do Tailwind.

## Estados obrigatórios

- `loading`: skeleton de cards (lista) e skeleton do editor.
- `error`: `VfError` com botão "Tentar novamente".
- `empty`: lista vazia mostra `VfEmpty` com botão "Novo Pedido".
  Aba de produtos vazia mostra `VfEmpty` com botão "Adicionar Produto".
- `withData`: renderização normal.

## Formulários

- `react-hook-form` + `zod` (schemas em `domain/validators/`).
- Validação via `zodResolver`.
- Erros exibidos com `VfFieldError`.
- **Submissão via `<form onSubmit={handleSubmit(...)}>`** — Enter submete.
- Enquanto `loading === true`, botão `disabled` (evita duplo submit).
- Modais de produto/item também usam `<form>` — Enter salva.

## Restrições

- Sem cor hardcoded. Sem `console.log`. Sem `useState` de domínio.
- ViewModel não acessa `fetch`, `window` ou `localStorage` diretamente.
- Cálculo de totais em `PedidoTotais.ts` (função pura). Nunca no componente.
- `usePedidoViewModel` expõe: `pedido`, `itens`, `loading`, `error`, ações
  (`listar`, `salvar`, `finalizar`, `adicionarItem`, `removerItem`, `recalcularTotais`).
- Abas: navegação interna com estado local. **Sem rota por aba.**
- Filtros: query string via `useSearchParams`.
- Modais (adicionar produto, editar item): Radix Dialog (dialog no desktop,
  bottom sheet no mobile).
- **Não duplicar componentes entre Pedido e Orçamento** — parametrizar por `PedidoTipo`.
- Renderiza apenas o conteúdo — o AppShell cuida da moldura.
- **Sem top bar, sem menu lateral, sem drawer nesta tela.**
- Componentes > 50 linhas extraídos. Arquivos > 300 linhas quebrados.
- Acessibilidade: `aria-label` em botões icônicos; foco gerenciado em modais.

## Testes de aceitação

- Clicar num pedido da lista navega para `/pedidos/:id` **sem perder o filtro atual**.
- Clicar no FAB navega para `/pedidos/novo`.
- Clicar em "Adicionar Produto" (Aba 2) abre o **modal**.
- Clicar num item da lista (Aba 2) abre o **modal de edição**.
- Fechar modal (ESC, overlay, cancelar) **não altera a URL**.
- `/orcamentos` usa os mesmos componentes que `/pedidos`, só muda `PedidoTipo`.
- Alternar cliente na Aba 1 recarrega combos de endereço.
- Totais recalculam ao adicionar/remover/editar item.
- Enter em formulário (dados gerais, modal de item) submete.
- Layout se adapta aos 3 breakpoints (cards 1/2/3 colunas; abas scrolláveis no mobile;
  modais viram bottom sheet no mobile).
- Loading, error e empty states renderizam corretamente.

## Formato de saída

Um arquivo por bloco, precedido do caminho. Sem prosa. Se ambíguo, perguntar antes.