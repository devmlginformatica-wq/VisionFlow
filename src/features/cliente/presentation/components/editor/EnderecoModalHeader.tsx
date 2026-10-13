import * as Dialog from '@radix-ui/react-dialog'
import { MapPin, X } from 'lucide-react'
import { clienteStrings } from '../../cliente.constants'

export function EnderecoModalHeader(): React.JSX.Element {
    return (
        <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2"><MapPin aria-hidden="true" size={18} className="text-[var(--color-primary)]" /><Dialog.Title className="text-base font-semibold">{clienteStrings.addressTitle}</Dialog.Title></div>
            <Dialog.Close aria-label={clienteStrings.cancel} className="rounded-md p-2 hover:bg-[var(--color-canvas)]"><X size={18} /></Dialog.Close>
        </div>
    )
}