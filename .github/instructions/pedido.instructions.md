---
applyTo: "src/features/pedido/**/*.{ts,tsx}"
---

# Regras específicas — Módulo Pedido/Orçamento

## Escopo
Estas regras se aplicam a **qualquer arquivo** dentro de `src/features/pedido/`
(entity, repository, service, viewmodel, página, componente). São regras
permanentes da feature, não instruções de criação.

## Estrutura esperada
src/features/pedido/
├── domain/
│ ├── entities/{Pedido,ItemPedido}.ts
│ ├── entities/PedidoTipo.ts
│ ├── repositories/PedidoRepository.ts
│ ├── services/PedidoTotais.ts
│ └── validators/pedidoSchema.ts
├── data/
│ └── repositories/{Mock,Api}PedidoRepository.ts
└── presentation/
├── viewmodels/
│ ├── usePedidoViewModel.ts
│ ├── usePedidoListaViewModel.ts
│ └── usePedidoEditorViewModel.ts
├── pages/
│ ├── PedidoListaPage.tsx
│ └── PedidoEditorPage.tsx
└── components/
├── lista/
│ ├── PedidoCard.tsx
│ ├── PedidoFiltros.tsx
│ └── PedidoBusca.tsx
├── editor/
│ ├── PedidoEditorHeader.tsx
│ ├── AbaDadosGerais.tsx
│ ├── AbaProdutos.tsx
│ ├── AbaFinalizacao.tsx
│ └── PedidoTotais.tsx
└── modais/
├── AdicionarProdutoModal.tsx
└── EditarItemModal.tsx

## Lista (`/pedidos` e `/orcamentos`)

- Filtros: Todos, Em digitação, Aguardando aprovação, Aprovados, Cancelados.
- Busca por nº, cliente, data.
- Cards com nº, cliente, data, valor, status.
- FAB "Novo Pedido" (ou "Novo Orçamento", conforme `tipo`).
- Aceita query `?filtro=`.

## Navegação (obrigatório)

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

- **Mesmos arquivos**, **mesmos componentes**. Diferenciados por `PedidoTipo`.
- `PedidoTipo` é lido de prop do route (`<Route path="/orcamentos" element={<PedidoEditorPage tipo="orcamento" />} />`).
- A feature adapta:
  - Título ("Novo Pedido" vs "Novo Orçamento").
  - FAB da lista.
  - Rota base (`/pedidos` vs `/orcamentos`).
  - Ação final ("Finalizar Pedido" vs "Salvar Orçamento").
- **Não duplicar componentes** — apenas parametrizar.
- **Nunca criar** `OrcamentoPage.tsx` separado, nem pasta `features/orcamento/`.

## Editor (3 abas)

### Aba 1 — Dados Gerais
- Empresa (combo), Cliente (combo), Data emissão (readonly auto), Condição pgto (combo),
  Forma pgto (combo), Data entrega (picker), Endereço faturamento (readonly do cliente),
  Endereço entrega (combo), Endereço cobrança (combo), Transportadora (combo), Frete (BRL).
- **Trocar cliente dispara `carregarEnderecosDoCliente(clienteId)`** no ViewModel.
- Combos de endereço só habilitam **após** cliente escolhido.
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
- **Alteração em item dispara `recalcularTotais()`** no ViewModel.

### Aba 3 — Finalização
- Nro pedido cliente, observações, observações NF.
- Totais (readonly): Quantidade Mix, Volume, Cubagem, Peso Líquido, Peso Bruto,
  Total Bruto, Total Desconto, Total Líquido (com frete).
- Botão "Finalizar Pedido".
- **Cálculo de totais em `domain/services/PedidoTotais.ts` — função pura, testável,
  sem dependência de React.** Nunca calcular inline no componente.

## Formatação

- Valores monetários: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- Nunca formatar manualmente com concatenação de string.

## Regras da feature

- A tela é **filha do AppShell** (via `<Outlet />`). Nunca renderiza top bar,
  menu lateral ou drawer próprios.
- `usePedidoViewModel` expõe: `pedido`, `itens`, `loading`, `error`, ações
  (`listar`, `salvar`, `finalizar`, `adicionarItem`, `removerItem`, `recalcularTotais`).
- `usePedidoListaViewModel` expõe: `pedidos`, `filtros`, `loading`, `error`.
- `usePedidoEditorViewModel` expõe: `pedido`, `itens`, `totais`, `loading`, `error`.
- Nenhum acesso direto a `fetch` — só via `PedidoRepository`.
- Abas: navegação interna com estado local. **Sem rota por aba.**
- Cada aba é um **componente separado** (`AbaDadosGerais.tsx`, `AbaProdutos.tsx`,
  `AbaFinalizacao.tsx`).
- Formulários via `react-hook-form` + `zod`. Submissão via `<form onSubmit={handleSubmit(...)}>`.
- Modais via Radix Dialog (dialog no desktop, bottom sheet no mobile).
- Sem cor hardcoded. Sem `console.log`. Sem `useState` de domínio.
- Componentes > 50 linhas extraídos. Arquivos > 300 linhas quebrados.
- Acessibilidade: `aria-label` em botões icônicos; foco gerenciado em modais.

## Responsividade

### Lista
- **Mobile (`< 768px`)**: cards empilhados, 1 coluna. FAB no canto inferior direito.
- **Tablet (`768px – 1023px`)**: cards em 2 colunas.
- **Desktop (`>= 1024px`)**: cards em 3 colunas; filtros na lateral esquerda (opcional).

### Editor (3 abas)
- **Mobile (`< 768px`)**: abas scrolláveis no topo; conteúdo empilhado; botões de
  ação em barra fixa no rodapé.
- **Tablet (`768px – 1023px`)**: abas fixas; formulário em 2 colunas quando fizer sentido.
- **Desktop (`>= 1024px`)**: abas no topo; formulário em grid com labels à esquerda;
  ações no header; totais visíveis em painel lateral (Aba 3).

### Modais (adicionar produto, editar item)
- **Mobile (`< 768px`)**: bottom sheet (Radix Dialog estilizado como sheet).
- **Tablet e Desktop (`>= 768px`)**: dialog centralizado.
- Decisão via `useMediaQuery()` (hook próprio) ou classes Tailwind.

Sem media query manual — usar classes Tailwind (`md:`, `lg:`).

## Estados obrigatórios

- `loading`: skeleton de cards (lista) e skeleton do editor.
- `error`: `VfError` com botão "Tentar novamente".
- `empty`: lista vazia mostra `VfEmpty` com botão "Novo Pedido".
  Aba de produtos vazia mostra `VfEmpty` com botão "Adicionar Produto".
- `withData`: renderização normal.

## Testes de aceitação

- Clicar num pedido da lista navega para `/pedidos/:id` **sem perder o filtro atual**.
- Clicar no FAB navega para `/pedidos/novo`.
- Clicar em "Adicionar Produto" (Aba 2) abre o **modal**.
- Clicar num item da lista (Aba 2) abre o **modal de edição**.
- Fechar modal (ESC, overlay, cancelar) **não altera a URL**.
- `/orcamentos` usa os mesmos componentes que `/pedidos`, só muda `PedidoTipo`.
- Alternar cliente na Aba 1 recarrega combos de endereço.
- Combos de endereço ficam desabilitados até o cliente ser escolhido.
- Totais recalculam ao adicionar/remover/editar item.
- Valores monetários exibidos no formato `R$ 1.250,90`.
- Enter em formulário (dados gerais, modal de item) submete.
- Layout se adapta aos 3 breakpoints (cards 1/2/3 colunas; abas scrolláveis no mobile;
  modais viram bottom sheet no mobile).
- Loading, error e empty states renderizam corretamente.