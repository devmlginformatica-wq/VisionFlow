import { useTranslation } from 'react-i18next'
import { useNetworkStatus } from '../utils/useNetworkStatus'

export function NetworkBadge(): React.JSX.Element {
    const { isOnline } = useNetworkStatus()
    const { t } = useTranslation()
    const label = isOnline ? t('network.online') : t('network.offline')
    const statusColors = isOnline
        ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
        : 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
    const indicatorColor = isOnline
        ? 'bg-[var(--color-primary)]'
        : 'bg-[var(--color-danger)]'

    return (
        <span role="status" aria-live="polite" className={`inline-flex h-8 items-center gap-2 rounded-full px-3 text-xs font-medium ${statusColors}`}>
            <span aria-hidden="true" className={`size-2 rounded-full ${indicatorColor}`} />
            {label}
        </span>
    )
}
