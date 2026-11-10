import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import logger from 'loglevel'
import { ApiRequestError } from '../../../../core/api/apiClient'
import { RelatorioApiRepository } from '../../data/repositories/RelatorioApiRepository'
import type { RelatorioResultado } from '../../domain/entities/RelatorioResultado'
import type { RelatorioRepository } from '../../domain/repositories/RelatorioRepository'

export type RelatorioSyncStatus = 'synced' | 'pending' | 'error'

export interface RelatorioViewModel {
    loading: boolean
    error: string | null
    data: RelatorioResultado | null
    syncStatus: RelatorioSyncStatus | null
    gerarRelatorio: (pergunta: string) => Promise<void>
}

const defaultRepository = new RelatorioApiRepository()

export function useRelatorioViewModel(repository: RelatorioRepository = defaultRepository): RelatorioViewModel {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<RelatorioResultado | null>(null)
    const [syncStatus, setSyncStatus] = useState<RelatorioSyncStatus | null>(null)

    async function gerarRelatorio(pergunta: string): Promise<void> {
        const normalizedQuestion = pergunta.trim()
        setData(null)
        setError(null)

        if (!normalizedQuestion) {
            setLoading(false)
            setError(t('reports.errors.emptyQuestion'))
            setSyncStatus('error')
            return
        }

        setLoading(true)
        setSyncStatus('pending')
        try {
            setData(await repository.gerarRelatorioIA(normalizedQuestion))
            setSyncStatus('synced')
        } catch (requestError: unknown) {
            logger.error('Failed to generate report', requestError)
            setSyncStatus('error')
            setError(requestError instanceof ApiRequestError && requestError.status === 400
                ? t('reports.errors.badRequest')
                : requestError instanceof ApiRequestError && requestError.status === 503
                    ? t('reports.errors.unavailable')
                    : t('reports.errors.generic'))
        } finally {
            setLoading(false)
        }
    }

    return { loading, error, data, syncStatus, gerarRelatorio }
}
