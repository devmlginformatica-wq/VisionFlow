import { Check, MessageSquareText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { shellRoutes } from '../../../../core/shell/shell.constants'
import type { HomeNotificationViewData } from '../viewmodels/useHomeViewModel'
import { homeStrings } from '../home.constants'

interface HomeAvisoContentProps {
    notifications: HomeNotificationViewData[]
}

function EmptyNoticeState(): React.JSX.Element {
    return (
        <div className="mt-4 flex items-start gap-3 rounded-md bg-[var(--color-primary-soft)] p-3">
            <Check aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
            <div>
                <p className="text-sm font-semibold">{homeStrings.allClear}</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">{homeStrings.noNotices}</p>
            </div>
        </div>
    )
}

export function HomeAvisoContent({ notifications }: HomeAvisoContentProps): React.JSX.Element {
    if (notifications.length === 0) return <EmptyNoticeState />

    return (
        <>
            <p className="mt-3 text-sm font-medium">
                {notifications.length} {notifications.length === 1 ? homeStrings.oneUnreadNotice : homeStrings.manyUnreadNotices}
            </p>
            <ul className="my-3 divide-y divide-[var(--color-border)]">
                {notifications.slice(0, 2).map((notice) => (
                    <li key={notice.id} className="flex items-start justify-between gap-3 py-2.5">
                        <span className="flex min-w-0 items-start gap-2 text-xs leading-5 text-[var(--color-muted)]">
                            <MessageSquareText aria-hidden="true" size={15} className="mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{notice.title}</span>
                        </span>
                        <time className="shrink-0 text-[11px] text-[var(--color-muted)]">{notice.dateLabel}</time>
                    </li>
                ))}
            </ul>
            <Link to={shellRoutes.notifications} className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]">
                {homeStrings.openNotices}<Check aria-hidden="true" size={15} />
            </Link>
        </>
    )
}