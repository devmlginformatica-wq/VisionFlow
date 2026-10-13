import type { PedidoTotals as Totals } from '../../../domain/entities/Pedido'
import { pedidoStrings } from '../../pedido.constants'

interface PedidoTotaisProps {
    totals: Totals
}

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const quantity = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 })

const totalFields = [
    { label: pedidoStrings.quantityMix, key: 'mixQuantity', kind: 'number' },
    { label: pedidoStrings.volume, key: 'volumeQuantity', kind: 'number' },
    { label: pedidoStrings.cubicVolume, key: 'totalCubicVolume', kind: 'number' },
    { label: pedidoStrings.netWeight, key: 'netWeight', kind: 'number' },
    { label: pedidoStrings.grossWeight, key: 'grossWeight', kind: 'number' },
    { label: pedidoStrings.grossTotal, key: 'grossTotal', kind: 'currency' },
    { label: pedidoStrings.discountTotal, key: 'discountTotal', kind: 'currency' },
    { label: pedidoStrings.netTotal, key: 'netTotal', kind: 'currency' },
] as const

function formatTotal(value: number, kind: 'number' | 'currency'): string {
    return kind === 'currency' ? currency.format(value) : quantity.format(value)
}

export function PedidoTotais({ totals }: PedidoTotaisProps): React.JSX.Element {
    return (
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {totalFields.map((field) => <div key={field.key} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3"><dt className="text-xs text-[var(--color-muted)]">{field.label}</dt><dd className="mt-1 text-sm font-semibold tabular-nums">{formatTotal(totals[field.key], field.kind)}</dd></div>)}
        </dl>
    )
}