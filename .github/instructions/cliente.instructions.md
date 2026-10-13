---
applyTo: "src/features/cliente/**/*.{ts,tsx}"
---

# Regras específicas — Módulo Cliente

## Escopo
Estas regras se aplicam a **qualquer arquivo** dentro de `src/features/cliente/`
(entity, repository, viewmodel, página, componente). São regras permanentes
da feature, não instruções de criação.

## Estrutura esperada
src/features/cliente/
├── domain/
│ ├── entities/{Cliente,Endereco,Titulo}.ts
│ ├── repositories/ClienteRepository.ts
│ └── validators/clienteSchema.ts
├── data/
│ └── repositories/{Mock,Api}ClienteRepository.ts
└── presentation/
├── viewmodels/{useClienteViewModel,useEnderecoViewModel}.ts
├── pages/{ClienteListaPage,ClienteEditorPage}.tsx
└── components/
├── lista/
│ ├── ClienteCard.tsx
│ ├── ClienteCardDetalhes.tsx
│ ├── ClienteFiltrosChips.tsx
│ ├── ClienteBusca.tsx
│ └── ClienteMenuAcoes.tsx
└── editor/
├── ClienteEditorHeader.tsx
├── AbaDadosGerais.tsx
├── AbaEnderecos.tsx
├── AbaPadroes.tsx
├── AbaTitulos.tsx
├── AbaOutros.tsx
└── EnderecoModal.tsx

## Lista (`/clientes`)

- Cards com barra lateral colorida indicando status (verde = ativo, vermelho = inativo/bloqueado).
- Card tem modo **accordion** ("Detalhes ˅" expande). Estado do expand é **local** (`useState` permitido).
- Accordion expandido mostra: endereço completo, último pedido, último atendimento.
- Filtros: Todos, Inatividade, Em digitação, Prospects, Efetivos, Bloqueados,
  Sem Followup (+30d), Vencidos.
- Busca por nome, razão, fantasia, CPF, CNPJ, código.
- CPF/CNPJ tem ícone "copiar" (`Clipboard API`).
- FAB "＋ Adicionar Cliente".

## Navegação (obrigatório)

| Ação do usuário | Comportamento | Rota / Modal |
|---|---|---|
| Clicar num **cliente** da lista | Navega para a tela de edição | **Rota** `/clientes/:id` |
| Clicar no **FAB "Adicionar Cliente"** | Navega para a tela de cadastro | **Rota** `/clientes/novo` |
| Clicar num **card de endereço** (Aba 2) | Abre o cadastro de endereço | **Modal** (bottom sheet mobile / dialog desktop) |
| Clicar em "Adicionar Endereço" (Aba 2) | Abre o mesmo modal, em modo criação | **Modal** |

- Rotas de cliente (`/clientes/novo`, `/clientes/:id`) **preservam o estado da lista**
  ao voltar (filtros, scroll). Usar `useSearchParams` para filtros e `navigate(-1)` para voltar.
- Modais de endereço **não** alteram a URL. Fecham via ESC, clique no overlay ou
  botão "Cancelar".
- Ao "Finalizar Cliente" ou "Salvar": voltar para a lista (`/clientes`) com o filtro anterior.

## Cadastro / Edição (5 abas)

### Aba 1 — Dados Gerais
- Cliente: `[#24129]` ou `[Novo]`.
- Checkbox "Cliente Prospect?".
- Campo CNPJ/CPF com lupa que chama `ClienteRepository.consultarCnpj()` e preenche:
  razão social, fantasia, IE, e-mail, telefone, endereço.
- Nome/Razão Social (obrigatório), Apelido/Fantasia, IE/RG.
- Nome do Contato (Comprador), E-mail.
- Nome do Contato (Faturamento), E-mail p/ Envio do Faturamento (NF-e/NFS-e).
- Tel. Comercial (obrigatório), Tel. Celular, Outro Telefone.

### Aba 2 — Endereços
- Lista de cards: logradouro, bairro, cidade/UF, tipo/finalidade.
- Cada card: ícone de localização + ação excluir.
- **Clicar no card abre o modal de edição do endereço.**
- Botão "Adicionar Endereço" no topo direito (abre o mesmo modal, em modo criação).
- Modal Cadastro de Endereço: tipo, CEP (busca ViaCEP mock), logradouro, número,
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

## Menu ⋮

- Incluir pedido, incluir orçamento, incluir tarefa, incluir rota.
- Excluir cliente.
- Atalhos: Ver pedidos, Ver tarefas.
- Abre como **modal** (Radix Dialog). No mobile, pode virar bottom sheet.

## Regras da feature

- A tela é **filha do AppShell** (via `<Outlet />`). Nunca renderiza top bar,
  menu lateral ou drawer próprios.
- `useClienteViewModel` expõe: `clientes`, `loading`, `error`, `filtros`,
  ações (`listar`, `salvar`, `excluir`, `consultarCnpj`).
- `useEnderecoViewModel` expõe: `enderecos`, `loading`, `error`,
  ações (`adicionar`, `editar`, `remover`).
- Formulários via `react-hook-form` + `zod` (schema em `domain/validators/clienteSchema.ts`).
- Submissão via `<form onSubmit={handleSubmit(...)}>` — Enter submete.
- Abas: navegação interna com estado local. **Sem rota por aba.**
- Filtros: query string via `useSearchParams`.
- Modais via Radix Dialog (dialog no desktop, bottom sheet no mobile).
- Sem cor hardcoded. Sem `console.log`. Sem `useState` de domínio.
- Componentes > 50 linhas extraídos. Arquivos > 300 linhas quebrados.
- Acessibilidade: `aria-label` em botões icônicos; foco gerenciado em modais.

## Responsividade

### Lista
- **Mobile (`< 768px`)**: cards empilhados, 1 coluna. FAB no canto inferior direito.
- **Tablet (`768px – 1023px`)**: cards em 2 colunas.eu 
- **Desktop (`>= 1024px`)**: cards em 3 colunas; filtros na lateral esquerda (opcional).

### Editor (5 abas)
- **Mobile (`< 768px`)**: abas scrolláveis no topo; conteúdo empilhado;
  botões de ação em barra fixa no rodapé.
- **Tablet (`768px – 1023px`)**: abas fixas; conteúdo em 2 colunas onde fizer sentido.
- **Desktop (`>= 1024px`)**: abas no topo; formulário em grid com labels à esquerda;
  ações no header.

### Modais (menu ⋮, endereço)
- **Mobile (`< 768px`)**: bottom sheet.
- **Tablet e Desktop (`>= 768px`)**: dialog centralizado.

Sem media query manual — usar classes Tailwind (`md:`, `lg:`).

## Estados obrigatórios

- `loading`: skeleton de cards (lista) e skeleton do form (editor).
- `error`: `VfError` com botão "Tentar novamente".
- `empty`: lista vazia mostra `VfEmpty` com botão "Adicionar Cliente".
- `withData`: renderização normal.

## Testes de aceitação

- Clicar num cliente da lista navega para `/clientes/:id` **sem perder o filtro atual**.
- Clicar no FAB navega para `/clientes/novo`.
- Clicar num card de endereço (Aba 2) abre o **modal** de edição.
- "Adicionar Endereço" (Aba 2) abre o mesmo modal em modo criação.
- Fechar o modal (ESC, overlay, cancelar) **não altera a URL**.
- Filtros aplicados persistem ao voltar da edição (query string).
- Consulta CNPJ preenche razão, fantasia, IE, e-mail, telefone, endereço.
- Layout se adapta aos 3 breakpoints (cards 1/2/3 colunas; abas scrolláveis no mobile).
- Loading, error e empty states renderizam corretamente.
- Enter no formulário de endereço salva o endereço e fecha o modal.
- Enter no formulário de cliente salva o cliente e volta para a lista.