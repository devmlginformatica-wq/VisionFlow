import { useState } from 'react'
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
    onNumberChange?: (value: number) => void
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
    onNumberChange,
}: PedidoFieldProps): React.JSX.Element {
    const registeredField = register(
        name,
        numeric && !currency ? { valueAsNumber: true } : undefined,
    )

    const [currencyValue, setCurrencyValue] = useState('')

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
                onChange={handleChange}
                className="h-10 min-w-0 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] read-only:bg-[var(--color-canvas)]"
            />
        </div>
    )
}