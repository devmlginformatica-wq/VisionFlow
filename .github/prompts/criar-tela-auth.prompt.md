---
mode: agent
description: Cria o módulo de autenticação (login)
---

# Criar Tela — Auth (Vision Flow)

**[PAPEL]** Arquiteto Sênior React + UX.
**[CONTEXTO]** Vision Flow. Fase mock. Envelope `{success, data, error}` definido
em copilot-instructions.md. A tela de login fica **FORA do AppShell** — é uma
rota pública, sem top bar nem menu.

**[TAREFA]** Criar login com e-mail e senha.

## Estrutura obrigatória
src/features/auth/
├── domain/
│ ├── entities/Usuario.ts
│ ├── repositories/AuthRepository.ts (interface)
│ └── validators/loginSchema.ts (zod)
├── data/
│ └── repositories/
│ ├── MockAuthRepository.ts
│ └── ApiAuthRepository.ts (stub)
└── presentation/
├── viewmodels/useAuthViewModel.ts
├── pages/LoginPage.tsx
└── components/
├── LoginForm.tsx
└── LoginBranding.tsx (logo + título lateral no desktop)

## Regras

- Formulário: e-mail (validação de formato), senha (obscure + botão mostrar).
- Botão "Entrar" com estado de loading (desabilitado enquanto carrega).
- Mensagem de erro visível abaixo do form quando `error !== null`.
- Mock: `admin@visionflow.app` / `123456` e `vendedor@visionflow.app` / `123456`.
- Ao sucesso: salvar usuário em `useAuthStore` (Zustand) e navegar para a Home
  ou para a rota original (`?redirect=` ou `location.state.from`).
- Sessão persiste em `localStorage` com chave `'visionflow:auth'`.

## Rotas

- `/login` (fora do AppShell).
- Rota autenticada redireciona para `/login` se não houver sessão ativa
  (via `<RequireAuth>` no layout autenticado).

## Mocks

- `src/mocks/auth/login.json` (resposta de sucesso com dados do usuário).

## Responsividade (obrigatório)

- **Mobile (`< 768px`)**: form centralizado, largura total com `px-6`,
  logo no topo, sem painel lateral.
- **Tablet (`768px – 1023px`)**: form centralizado em `max-w-md`, logo no topo.
- **Desktop (`>= 1024px`)**: split em 2 colunas — painel de branding à esquerda
  (60%), form à direita (40%, `max-w-md`).

Sem media query manual — usar classes responsivas do Tailwind (`md:`, `lg:`).

## Estados obrigatórios

- `loading`: botão "Entrar" desabilitado com spinner.
- `error`: mensagem visível abaixo do form (`VfFieldError` ou `VfAlert`).
- `empty`: não aplicável (é form).
- `withData`: redirecionamento (não há tela de sucesso).

## Formulários

- `react-hook-form` + `zod` (schema em `domain/validators/loginSchema.ts`).
- Validação via `zodResolver`.
- Erros exibidos com `VfFieldError`.
- Sem validação manual na View.

## Restrições

- Sem regra de negócio na View. Toda lógica no `useAuthViewModel`.
- Sem cor hardcoded. Sem `console.log`. Sem `useState` de domínio.
- ViewModel não acessa `fetch`, `window` ou `localStorage` diretamente.
- Zustand (`useAuthStore`) apenas para o usuário logado + token.
- Após login, redirecionar via `useNavigate` para a rota original (ou `/`).
- Acessibilidade: `aria-label` no botão de mostrar senha; foco no primeiro
  campo ao montar; `autoComplete` correto (`email`, `current-password`).

## Testes de aceitação

- Login com credenciais válidas redireciona para a Home.
- Login com credenciais inválidas exibe mensagem de erro.
- Sessão persiste após recarregar a página.
- Rota autenticada redireciona para `/login` se não houver sessão.
- Layout se adapta aos 3 breakpoints (split no desktop, coluna no mobile).
- Pressionar Enter no campo de senha dispara o login (comportamento nativo).
- Pressionar Enter durante o loading não dispara duplo submit.

## Submissão do formulário

- O `<form>` usa `onSubmit={handleSubmit(onSubmit)}` do react-hook-form.
- O botão "Entrar" é `type="submit"` (não `type="button"` com `onClick`).
- Pressionar **Enter** em qualquer campo do form dispara o login
  (comportamento nativo de `<form>` + botão `submit`).
- Enquanto `loading === true`, o botão fica `disabled` e o Enter é ignorado
  (evita duplo submit).
- Foco inicial no campo de e-mail ao montar.
- Pressionar Enter no campo de senha **com o form válido** dispara o login;
  com o form inválido, exibe os erros de validação e não submete.

## Formato de saída

Um arquivo por bloco, precedido do caminho. Sem prosa. Se ambíguo, perguntar antes.