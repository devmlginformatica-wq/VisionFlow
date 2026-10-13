import { useState } from 'react'
import { Check, Copy, MapPin } from 'lucide-react'
import { clienteStrings } from '../../cliente.constants'

interface ClienteCardIdentityProps {
    taxId: string
    addressSummary: string
    clientId: number | null
}

export function ClienteCardIdentity({ taxId, addressSummary, clientId }: ClienteCardIdentityProps): React.JSX.Element {
    const [copied, setCopied] = useState(false)

    async function copyTaxId(): Promise<void> {
        try {
            await navigator.clipboard.writeText(taxId)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1500)
        } catch {
            setCopied(false)
        }
    }

    return (
        <>
            <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="truncate">{taxId}</span>
                <button type="button" aria-label={clienteStrings.copyTaxId} onClick={() => void copyTaxId()} className="flex size-8 shrink-0 items-center justify-center rounded-md text-[var(--color-muted)] hover:bg-[var(--color-canvas)]">
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>
                <span className="ml-auto shrink-0 text-xs text-[var(--color-muted)]">#{clientId}</span>
            </div>
            <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-[var(--color-muted)]"><MapPin aria-hidden="true" size={15} className="mt-0.5 shrink-0" />{addressSummary}</p>
        </>
    )
}