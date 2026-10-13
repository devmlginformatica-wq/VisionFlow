export interface ShellCompany {
    name: string
    taxId: string
    region: string
    contact: string
}

export interface LoggedInUser {
    id: number
    name: string
    email: string
}

export interface ShellData {
    company: ShellCompany
    loggedInUser: LoggedInUser
    unreadNotifications: number
}