import { useEffect, useState } from 'react'
import logger from 'loglevel'
import { ApiShellRepository } from './data/repositories/ApiShellRepository'
import type { ShellData } from './domain/entities/ShellData'
import { kStr } from './shell.constants'

const shellRepository = new ApiShellRepository()

export interface ShellViewModel {
    company: ShellData['company'] | null
    loggedInUser: ShellData['loggedInUser'] | null
    unreadNotifications: number
    loading: boolean
    error: string | null
}

export function useShellViewModel(): ShellViewModel {
    const [shellData, setShellData] = useState<ShellData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isActive = true

        async function loadShellData(): Promise<void> {
            try {
                const data = await shellRepository.getShellData()
                if (isActive) setShellData(data)
            } catch (loadError: unknown) {
                logger.error(kStr.shellLoadFailed, loadError)
                if (isActive) setError(kStr.shellLoadFailed)
            } finally {
                if (isActive) setLoading(false)
            }
        }

        void loadShellData()
        return () => {
            isActive = false
        }
    }, [])

    return {
        company: shellData?.company ?? null,
        loggedInUser: shellData?.loggedInUser ?? null,
        unreadNotifications: shellData?.unreadNotifications ?? 0,
        loading,
        error,
    }
}