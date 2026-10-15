import { useEffect, useState } from 'react'
import type { UseFormRegister, UseFormSetValue } from 'react-hook-form'
import type { PedidoFormValues } from '../../../domain/validators/pedidoSchema'

interface PedidoFieldProps {
    name: keyof PedidoFormValues
    label: string
    register: UseFormRegister<PedidoFormValues>
    setValue?: UseFormSetValue<PedidoFormValues>
    type?: string
    readOnly?: boolean
    numeric?: boolean
    currency?: boolean
    currencyAmount?: number
    onNumberChange?: (value: number) => void
}

function parseCurrencyValue(value: unknown): number {
    if (typeof value === 'number') return value
    if (typeof value !== 'string' || value === '' || value === ',') return 0
    return Number(value.replace(',', '.'))
}

export function PedidoField({
    name,
    label,
    register,
    setValue,
    type = 'text',
    readOnly = false,
    numeric = false,
    currency = false,
    currencyAmount,
    onNumberChange,
}: PedidoFieldProps): React.JSX.Element {
    const registeredField = register(
        name,
        currency
            ? { setValueAs: parseCurrencyValue }
            : numeric
              ? { valueAsNumber: true }
              : undefined,
    )

    const [currencyValue, setCurrencyValue] = useState('')
    const [isEditingCurrency, setIsEditingCurrency] = useState(false)

    useEffect(() => {
        if (!currency || isEditingCurrency) return
        setCurrencyValue(
            currencyAmount
                ? new Intl.NumberFormat('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  }).format(currencyAmount)
                : '',
        )
    }, [currency, currencyAmount, isEditingCurrency])

    function handleCurrencyChange(
        event: React.ChangeEvent<HTMLInputElement>,
    ): void {
        let value = event.currentTarget.value

        // Permite apenas números e vírgula
        value = value.replace(/[^\d,]/g, '')

        // Permite apenas uma vírgula
        const commaIndex = value.indexOf(',')

        if (commaIndex !== -1) {
            value =
                value.slice(0, commaIndex + 1) +
                value.slice(commaIndex + 1).replace(/,/g, '')

            // Máximo de 2 casas decimais
            const decimalPart = value.slice(commaIndex + 1)

            if (decimalPart.length > 2) {
                value =
                    value.slice(0, commaIndex + 1) +
                    decimalPart.slice(0, 2)
            }
        }

        setCurrencyValue(value)

        if (setValue) {
            const numericValue =
                value === '' || value === ','
                    ? 0
                    : Number(value.replace(',', '.'))

            setValue(name, numericValue as never, {
                shouldDirty: true,
                shouldValidate: true,
            })

            onNumberChange?.(numericValue)
        }
    }

    function handleChange(
        event: React.ChangeEvent<HTMLInputElement>,
    ): void {
        if (currency) {
            handleCurrencyChange(event)
            return
        }

        void registeredField.onChange(event)

        if (numeric) {
            onNumberChange?.(Number(event.currentTarget.value))
        }
    }

    function handleBlur(event: React.FocusEvent<HTMLInputElement>): void {
        void registeredField.onBlur(event)
        if (currency) setIsEditingCurrency(false)
    }

    return (
        <div className="grid gap-1.5 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
            <label
                htmlFor={`pedido-${name}`}
                className="text-sm font-medium"
            >
                {label}
            </label>

            <input
                {...registeredField}
                id={`pedido-${name}`}
                type={currency ? 'text' : type}
                inputMode={currency ? 'decimal' : undefined}
                value={currency ? currencyValue : undefined}
                readOnly={readOnly}
                onFocus={currency ? () => setIsEditingCurrency(true) : undefined}
                onChange={handleChange}
                onBlur={handleBlur}
                className="h-10 min-w-0 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] read-only:bg-[var(--color-canvas)]"
            />
        </div>
    )
}