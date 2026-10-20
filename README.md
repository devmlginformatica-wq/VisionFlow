# VisionFlow

VisionFlow é uma aplicação web/PWA de força de vendas, construída em React + Vite, focada em operação comercial, gestão de clientes, pedidos e orçamento. O front-end integra os fluxos disponíveis à API VisionFlow, mantendo a camada Repository para separar o contrato HTTP da apresentação.

## Visão geral

- Front-end em React 18 + TypeScript
- Stack com Vite, Tailwind CSS, Zustand, React Router e i18next
- Arquitetura em camadas por feature com padrão MVVM + Repository
- Integração HTTP com a API para autenticação, shell, indicadores, clientes,
  endereços, pedidos e catálogos
- PWA instalável e offline-first
- Tema dinâmico com troca de cor primária, modo claro/escuro/sistema e CSS variables

## Principais funcionalidades

- Autenticação com login mockado
- Dashboard de boas-vindas, indicadores e avisos
- Gestão de clientes com listagem, filtros e editor em múltiplas abas
- Gestão de pedidos e orçamentos com fluxo de edição em 3 abas
- Agenda, tarefas e notificações
- Shell persistente com top bar, menu lateral e navegação responsiva

## Credenciais de demonstração

As credenciais abaixo pertencem aos dados de demonstração locais e não são
credenciais garantidas para a API conectada. Para autenticação real, use uma
conta provisionada no backend.

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

### Preparar e executar os testes E2E com a API local

Os testes Playwright iniciam automaticamente o Vite (`localhost:5173`) e a API Go
(`localhost:8080`). Antes da primeira execução, prepare o PostgreSQL nativo local
(não é necessário Docker) e configure `visionflow-api/.env` e
`visionflow-api/db/flyway.conf`. A partir da raiz do workspace:

```bash
./visionflow-api/dev-up.sh
cd VisionFlow
npm run test:e2e
```

O script aplica as migrations pendentes e os seeds idempotentes do Demo Comercial;
ele não apaga nem recria o banco. O Playwright inicia os servidores durante a
execução dos testes e, fora do CI, reutiliza servidores já disponíveis nas portas
configuradas.

## Conhecimento de integração

O projeto usa a API configurada para os fluxos disponíveis, por meio de:

- Repository Pattern
- Interfaces de domínio
- Repositórios HTTP baseados em `fetch`
- Envelope de resposta padronizado

No desenvolvimento, o proxy do Vite encaminha as rotas documentadas para o
backend. Configure `VITE_API_PROXY_TARGET` no ambiente local. Em produção,
configure `VITE_API_BASE_URL`.

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

- Dados locais em `src/mocks/` continuam disponíveis como fixtures e para
  repositórios de desenvolvimento; as telas ativas utilizam os repositórios HTTP.
- A agenda e as tarefas ainda não possuem telas integradas no shell.
- Campos de padrões do cadastro de cliente dependem de suporte de persistência
  no contrato da API; os catálogos são carregados pelas rotas documentadas.

## Licença

Este projeto é de uso interno e de demonstração funcional da estrutura do VisionFlow.
