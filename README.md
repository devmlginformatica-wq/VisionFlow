# VisionFlow

VisionFlow é uma aplicação web/PWA de força de vendas, construída em React + Vite, focada em operação comercial, gestão de clientes, pedidos e orçamento. O projeto foi pensado para funcionar como front-end de referência para um ERP Delphi existente, com estrutura pronta para trocar dados mockados por integração real sem reescrever a camada visual.

## Visão geral

- Front-end em React 18 + TypeScript
- Stack com Vite, Tailwind CSS, Zustand, React Router e i18next
- Arquitetura em camadas por feature com padrão MVVM + Repository
- Dados mockados por padrão, mas preparados para adaptação a API real
- PWA instalável e offline-first
- Tema dinâmico com troca de cor primária, modo claro/escuro/sistema e CSS variables

## Principais funcionalidades

- Autenticação com login mockado
- Dashboard de boas-vindas, indicadores e avisos
- Gestão de clientes com listagem, filtros e editor em múltiplas abas
- Gestão de pedidos e orçamentos com fluxo de edição em 3 abas
- Agenda, tarefas e notificações
- Shell persistente com top bar, menu lateral e navegação responsiva

## Credenciais de acesso mockadas

Admin:
- E-mail: admin@visionflow.app
- Senha: 123456

Vendedor:
- E-mail: vendedor@visionflow.app
- Senha: 123456

## Stack e arquitetura

### Front-end
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- react-hook-form + zod
- i18next + react-i18next
- Zustand para estado global
- Radix UI para primitivas acessíveis
- Dexie para IndexedDB
- vite-plugin-pwa para suporte PWA
- loglevel para logging em vez de console.log

### Organização do projeto

```text
src/
├── App.tsx
├── core/
│   ├── components/
│   ├── shell/
│   ├── theme/
│   └── api/
├── features/
│   ├── auth/
│   ├── cliente/
│   ├── home/
│   └── pedido/
├── mocks/
├── shared/
└── i18n/
```

Cada feature segue a estrutura:

```text
features/<nome>/
├── domain/
│   ├── entities/
│   ├── repositories/
│   ├── services/
│   └── validators/
├── data/
│   ├── repositories/
│   └── datasources/
└── presentation/
    ├── pages/
    ├── components/
    ├── viewmodels/
    └── stores/
```

## Estrutura de rotas

A aplicação usa rotas protegidas e shell compartilhada.

- /login — tela de autenticação
- / — home
- /app/orcamentos — listagem de orçamentos
- /app/pedidos — listagem de pedidos
- /app/clientes — listagem de clientes
- /app/agenda — agenda
- /app/tarefas — tarefas
- /app/dashboard — dashboard
- /app/notificacoes — notificações

## Requisitos

- Node.js 20+
- npm

## Primeiros passos

1. Instale as dependências:

```bash
npm install
```

2. Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

3. Acesse a aplicação no navegador:

```text
http://localhost:5173
```

## Scripts disponíveis

```bash
npm run dev
npm run build
npm run lint
npm run preview
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:report
```

## Conhecimento de integração

O projeto já está preparado para comunicação com backend real usando:

- Repository Pattern
- Interfaces de domínio
- Implementações mockadas e stubs de API
- Envelope de resposta padronizado

Formato esperado de resposta:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

## Convenções do projeto

- Código em inglês, com textos visíveis em português via i18n ou constantes
- View sem regra de negócio
- ViewModel via hook customizado
- Dados de domínio em entidades puras
- APIs e mocks segregados por feature
- Estado global limitado ao necessário
- Tema gerenciado por provider e CSS variables
- Sem uso direto de fetch em componentes; a regra fica nas camadas de datasource/repository

## PWA e offline

A aplicação foi preparada para uso como PWA com:

- manifest e service worker
- cache offline com IndexedDB usando Dexie
- suporte à instalação em dispositivos desktop/mobile

## Observações

- A aplicação atual está com dados mockados e interface pronta para evolução
- O backend real ainda não é obrigatório no fluxo atual do projeto
- Toda a camada de apresentação foi construída para permitir troca por API sem reescrever os componentes

## Licença

Este projeto é de uso interno e de demonstração funcional da estrutura do VisionFlow.
