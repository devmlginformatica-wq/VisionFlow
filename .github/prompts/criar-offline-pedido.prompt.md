# Prompt: Criar Repositório Offline-First de Pedido

## Contexto
A infraestrutura offline está 100% pronta e o Cliente já foi migrado com sucesso (OfflineFirstClienteRepository).
Agora precisamos adaptar a feature `pedido` para usar o offline-first, mas SEM alterar as telas (View e ViewModel).

## Objetivo
Criar o `LocalPedidoDatasource` e o `OfflineFirstPedidoRepository`. O `PedidoRepository` atual deve ser mantido como interface.

## Arquivos a criar/alterar
1. `src/features/pedido/data/datasources/LocalPedidoDatasource.ts`
   - Acesso ao Dexie (`db.pedidos`).
   - Métodos: `getAll`, `getById`, `save`, `delete`.

2. `src/features/pedido/data/repositories/OfflineFirstPedidoRepository.ts`
   - Implementa `PedidoRepository`.
   - Recebe via construtor: `ApiPedidoDatasource`, `LocalPedidoDatasource` e `SyncQueueRepository`.
   - **Leitura (`getPedidos`, `getPedidoById`)**: Lê do Dexie primeiro. Se online, dispara fetch em background para atualizar o Dexie.
   - **Escrita (`savePedido`, `deletePedido`)**: 
     - Salva no Dexie com `syncStatus="pending"`.
     - Cria uma `SyncOperation` (entity: 'pedido') e enfileira no `SyncQueueRepository`.
     - Se estiver online, tenta disparar o `SyncEngine.processQueue()`.

3. Ajustes em `src/features/pedido/domain/entities/Pedido.ts`
   - Adicione os campos opcionais `updated_at?: string` e `syncStatus?: SyncStatus` (importe do core/storage/db ou defina localmente).

4. Atualize os "wires" de injeção de dependência do pedido para usar o `OfflineFirstPedidoRepository` (assim como foi feito no `ApiClienteRepository`).

## Restrições
- NÃO altere as telas de Pedido (Pages/Components) e NEM a ViewModel (`usePedidoViewModel`) nesta etapa.
- Use `loglevel`.
- O ID temporário deve ser string no Dexie, mas a UI deve continuar vendo `number | null` (igual foi feito no Cliente).