import { LoginBranding } from '../components/LoginBranding'
import { LoginForm } from '../components/LoginForm'
import { useAuthViewModel } from '../viewmodels/useAuthViewModel'

export function LoginPage(): React.JSX.Element {
    const { loading, error, submitLogin } = useAuthViewModel()

    return (
        <main className="grid min-h-screen bg-[var(--color-canvas)] text-[var(--color-foreground)] lg:grid-cols-[3fr_2fr]">
            <LoginBranding />
            <div className="flex min-h-screen items-center justify-center px-6 py-10 md:px-10 lg:px-12">
                <LoginForm loading={loading} error={error} onSubmit={submitLogin} />
            </div>
        </main>
    )
}