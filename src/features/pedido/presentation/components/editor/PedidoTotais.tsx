import type { PedidoTotals as Totals } from '../../../domain/entities/Pedido'
import { pedidoStrings } from '../../pedido.constants'

interface PedidoTotaisProps {
    totals: Totals
}

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const quantity = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 })

const totalFields = [
    { label: pedidoStrings.quantityMix, key: 'mixQuantity', testId: 'mix-quantity', kind: 'number' },
    { label: pedidoStrings.volume, key: 'volumeQuantity', testId: 'volume-quantity', kind: 'number' },
    { label: pedidoStrings.cubicVolume, key: 'totalCubicVolume', testId: 'cubic-volume', kind: 'number' },
    { label: pedidoStrings.netWeight, key: 'netWeight', testId: 'net-weight', kind: 'number' },
    { label: pedidoStrings.grossWeight, key: 'grossWeight', testId: 'gross-weight', kind: 'number' },
    { label: pedidoStrings.grossTotal, key: 'grossTotal', testId: 'gross-total', kind: 'currency' },
    { label: pedidoStrings.discountTotal, key: 'discountTotal', testId: 'discount-total', kind: 'currency' },
    { label: pedidoStrings.netTotal, key: 'netTotal', testId: 'net-total', kind: 'currency' },
] as const

function formatTotal(value: number, kind: 'number' | 'currency'): string {
    return kind === 'currency' ? currency.format(value) : quantity.format(value)
}

export function PedidoTotais({ totals }: PedidoTotaisProps): React.JSX.Element {
    return (
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {totalFields.map((field) => <div key={field.key} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3"><dt className="text-xs text-[var(--color-muted)]">{field.label}</dt><dd data-testid={`pedido-total-${field.testId}`} className="mt-1 text-sm font-semibold tabular-nums">{formatTotal(totals[field.key], field.kind)}</dd></div>)}
        </dl>
    )
}