import type { Endereco } from '../../../domain/entities/Endereco'

export type EnderecoFormValues = Omit<Endereco, 'id'> & { id?: number }