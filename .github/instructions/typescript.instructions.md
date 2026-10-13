---
applyTo: "**/*.{ts,tsx}"
---

# Regras específicas — arquivos TypeScript / TSX

## Tipagem
- Sempre declare tipo de retorno em funções públicas.
- Prefira const a let. Nunca var.
- Use `type` para tipos, `interface` para contratos de objeto.
- Sem `any` sem necessidade real. Prefira `unknown` + narrowing.
- Props tipadas com interface nomeada (ex: `ThemeSelectorButtonProps`).
- Nunca usar `as` para "forçar" tipo sem justificativa.
- Tipos de domínio em `domain/entities/`, não em `presentation/`.

## Imports e exports
- Ordene imports: (1) libs externas, (2) alias internos (`@/`), (3) relativos.
- Evite `export default` — prefira `export` nomeado (exceto páginas lazy).
- Re-exports em `index.ts` quando fizer sentido (barrel files).

## Assincronismo
- `async/await`, nunca `.then()`.
- Tratamento de erro com try/catch ou `.catch` em chamadas críticas.
- Não engolir erro silenciosamente — logar via logger e propagar.

## React
- Componentes funcionais puros.
- `useEffect` com cleanup correto quando necessário.
- Memoização (`useMemo`, `useCallback`, `React.memo`) só quando medido.
- Key obrigatória em itens de listas (`.map`).
- Nunca usar `dangerouslySetInnerHTML`.
- Estado de domínio via ViewModel (hook) ou Zustand — nunca `useState` solto.

## ViewModel (hook)
- Expõe `boolean loading` e `string | null error`.
- Expõe dados já prontos para a View (sem transformação na View).
- Ações retornam `Promise<void>` — sem lógica de UI no ViewModel.
- Nunca acessa `window`, `document` ou `localStorage` diretamente — usar services.

## Formulários
- Sempre `react-hook-form` + `zod` (schemas em `domain/validators/`).
- Validação via `zodResolver`. Sem validação manual na View.
- Erros do formulário exibidos com componente `VfFieldError`.

## Estilo (Tailwind)
- Sem classes dinâmicas concatenadas. Use `clsx` ou `cva` quando variar.
- Sem `style={{}}` inline — exceto CSS variables dinâmicas (tema).
- Sem media query manual — usar classes responsivas do Tailwind
  (breakpoints oficiais em copilot-instructions.md).
- Nunca `className` com template string sem `clsx`/`cva`.

## Acessibilidade
- Componentes interativos com `aria-*` quando necessário.
- Modais/drawers/popovers via Radix primitives.
- Foco gerenciado corretamente (Radix resolve por padrão).

## Logging e erros
- Sem `console.log`. Usar `logger` (loglevel).
- Nunca `throw` de string — sempre instância de `AppException` (ou subtipo).
- Nunca expor stack trace para o usuário.

## Organização
- Comentários em português. Nomes de código em inglês.
- Arquivo > 300 linhas → quebrar em módulos.
- Componente > 50 linhas → extrair para arquivo próprio.