import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

interface RequireAuthProps {
    children: React.ReactNode
}

export function RequireAuth({ children }: RequireAuthProps): React.JSX.Element {
    const user = useAuthStore((state) => state.user)
    const location = useLocation()

    if (!user) return <Navigate to="/login" replace state={{ from: location }} />
    return <>{children}</>
}