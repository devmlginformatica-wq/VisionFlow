export interface Titulo {
    id: number
    title: string
    installment: string
    documentType: string
    series: string
    issueDate: string
    dueDate: string
    openAmount: number
    situacao: 'aberto' | 'vencido' | 'pago'
}