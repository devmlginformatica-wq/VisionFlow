import { AlertCircle, Clock3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { SyncStatus } from '../storage/db'

interface SyncStatusBadgeProps {
    syncStatus: SyncStatus | undefined
    syncError?: string | null
}

export function SyncStatusBadge({ syncStatus, syncError }: SyncStatusBadgeProps): React.JSX.Element | null {
    const { t } = useTranslation()

    if (syncStatus === undefined || syncStatus === 'synced') return null

    const isPending = syncStatus === 'pending'
    const Icon = isPending ? Clock3 : AlertCircle
    const statusColor = isPending
        ? 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]'
        : 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]'

    return (
        <span
            role="status"
            aria-live="polite"
            aria-label={!isPending && syncError ? `${t('sync.error')}: ${syncError}` : undefined}
            className={`inline-flex max-w-full items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${statusColor}`}
        >
            <Icon aria-hidden="true" size={14} />
            {t(isPending ? 'sync.pending' : 'sync.error')}
            {!isPending && syncError && <span className="font-normal normal-case">{syncError}</span>}
        </span>
    )
}
