import { z } from 'zod'

export const enderecoSchema = z.object({
    id: z.number().optional(),
    type: z.string().min(1, 'Selecione o tipo do endereço.'),
    purpose: z.string().min(1, 'Selecione a finalidade.'),
    zipCode: z.string().min(1, 'Informe o CEP.'),
    street: z.string().min(1, 'Informe o logradouro.'),
    number: z.string().min(1, 'Informe o número.'),
    complement: z.string(),
    district: z.string().min(1, 'Informe o bairro.'),
    city: z.string().min(1, 'Informe a cidade.'),
    state: z.string().min(2, 'Informe a UF.'),
    reference: z.string(),
    deliveryRestrictions: z.string(),
})