import {
    BarChart3,
    Bell,
    CalendarDays,
    CheckSquare,
    FileText,
    Home,
    LogOut,
    MapPin,
    ShoppingCart,
    Users,
    type LucideIcon,
} from 'lucide-react'

export const shellRoutes = {
    home: '/',
    budget: '/app/orcamentos',
    orders: '/app/pedidos',
    clients: '/app/clientes',
    agenda: '/app/agenda',
    tasks: '/app/tarefas',
    taskAlias: '/app/tarefa',
    geolocation: '/app/geolocalizacao',
    dashboard: '/app/dashboard',
    notifications: '/app/notificacoes',
    reports: '/app/relatorios',
    login: '/login',
} as const

export const kStr = {
    appName: 'Vision Flow',
    companyFallback: 'Vision Flow',
    menuOpen: 'Abrir navegação',
    menuClose: 'Fechar navegação',
    collapseMenu: 'Recolher navegação',
    expandMenu: 'Expandir navegação',
    pinMenu: 'Manter navegação expandida',
    theme: 'Tema',
    themeMode: 'Modo',
    primaryColor: 'Cor principal',
    modeLight: 'Claro',
    modeDark: 'Escuro',
    modeSystem: 'Sistema',
    home: 'Início',
    budget: 'Orçamentos',
    orders: 'Pedidos',
    clients: 'Clientes',
    agenda: 'Agenda',
    tasks: 'Tarefas',
    geolocation: 'Geolocalização',
    dashboard: 'Dashboard',
    notifications: 'Notificações',
    reports: 'Relatórios',
    logout: 'Sair',
    userMenu: 'Menu do usuário',
    unreadNotifications: 'notificações não lidas',
    shellLoadFailed: 'Não foi possível carregar os dados da empresa.',
    loginTitle: 'Acesso ao Vision Flow',
    loginDescription: 'Entre para continuar seu trabalho.',
    loginAction: 'Acessar sistema',
    homeDescription: 'Acompanhe sua operação comercial em um só lugar.',
    routeDescription: 'Esta área estará disponível em breve.',
    loading: 'Carregando dados da empresa',
} as const

export interface ShellNavigationItem {
    label: string
    labelKey?: string
    path: string
    icon: LucideIcon
}

export const shellNavigation: readonly ShellNavigationItem[] = [
    { label: kStr.home, path: shellRoutes.home, icon: Home },
    { label: kStr.budget, path: shellRoutes.budget, icon: FileText },
    { label: kStr.orders, path: shellRoutes.orders, icon: ShoppingCart },
    { label: kStr.clients, path: shellRoutes.clients, icon: Users },
    { label: kStr.agenda, path: shellRoutes.agenda, icon: CalendarDays },
    { label: kStr.tasks, path: shellRoutes.tasks, icon: CheckSquare },
    { label: kStr.geolocation, path: shellRoutes.geolocation, icon: MapPin },
    { label: kStr.dashboard, path: shellRoutes.dashboard, icon: BarChart3 },
    { label: kStr.notifications, path: shellRoutes.notifications, icon: Bell },
    { label: kStr.reports, labelKey: 'reports.menu', path: shellRoutes.reports, icon: FileText },
    { label: kStr.logout, path: shellRoutes.login, icon: LogOut },
]