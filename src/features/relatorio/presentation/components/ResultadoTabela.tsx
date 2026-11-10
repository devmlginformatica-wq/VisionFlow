import { useTranslation } from 'react-i18next'
import type { RelatorioResultado } from '../../domain/entities/RelatorioResultado'

interface ResultadoTabelaProps {
    result: RelatorioResultado
}

export function ResultadoTabela({ result }: ResultadoTabelaProps): React.JSX.Element {
    const { t } = useTranslation()

    return (
        <section className="space-y-3" aria-labelledby="report-table-title">
            <h2 id="report-table-title" className="text-lg font-semibold text-[var(--color-foreground)]">{t('reports.table.title')}</h2>
            {result.linhas.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">{t('reports.table.empty')}</p>
            ) : (
                <div className="overflow-x-auto rounded-md border border-[var(--color-border)]">
                    <table className="min-w-full divide-y divide-[var(--color-border)] text-left text-sm">
                        <thead className="bg-[var(--color-canvas)]"><tr>{result.colunas.map((column, index) => <th key={`${column}-${index}`} scope="col" className="px-4 py-3 font-semibold text-[var(--color-foreground)]">{column || t('reports.table.columns', { index: index + 1 })}</th>)}</tr></thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {result.linhas.map((row, rowIndex) => <tr key={rowIndex} className="text-[var(--color-foreground)]">{result.colunas.map((column, columnIndex) => <td key={`${column}-${columnIndex}`} className="whitespace-nowrap px-4 py-3">{row[columnIndex] === null || row[columnIndex] === undefined ? t('reports.table.emptyCell') : String(row[columnIndex])}</td>)}</tr>)}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}
