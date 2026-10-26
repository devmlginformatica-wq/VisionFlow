# Prompt: Criar Repositório Offline-First de Cliente

## Contexto
A infraestrutura offline está 100% pronta (Dexie, SyncOperation, SyncQueue, SyncEngine, useSyncManager).
Agora precisamos adaptar a feature `cliente` para usar o offline-first, mas SEM alterar as telas (View e ViewModel).

## Objetivo
Criar o `LocalDatasource` e o `OfflineFirstClienteRepository`. O `ClienteRepository` atual deve ser mantido como interface.

## Arquivos a criar
1. `src/features/cliente/data/datasources/LocalClienteDatasource.ts`
   - Acesso ao Dexie (`db.clientes`).
   - Métodos: `getAll`, `getById`, `save` (faz put/update), `delete`.

2. `src/features/cliente/data/repositories/OfflineFirstClienteRepository.ts`
   - Implementa `ClienteRepository`.
   - Recebe via construtor: `ApiClienteDatasource` (ou stub), `LocalClienteDatasource` e `SyncQueueRepository`.
   - **Leitura (`getClientes`, `getClienteById`)**: Lê do Dexie primeiro. Se online, dispara fetch em background para atualizar o Dexie.
   - **Escrita (`saveCliente`, `deleteCliente`)**: 
     - Salva no Dexie com `syncStatus="pending"`.
     - Cria uma `SyncOperation` e enfileira no `SyncQueueRepository`.
     - Se estiver online, tenta disparar o `SyncEngine.processQueue()`.
   - **Tratamento de ID temporário**: Se for um cliente novo offline, gere um ID temporário (ex: string `temp-${Date.now()}`). Quando o SyncEngine enviar e o backend retornar o ID real, o frontend precisará atualizar o Dexie e a Fila.

## Restrições
- NÃO altere as telas de Cliente (Pages/Components) e NEM a ViewModel (`useClienteViewModel`) nesta etapa. Elas vão continuar chamando a interface `ClienteRepository` como se nada tivesse mudado.
- Use `loglevel`.
- Se precisar alterar a interface `ClienteRepository` para suportar `syncStatus` na entidade, PERGUNTE antes.