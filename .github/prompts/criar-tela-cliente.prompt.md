---
mode: agent
description: Cria o módulo Cliente (lista accordion + cadastro em 5 abas)
---

# Criar Tela — Módulo Cliente (Vision Flow)

**[PAPEL]** Arquiteto Sênior React + UX B2B.
**[CONTEXTO]** Vision Flow. Fase mock. Envelope JSON padrão. A tela é **filha do
AppShell** (renderizada via `<Outlet />`) — NÃO incluir top bar, menu lateral ou
drawer próprios.

**[TAREFA]** Criar o módulo Cliente completo (lista + cadastro/edição em 5 abas).

## Estrutura obrigatória
src/features/cliente/
├── domain/
│ ├── entities/Cliente.ts
│ ├── entities/Endereco.ts
│ ├── entities/Titulo.ts
│ ├── repositories/ClienteRepository.ts (interface)
│ └── validators/clienteSchema.ts (zod)
├── data/
│ └── repositories/
│ ├── MockClienteRepository.ts
│ └── ApiClienteRepository.ts (stub)
└── presentation/
├── viewmodels/useClienteViewModel.ts
├── viewmodels/useEnderecoViewModel.ts
├── pages/
│ ├── ClienteListaPage.tsx (/clientes)
│ └── ClienteEditorPage.tsx (/clientes/novo e /clientes/:id)
└── components/
├── lista/
│ ├── ClienteCard.tsx
│ ├── ClienteCardDetalhes.tsx (accordion expandido)
│ ├── ClienteFiltrosChips.tsx
│ ├── ClienteBusca.tsx
│ └── ClienteMenuAcoes.tsx (menu ⋮)
└── editor/
├── ClienteEditorHeader.tsx (título + botões de ação)
├── AbaDadosGerais.tsx
├── AbaEnderecos.tsx
├── AbaPadroes.tsx
├── AbaTitulos.tsx
├── AbaOutros.tsx
└── EnderecoModal.tsx (modal de cadastro de endereço)

## LISTA (`/clientes`)

- Título "Clientes".
- Ícones no topo: alternar visualização (lista/grade), abrir filtros avançados.
- Campo busca: "Pesquisar Cliente...".
- Chips de filtro: Todos | Inatividade | Em digitação | Prospects | Efetivos |
  Bloqueados | Sem Followup (+30d) | Vencidos.
- Lista vertical de cards.
- Cada card: barra lateral colorida (verde/vermelho), badges (data + status),
  nome, razão social, CPF/CNPJ com ícone copiar, endereço resumido, código #24129,
  menu ⋮, botão "Detalhes ˅" que expande (accordion) mostrando endereço completo,
  último pedido, último atendimento.
- FAB "＋ Adicionar Cliente".
- Scroll vertical.

## NAVEGAÇÃO (obrigatório)

Esta é a regra mais importante do módulo. Deve ser implementada exatamente assim:

| Ação do usuário | Comportamento | Rota / Modal |
|---|---|---|
| Clicar num **cliente** da lista | Navega para a tela de edição | **Rota** `/clientes/:id` |
| Clicar no **FAB "Adicionar Cliente"** | Navega para a tela de cadastro | **Rota** `/clientes/novo` |
| Clicar num **card de endereço** do cliente | Abre o cadastro de endereço | **Modal** (bottom sheet no mobile, dialog no desktop) |
| Clicar em "Adicionar Endereço" (Aba 2) | Abre o cadastro de endereço | **Modal** (mesmo componente) |

- Rotas de cliente (`/clientes/novo` e `/clientes/:id`) **preservam o estado da lista**
  ao voltar (filtros, scroll). Usar `useSearchParams` para filtros e `navigate(-1)` para voltar.
- Modais de endereço **não** alteram a URL. Fecham via ESC, clique no overlay ou
  botão "Cancelar". Não navegam para rota.
- Ao "Finalizar Cliente" ou "Salvar": voltar para a lista (`/clientes`) com o filtro anterior.

## MENU ⋮ (modal)

- Incluir pedido
- Incluir orçamento
- Incluir tarefa
- Incluir rota
- Excluir cliente
- Atalhos: Ver pedidos, Ver tarefas

Abre como modal (Radix Dialog). No mobile, pode virar bottom sheet.

## CADASTRO / EDIÇÃO (5 abas)

### Aba 1 — Dados Gerais
- Cliente: [#24129] ou [Novo].
- Checkbox "Cliente Prospect?".
- Campo CNPJ/CPF com lupa que consulta `ClienteRepository.consultarCnpj()` e
  preenche: razão social, fantasia, IE, e-mail, telefone, endereço.
- Nome/Razão Social (obrigatório).
- Apelido/Fantasia.
- IE/RG.
- Nome do Contato (Comprador).
- E-mail.
- Nome do Contato (Faturamento).
- E-mail p/ Envio do Faturamento (NF-e/NFS-e).
- Tel. Comercial (obrigatório).
- Tel. Celular.
- Outro Telefone.

### Aba 2 — Endereços
- Lista de cards: logradouro, bairro, cidade/UF, tipo/finalidade.
- Cada card: ícone de localização + ação excluir.
- **Clicar no card abre o modal de edição do endereço.**
- Botão "Adicionar Endereço" no topo direito (abre o mesmo modal, em modo criação).
- Modal Cadastro de Endereço: tipo, CEP (busca ViaCEP mock), endereço, número,
  complemento, bairro, cidade, estado, ponto de referência, restrições de entrega.
- Endereços mantidos localmente até "Finalizar Cliente".

### Aba 3 — Padrões
- Transportadora (padrão), Condição pgto (padrão), Forma pgto (padrão),
  Tabela preço (padrão) — combos com busca.
- Dt. Última Visita — date picker.
- ID Integração — readonly.

### Aba 4 — Títulos (SOMENTE LEITURA)
- Lista: título, parcela, tipo doc, série, emissão, vencimento, valor em aberto.
- Resumo: Total a vencer (turquesa), Total Vencido (vermelho), Total em Aberto (turquesa).

### Aba 5 — Outros
- Limite de Crédito.
- Observações (usuário).
- Observações (ERP).

## CABEÇALHO DO CADASTRO

- "Cadastro de Cliente"
- Botões: ✓ Finalizar Cliente | 💾 Salvar | ✕ Cancelar | ⋮.
- No mobile, os botões podem colapsar em um menu de ações.
- No desktop, os botões ficam visíveis.

## ROTAS

- `/clientes` — lista
- `/clientes?filtro=` — lista filtrada
- `/clientes/novo` — cadastro
- `/clientes/:id` — edição

## MOCKS

- `src/mocks/clientes/listar.json`
- `src/mocks/clientes/24129/enderecos.json`
- `src/mocks/clientes/cnpj/61186888000193.json`

## Responsividade (obrigatório)

### Lista
- **Mobile (`< 768px`)**: cards empilhados, 1 coluna. FAB no canto inferior direito.
- **Tablet (`768px – 1023px`)**: cards em 2 colunas.
- **Desktop (`>= 1024px`)**: cards em 3 colunas; filtros na lateral esquerda (opcional).

### Editor (cadastro/edição)
- **Mobile (`< 768px`)**: abas como `Tabs` scrolláveis no topo; conteúdo empilhado;
  botões de ação em barra fixa no rodapé.
- **Tablet (`768px – 1023px`)**: abas fixas no topo; conteúdo em 2 colunas onde fizer sentido.
- **Desktop (`>= 1024px`)**: abas no topo; formulário em grid com labels à esquerda
  e inputs à direita; ações no header.

### Modais (menu ⋮, endereço)
- **Mobile (`< 768px`)**: bottom sheet via Radix Dialog estilizado.
- **Tablet e Desktop (`>= 768px`)**: dialog centralizado.

Sem media query manual — usar classes responsivas do Tailwind (`md:`, `lg:`).

## Estados obrigatórios

- `loading`: skeleton de cards (lista) e skeleton do form (editor).
- `error`: `VfError` com botão "Tentar novamente".
- `empty`: lista vazia mostra `VfEmpty` com botão "Adicionar Cliente".
- `withData`: renderização normal.

## Restrições

- Card accordion: estado do expand é **local** (`useState` permitido).
- Resto sem regra de negócio na View.
- Componentes > 50 linhas extraídos. Arquivos > 300 linhas quebrados.
- Sem cor hardcoded. Sem `console.log`. Sem `useState` de domínio.
- ViewModel (`useClienteViewModel`) expõe: `clientes`, `loading`, `error`,
  `filtros`, ações (`listar`, `salvar`, `excluir`, `consultarCnpj`).
- ViewModel (`useEnderecoViewModel`) expõe: `enderecos`, `loading`, `error`,
  ações (`adicionar`, `editar`, `remover`).
- Formulário de cadastro: `react-hook-form` + `zod`.
- Submissão de formulários via `<form onSubmit={handleSubmit(...)}>`. Enter submete.
- Abas: navegação interna com estado local. **Sem rota por aba.**
- Filtros: query string via `useSearchParams`.
- Modais (menu ⋮, cadastro de endereço): Radix Dialog (dialog no desktop,
  bottom sheet no mobile).
- Renderiza apenas o conteúdo — o AppShell cuida da moldura.
- **Sem top bar, sem menu lateral, sem drawer nesta tela.**
- Acessibilidade: `aria-label` em botões icônicos; foco gerenciado em modais.

## Testes de aceitação

- Clicar num cliente da lista navega para `/clientes/:id` **sem perder o filtro atual**.
- Clicar no FAB navega para `/clientes/novo`.
- Clicar num card de endereço (Aba 2) abre o **modal** de edição.
- "Adicionar Endereço" (Aba 2) abre o mesmo modal em modo criação.
- Fechar o modal (ESC, overlay, cancelar) **não altera a URL**.
- Filtros aplicados persistem ao voltar da edição (query string).
- Layout se adapta aos 3 breakpoints (cards 1/2/3 colunas; abas scrolláveis no mobile).
- Loading, error e empty states renderizam corretamente.
- Enter no formulário de endereço salva o endereço e fecha o modal.
- Enter no formulário de cliente salva o cliente e volta para a lista.

## Formato de saída

Um arquivo por bloco, precedido do caminho. Sem prosa. Se ambíguo, perguntar antes.