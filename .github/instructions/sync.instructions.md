# Feature: sync

Escopo: `src/features/sync/`

## Estrutura
features/sync/
├── domain/
│   ├── entities/
│   │   └── SyncOperation.ts
│   ├── repositories/
│   │   └── SyncQueueRepository.ts   (interface)
│   └── services/
│       └── SyncEngine.ts
├── data/
│   ├── datasources/
│   │   └── SyncQueueLocalDatasource.ts   (Dexie)
│   └── repositories/
│       └── DexieSyncQueueRepository.ts
└── presentation/
    ├── viewmodels/
    │   └── useSyncManager.ts
    └── components/
        └── SyncStatusBadge.tsx

## Regras específicas
- `SyncOperation` é entidade pura. Sem React. Com `fromJson`/`toJson`/`copyWith`/`equals`.
- `action` é union type: `'create' | 'update' | 'delete'`.
- `entity` é union type: `'cliente' | 'pedido'`.
- `SyncEngine` recebe dependências via construtor (DI), não importa repositórios concretos.
- Nenhum `fetch` direto no `SyncEngine`. Ele usa os `ApiDatasource` das features.
- Falha de rede (offline ou 5xx) → `attempts++`, mantém na fila.
- Falha de negócio (4xx) → marca `syncStatus="error"` e remove da fila.
- `useSyncManager` dispara sync em: `online`, mount do app, e manual.