import type { Aviso } from '../entities/Aviso'
import type { Indicador } from '../entities/Indicador'

export interface HomeRepository {
    getIndicadores(): Promise<Indicador>
    getAvisos(): Promise<Aviso[]>
}