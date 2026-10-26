# Prompt: Criar SyncEngine, SyncTransport e useSyncManager

## Contexto
Temos dois projetos abertos no workspace: o frontend `VisionFlow` e o backend `visionflow-api` (em Go).
O backend possui as rotas, o envelope JSON e a autenticação definidos na pasta `features/` e `internal/`.

## Objetivo
Criar o motor de sincronização no frontend, integrando com a API real do backend que está no workspace.

## Instruções de Leitura Obrigatória
Antes de gerar qualquer código, LEIA atentamente o código do backend em `visionflow-api/`:
1. Veja em `visionflow-api/features/cliente/` e `visionflow-api/features/pedido/` como as rotas (endpoints) estão definidas.
2. Veja em `visionflow-api/internal/httpapi/` (ou similar) como o Envelope JSON é montado e como o Token (JWT) é validado/esperado no Header.
3. Descubra qual é o formato do `updated_at` que o backend devolve.

## Arquivos a criar no Frontend (VisionFlow)
1. `src/features/sync/domain/services/SyncTransport.ts`
   - Interface pura: `get`, `post`, `put`, `delete`.

2. `src/features/sync/domain/services/SyncEngine.ts`
   - Recebe `SyncQueueRepository` e `SyncTransport` via DI.
   - Lógica FIFO e resolução de conflito `newer-wins` (GET antes do PUT).
   - Tratamento de erro: 5xx mantém na fila (attempts++), 4xx remove da fila e marca syncStatus="error".

3. `src/features/sync/data/datasources/ApiSyncDatasource.ts`
   - Implementa `SyncTransport` usando `fetch`.
   - Use a URL do backend que você descobriu (ou `import.meta.env.VITE_API_URL`).
   - Leia o token do localStorage (ou do seu AuthStore) e envie no Header `Authorization`.
   - Respeite o Envelope JSON do backend.

4. `src/features/sync/presentation/hooks/useSyncManager.ts`
   - Instancia o `ApiSyncDatasource` e o `SyncEngine`.
   - Escuta o evento `online` e o `useNetworkStatus`.
   - Dispara `processQueue()`.

## Restrições
- Use `loglevel`.
- Se o backend Go não tiver a rota de GET individual (para o newer-wins), me AVISE antes de inventar.
- Não altere as telas de cliente e pedido ainda.