import logger from 'loglevel'

import { db, type SyncQueueRecord } from '../../../../core/storage/db'
import { SyncOperation } from '../../domain/entities/SyncOperation'

export class SyncQueueLocalDatasource {
    async enqueue(operation: SyncOperation): Promise<SyncOperation> {
        const record: SyncQueueRecord = {
            id: operation.id,
            entity: operation.entity,
            entityId: operation.entityId,
            action: operation.action,
            payload: operation.payload,
            createdAt: operation.createdAt,
            attempts: operation.attempts,
            lastError: operation.lastError,
        }

        await db.sync_queue.put(record)

        return operation
    }

    async getPending(): Promise<SyncOperation[]> {
        const records: SyncQueueRecord[] = await db.sync_queue.orderBy('createdAt').toArray()

        return records.map((record: SyncQueueRecord) => SyncOperation.fromJson(record))
    }

    async remove(id: string): Promise<void> {
        await db.sync_queue.delete(id)
    }

    async remapEntityId(entity: 'cliente' | 'pedido', oldId: number | string, newId: number | string): Promise<void> {
        if (oldId === newId) {
            return
        }

        await db.transaction('rw', db.clientes, db.pedidos, db.sync_queue, async () => {
            if (entity === 'cliente') {
                const client = await db.clientes.get(oldId)
                if (!client) {
                    throw new Error(`Local cliente not found when remapping id: ${oldId}`)
                }

                const data = client.data
                    ? {
                        ...client.data,
                        id: typeof newId === 'number' ? newId : null,
                        syncStatus: 'pending' as const,
                    }
                    : undefined
                await db.clientes.delete(oldId)
                await db.clientes.put({ ...client, id: newId, data })
            } else {
                const pedido = await db.pedidos.get(oldId)
                if (pedido) {
                    await db.pedidos.delete(oldId)
                    await db.pedidos.put({ ...pedido, id: newId })
                }
            }

            const queuedOperations = await db.sync_queue.where('entity').equals(entity).toArray()
            for (const operation of queuedOperations) {
                if (operation.entityId !== oldId) {
                    continue
                }

                const payload = typeof operation.payload === 'object' && operation.payload !== null
                    && !Array.isArray(operation.payload)
                    ? { ...operation.payload, id: newId }
                    : operation.payload
                await db.sync_queue.update(operation.id, { entityId: newId, payload })
            }
        })
    }

    async updateAttempts(id: string, attempts: number, lastError: string | null = null): Promise<void> {
        const existing = await db.sync_queue.get(id)

        if (!existing) {
            logger.warn(`Sync queue record not found for update: ${id}`)
            return
        }

        await db.sync_queue.update(id, {
            attempts,
            lastError,
        })
    }

    async markEntityError(entity: 'cliente' | 'pedido', entityId: number | string): Promise<void> {
        if (
            (typeof entityId === 'number' && (!Number.isSafeInteger(entityId) || entityId <= 0)) ||
            (typeof entityId === 'string' && entityId.trim().length === 0)
        ) {
            logger.warn(`Cannot mark ${entity} sync status for invalid id: ${entityId}`)
            return
        }

        const updated = entity === 'cliente'
            ? await db.clientes.update(entityId, { syncStatus: 'error' })
            : await db.pedidos.update(entityId, { syncStatus: 'error' })

        if (updated === 0) {
            logger.warn(`Local ${entity} not found when marking sync error: ${entityId}`)
        }
    }

    async markEntitySynced(entity: 'cliente' | 'pedido', entityId: number | string): Promise<void> {
        if (
            (typeof entityId === 'number' && (!Number.isSafeInteger(entityId) || entityId <= 0)) ||
            (typeof entityId === 'string' && entityId.trim().length === 0)
        ) {
            logger.warn(`Cannot mark ${entity} sync status for invalid id: ${entityId}`)
            return
        }

        const updated = entity === 'cliente'
            ? await db.clientes.update(entityId, { syncStatus: 'synced' })
            : await db.pedidos.update(entityId, { syncStatus: 'synced' })

        if (updated === 0) {
            logger.warn(`Local ${entity} not found when marking sync success: ${entityId}`)
        }
    }
}
