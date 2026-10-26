# Prompt: Criar Infraestrutura Dexie e Fila de Sync

## Contexto
A detecção de rede já está pronta. Agora precisamos criar o banco de dados local (Dexie) para armazenar os dados offline e a fila de sincronização (SyncQueue).

## Objetivo
Criar a fundação do banco offline-first, sem tocar nas telas de cliente ou pedido ainda.

## Arquivos a criar
1. `src/core/storage/db.ts` 
   - Instância do Dexie.
   - Tabelas: `clientes`, `pedidos`, `sync_queue`.
   - Definir os tipos básicos para essas tabelas (ex: `StoredCliente`, `StoredPedido`), garantindo que tenham `id`, `updated_at` e `syncStatus`.

2. `src/features/sync/domain/entities/SyncOperation.ts`
   - Entidade pura.
   - Campos: `id`, `entity` ('cliente' | 'pedido'), `entityId`, `action` ('create' | 'update' | 'delete'), `payload` (any), `createdAt`, `attempts`, `lastError` (string | null).
   - Implementar `fromJson`, `toJson`, `copyWith`, `equals`.

3. `src/features/sync/domain/repositories/SyncQueueRepository.ts`
   - Interface com os métodos: `enqueue`, `getPending`, `remove`, `updateAttempts`.

4. `src/features/sync/data/datasources/SyncQueueLocalDatasource.ts`
   - Implementação do acesso ao Dexie (tabela `sync_queue`).

5. `src/features/sync/data/repositories/DexieSyncQueueRepository.ts`
   - Implementação da interface usando o Datasource.

## Restrições
- Use `loglevel` (nunca console.log).
- Use `async/await`.
- Respeite o limite de 50 linhas por componente/arquivo se possível.
- Se precisar alterar algo fora destes arquivos, PERGUNTE antes.