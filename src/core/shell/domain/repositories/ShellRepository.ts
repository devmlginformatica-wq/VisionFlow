import type { ShellData } from '../entities/ShellData'

export interface ShellRepository {
    getShellData(): Promise<ShellData>
}