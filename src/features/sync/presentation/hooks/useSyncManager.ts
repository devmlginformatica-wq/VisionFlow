import logger from 'loglevel'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useNetworkStatus } from '../../../../core/utils/useNetworkStatus'
import { useAuthStore } from '../../../auth/presentation/stores/useAuthStore'
import { sharedSyncEngine } from '../../data/sharedSyncEngine'

export interface SyncManager {
    isSyncing: boolean
    processQueue: () => Promise<void>
}

export function useSyncManager(): SyncManager {
    const { isOnline } = useNetworkStatus()
    const user = useAuthStore((state) => state.user)
    const [isSyncing, setIsSyncing] = useState(false)
    const processingRef = useRef(false)
    const engine = useMemo(() => sharedSyncEngine, [])

    const processQueue = useCallback(async (): Promise<void> => {
        if (!isOnline || !user || processingRef.current) {
            return
        }

        processingRef.current = true
        setIsSyncing(true)

        try {
            await engine.processQueue()
        } catch (error) {
            logger.error('Unable to process the sync queue.', error)
        } finally {
            processingRef.current = false
            setIsSyncing(false)
        }
    }, [engine, isOnline, user])

    useEffect(() => {
        if (isOnline && user) {
            void processQueue()
        }
    }, [isOnline, processQueue, user])

    useEffect(() => {
        const handleOnline = (): void => {
            void processQueue()
        }

        window.addEventListener('online', handleOnline)
        return () => window.removeEventListener('online', handleOnline)
    }, [processQueue])

    return { isSyncing, processQueue }
}
