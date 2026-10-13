import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Usuario } from '../../domain/entities/Usuario'

interface AuthState {
    user: Usuario | null
    setSession: (user: Usuario) => void
    clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setSession: (user) => set({ user }),
            clearSession: () => set({ user: null }),
        }),
        {
            name: 'visionflow:auth',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ user: state.user }),
        },
    ),
)