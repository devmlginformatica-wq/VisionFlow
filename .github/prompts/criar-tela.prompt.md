---
mode: agent
description: Cria uma tela React do Vision Flow
---

# Criar Tela — Vision Flow

**[PAPEL]** Arquiteto Sênior React + Designer UI/UX.
**[CONTEXTO]** Vision Flow. Feature: `{{nome_feature}}`. Tela: `{{nome_tela}}`.
Breakpoints oficiais em copilot-instructions.md. A tela é **filha do AppShell**
(renderizada via `<Outlet />`) — não inclui top bar, menu lateral ou drawer
próprios, exceto quando explicitamente informado.
**[TAREFA]** Criar a tela **{{nome_tela}}**:

{{especificacao_tela}}

## Estrutura obrigatória
src/features/{{nome_feature}}/presentation/
├── viewmodels/use{{NomeTela}}ViewModel.ts
├── pages/{{NomeTela}}Page.tsx
└── components/ (subcomponentes específicos desta tela)

Se a tela for compartilhada (não pertence a uma feature), usar
`src/core/components/` com prefixo `Vf`.

## Responsividade (obrigatório)

Declarar explicitamente o comportamento em cada breakpoint:

- **Mobile (`< 768px`)**: 1 coluna, FAB, bottom sheet, ações no rodapé.
- **Tablet (`768px – 1023px`)**: 2 colunas, dialog, rail lateral visível.
- **Desktop (`>= 1024px`)**: grid amplo, sidebar, dialog, ações no topo.

Exemplos:
- Grid de cards: 1 / 2 / 4 colunas.
- Tabela: colunas ocultas no mobile, expandidas no desktop.
- Filtros: chips roláveis no mobile, barra horizontal no desktop.

Sem media query manual — usar classes responsivas do Tailwind (`md:`, `lg:`).

## Estados obrigatórios

A tela deve tratar explicitamente:

- `loading`: skeleton ou spinner (usar `VfLoading`).
- `error`: mensagem + botão "Tentar novamente" (usar `VfError`).
- `empty`: mensagem amigável + ação primária (usar `VfEmpty`).
- `withData`: renderização normal.

## Formulários (quando aplicável)

- `react-hook-form` + `zod` (schema em `domain/validators/`).
- Validação via `zodResolver`.
- Erros exibidos com `VfFieldError`.
- Sem validação manual na View.

## Modais e drawers

- Usar Radix (`@radix-ui/react-dialog`, `@radix-ui/react-drawer`).
- No mobile: preferir drawer (bottom sheet).
- No desktop: preferir dialog centralizado.
- Decisão via `useBreakpoint()` ou classes Tailwind.

## Restrições

- View (página) sem regra de negócio. Toda lógica fica no ViewModel (hook).
- ViewModel não acessa `fetch`, `window` ou `localStorage` diretamente.
- ViewModel não conhece componentes React — só expõe dados e ações.
- Componentes > 50 linhas extraídos. Arquivos > 300 linhas quebrados.
- Cores/tipografia via tokens do tema (`useTheme()` + classes Tailwind).
- Sem cor hardcoded. Sem `console.log`. Sem `useState` de domínio.
- Sem `any`. Sem `.then()`.
- Sem `dangerouslySetInnerHTML`.
- Sem reconstruir a moldura (top bar / menu) dentro da tela.
- Strings via i18n (`useTranslation`) ou constantes `kStr`.
- Navegação via React Router v6 (`useNavigate`, `Link`, `useSearchParams`).
- Acessibilidade: `aria-label` em botões icônicos; foco gerenciado em modais
  (Radix resolve por padrão).

## Testes de aceitação

- Loading, error, empty e withData renderizam corretamente.
- Layout se adapta aos 3 breakpoints sem quebrar.
- Formulários validam via zod e exibem erros.
- Navegação funciona via React Router (URL muda, view atualiza).
- Nenhuma chamada direta a `fetch` na View ou ViewModel.

## Formato de saída

Um arquivo por componente/viewmodel, precedido do caminho. Sem prosa.
Se ambíguo, perguntar antes.