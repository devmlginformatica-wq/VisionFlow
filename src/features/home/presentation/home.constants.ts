import {
    BadgeDollarSign,
    CalendarDays,
    ClipboardList,
    FileClock,
    FileText,
    ShoppingBag,
    Users,
    Wallet,
    type LucideIcon,
} from 'lucide-react'
import { createSearchParams } from 'react-router-dom'

export const homeStrings = {
    eyebrow: 'Visão geral',
    greeting: 'Olá',
    welcomeFallback: 'Equipe comercial',
    welcomeDescription: 'Aqui está o resumo da sua operação.',
    viewDraftOrders: 'Ver pedidos em digitação',
    indicatorsTitle: 'Indicadores',
    salesMonth: 'Suas vendas no mês (R$)',
    salesToday: 'Suas vendas hoje (R$)',
    ordersDraft: 'Pedidos em digitação',
    budgetsDraft: 'Orçamentos em digitação',
    clientsDraft: 'Clientes em digitação',
    ordersApproval: 'Pedidos aguardando aprovação',
    agendasPending: 'Agendas pendentes',
    tasksPending: 'Tarefas pendentes',
    noticesTitle: 'Avisos e novidades',
    openNotices: 'Abrir recados',
    oneUnreadNotice: 'recado não lido',
    manyUnreadNotices: 'recados não lidos',
    allClear: 'Tudo em ordem',
    noNotices: 'Nenhum aviso no momento.',
    loadFailed: 'Não foi possível carregar os indicadores da Home.',
    retry: 'Tentar novamente',
    loading: 'Carregando resumo da operação',
} as const

export interface HomeIndicatorCardData {
    id: string
    label: string
    value: string
    to: string | { pathname: string; search: string }
    icon: LucideIcon
}

export function filteredRoute(pathname: string, filter: string): { pathname: string; search: string } {
    return { pathname, search: createSearchParams({ filtro: filter }).toString() }
}

export const homeIcons = {
    salesMonth: Wallet,
    salesToday: BadgeDollarSign,
    ordersDraft: ShoppingBag,
    budgetsDraft: FileText,
    clientsDraft: Users,
    approval: FileClock,
    agendas: CalendarDays,
    tasks: ClipboardList,
} as const satisfies Record<string, LucideIcon>