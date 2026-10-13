import { useMemo } from 'react'
import type { Titulo } from '../../../domain/entities/Titulo'
import { clienteStrings } from '../../cliente.constants'

interface AbaTitulosProps {
    titulos: Titulo[]
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function AbaTitulos({ titulos }: AbaTitulosProps): React.JSX.Element {
    const totals = useMemo(() => titulos.reduce((result, title) => {
        result.open += title.openAmount
        if (new Date(title.dueDate) < new Date()) result.overdue += title.openAmount
        else result.due += title.openAmount
        return result
    }, { due: 0, overdue: 0, open: 0 }), [titulos])

    return (
        <section className="space-y-4">
            <p className="text-xs text-[var(--color-muted)]">{clienteStrings.allTitlesReadOnly}</p>
            {titulos.length === 0 ? <p className="rounded-md bg-[var(--color-canvas)] p-4 text-sm text-[var(--color-muted)]">{clienteStrings.noTitles}</p> : <div className="overflow-x-auto rounded-md border border-[var(--color-border)]"><table className="min-w-[48rem] w-full text-left text-xs"><thead className="bg-[var(--color-canvas)]"><tr>{['Título', 'Parcela', 'Tipo doc.', 'Série', 'Emissão', 'Vencimento', 'Em aberto'].map((label) => <th key={label} className="px-3 py-2 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-[var(--color-border)]">{titulos.map((title) => <tr key={title.id}><td className="px-3 py-2">{title.title}</td><td className="px-3 py-2">{title.installment}</td><td className="px-3 py-2">{title.documentType}</td><td className="px-3 py-2">{title.series}</td><td className="px-3 py-2">{title.issueDate}</td><td className="px-3 py-2">{title.dueDate}</td><td className="px-3 py-2">{currencyFormatter.format(title.openAmount)}</td></tr>)}</tbody></table></div>}
            <div className="grid gap-3 sm:grid-cols-3"><TotalAmount label={clienteStrings.totalDue} value={totals.due} /><TotalAmount label={clienteStrings.totalOverdue} value={totals.overdue} overdue /><TotalAmount label={clienteStrings.totalOpen} value={totals.open} /></div>
        </section>
    )
}

function TotalAmount({ label, value, overdue = false }: { label: string; value: number; overdue?: boolean }): React.JSX.Element {
    return <div className="rounded-md border border-[var(--color-border)] p-3"><p className="text-xs text-[var(--color-muted)]">{label}</p><p className={overdue ? 'mt-1 text-sm font-semibold text-[var(--color-danger)]' : 'mt-1 text-sm font-semibold text-[var(--color-primary)]'}>{currencyFormatter.format(value)}</p></div>
}