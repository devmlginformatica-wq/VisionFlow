import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Endereco, EnderecoInput } from '../../../domain/entities/Endereco'
import type { EnderecoViewModel } from '../../viewmodels/useEnderecoViewModel'
import { clienteStrings } from '../../cliente.constants'
import { VfError } from '../../../../../core/components/VfError'
import { EnderecoCard } from './EnderecoCard'
import { EnderecoModal } from './EnderecoModal'
import { VfSkeleton } from '../../../../../core/components/VfSkeleton'

interface AbaEnderecosProps {
    viewModel: EnderecoViewModel
}

export function AbaEnderecos({ viewModel }: AbaEnderecosProps): React.JSX.Element {
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState<Endereco | null>(null)

    function openCreate(): void {
        setSelectedAddress(null)
        setModalOpen(true)
    }

    function openEdit(address: Endereco): void {
        setSelectedAddress(address)
        setModalOpen(true)
    }

    async function saveAddress(address: EnderecoInput): Promise<void> {
        if (selectedAddress) await viewModel.editar({ ...address, id: selectedAddress.id })
        else await viewModel.adicionar(address)
    }

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-base font-semibold">{clienteStrings.addresses}</h2><p className="mt-1 text-xs text-[var(--color-muted)]">As alterações serão aplicadas ao salvar o cliente.</p></div><button type="button" onClick={openCreate} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-foreground)]"><Plus size={17} />{clienteStrings.addAddress}</button></div>
            {viewModel.error ? <VfError message={viewModel.error} retryLabel={clienteStrings.tryAgain} onRetry={() => void viewModel.listar()} /> : viewModel.loading ? <div className="space-y-3"><VfSkeleton className="h-20 w-full" /><VfSkeleton className="h-20 w-full" /></div> : viewModel.enderecos.length === 0 ? <p className="rounded-md bg-[var(--color-canvas)] p-4 text-sm text-[var(--color-muted)]">{clienteStrings.noAddresses}</p> : <div className="grid gap-3 md:grid-cols-2">{viewModel.enderecos.map((address) => <EnderecoCard key={address.id} address={address} onEdit={() => openEdit(address)} onDelete={() => void viewModel.remover(address.id)} />)}</div>}
            <EnderecoModal open={modalOpen} address={selectedAddress} onOpenChange={setModalOpen} onSave={saveAddress} onLookupZipCode={viewModel.consultarCep} />
        </section>
    )
}