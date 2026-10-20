import { SearchableSelect } from '../../../../../core/components/SearchableSelect'
import type { SearchableSelectOption } from '../../../../../core/components/SearchableSelect'

interface PedidoSelectFieldProps {
    id: string
    label: string
    value: string
    onChange: (value: string) => void
    options: readonly SearchableSelectOption[]
    disabled?: boolean
    error?: string
}

export function PedidoSelectField({
    id,
    label,
    value,
    onChange,
    options,
    disabled = false,
    error,
}: PedidoSelectFieldProps): React.JSX.Element {
    return (
        <div className="grid gap-1.5 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
            <label
                htmlFor={id}
                className="text-sm font-medium"
            >
                {label}
            </label>

            <div className="min-w-0">
                <SearchableSelect
                    id={id}
                    value={value}
                    onValueChange={onChange}
                    options={options}
                    placeholder="Selecione"
                    searchPlaceholder={`Buscar ${label.toLocaleLowerCase('pt-BR')}...`}
                    disabled={disabled}
                    error={error}
                />
                {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>}
            </div>
        </div>
    )
}