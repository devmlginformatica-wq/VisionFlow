import type { Cliente, CnpjLookup } from '../entities/Cliente'
import type { Endereco, EnderecoInput } from '../entities/Endereco'
import type { Titulo } from '../entities/Titulo'

export interface ClienteRepository {
    list(): Promise<Cliente[]>
    getById(id: number): Promise<Cliente | null>
    save(cliente: Cliente): Promise<Cliente>
    delete(id: number): Promise<void>
    lookupTaxId(taxId: string): Promise<CnpjLookup>
    getAddresses(clientId: number | null): Promise<Endereco[]>
    saveAddress(clientId: number | null, address: EnderecoInput): Promise<Endereco>
    deleteAddress(clientId: number | null, addressId: number): Promise<void>
    getContasReceber(clienteId: number): Promise<Titulo[]>
    lookupZipCode(zipCode: string): Promise<Partial<Endereco>>
}