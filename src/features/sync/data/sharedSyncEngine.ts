import { ApiSyncDatasource } from './datasources/ApiSyncDatasource'
import { DexieSyncQueueRepository } from './repositories/DexieSyncQueueRepository'
import { SyncEngine } from '../domain/services/SyncEngine'

export const sharedSyncEngine = new SyncEngine(
    new DexieSyncQueueRepository(),
    new ApiSyncDatasource(),
)
