---
mode: agent
description: Cria uma nova feature completa do Vision Flow
---

# Criar Feature — Vision Flow

**[PAPEL]** Arquiteto Sênior React + Clean Architecture.
**[CONTEXTO]** Vision Flow. Fase mock. ERP Delphi. Envelope {success,data,error}.
Breakpoints oficiais em copilot-instructions.md.
**[TAREFA]** Criar a feature **{{nome_feature}}**: {{descricao_feature}}

## Estrutura obrigatória
src/features/{{nome_feature}}/
├── domain/
│ ├── entities/{{Nome}}.ts
│ ├── repositories/{{Nome}}Repository.ts (interface)
│ ├── services/ (regras puras, se houver)
│ └── validators/ (schemas zod, se houver form)
├── data/
│ ├── repositories/Mock{{Nome}}Repository.ts
│ └── repositories/Api{{Nome}}Repository.ts (stub com fetch)
└── presentation/
├── viewmodels/use{{Nome}}ViewModel.ts
├── pages/{{Nome}}Page.tsx
└── components/ (subcomponentes da feature)

## Regras

- `domain/entities`: entidades puras com `fromJson`, `toJson`, `copyWith`, `equals`. Sem React.
- `domain/repositories`: interface abstrata (contrato).
- `domain/services`: funções puras de regra de negócio (ex: cálculo de totais).
- `domain/validators`: schemas zod por formulário da feature.
- `data/repositories`: `Mock{{Nome}}Repository` (lê JSON de `src/mocks/`) + `Api{{Nome}}Repository` (stub com fetch nativo).
- `presentation/viewmodels`: hook `use{{Nome}}ViewModel` expõe `loading`, `error`, dados e ações.
- `presentation/pages`: componente de página. Sem regra de negócio.
- `presentation/components`: subcomponentes da feature. Componentes > 50 linhas extraídos.

## Registros obrigatórios

- Rota em `src/core/router/AppRouter.tsx` (dentro do layout autenticado, exceto se `{{nome_feature}}` for `auth`).
- Injeção em `src/core/di/container.ts` (instancia o Repository — Mock ou Api conforme flag de fase).
- Mock JSON em `src/mocks/{{nome_feature}}/` quando houver dados.

## Formulários (quando aplicável)

- `react-hook-form` + `zod` (schema em `domain/validators/`).
- Validação via `zodResolver`.
- Erros exibidos com componente `VfFieldError`.
- Sem validação manual na View.

## Responsividade (obrigatório)

Toda feature declara explicitamente o que muda nos 3 breakpoints:
- Mobile (`< 768px`): 1 coluna, FAB, bottom sheet.
- Tablet (`768px – 1023px`): 2 colunas, dialog.
- Desktop (`>= 1024px`): grid amplo, sidebar, dialog.

Breakpoints oficiais definidos em `copilot-instructions.md`.

## Restrições

- Sem cor hardcoded. Sem console.log. Sem useState de domínio.
- Sem `any`. Tipagem estrita.
- Sem `.then()` — sempre `async/await`.
- Sem `dangerouslySetInnerHTML`.
- Sem media query manual — usar classes Tailwind.
- View (página) não acessa Repository diretamente — só o ViewModel.
- ViewModel não acessa `window`, `localStorage` ou `fetch` — só o Repository.
- Repository (Mock) lê JSON; Repository (Api) usa fetch. Nenhum dos dois vaza para a View.
- Componentes > 50 linhas extraídos. Arquivos > 300 linhas quebrados.
- A feature filha do AppShell renderiza apenas o conteúdo (usa `<Outlet />` do shell).

## Testes de aceitação

- Feature registrada na rota correta.
- ViewModel carrega dados do Mock sem erro.
- Alternar Mock ↔ Api no `container.ts` não quebra a View.
- Loading, error e empty states renderizam corretamente.
- Layout responsivo se adapta aos 3 breakpoints.

## Formato de saída

Cada arquivo em bloco separado, precedido do caminho relativo.
Sem prosa final. Se ambíguo, perguntar antes.