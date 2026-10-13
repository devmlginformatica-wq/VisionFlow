import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { LoginCredentials } from '../../domain/entities/Usuario'
import { loginSchema, type LoginFormValues } from '../../domain/validators/loginSchema'
import { authStrings } from '../auth.constants'
import { LoginBrandMark } from './LoginBrandMark'
import { LoginEmailField } from './LoginEmailField'
import { LoginPasswordField } from './LoginPasswordField'
import { LoginSubmitButton } from './LoginSubmitButton'

interface LoginFormProps {
    loading: boolean
    error: string | null
    onSubmit: (credentials: LoginCredentials) => Promise<void>
}

export function LoginForm({ loading, error, onSubmit }: LoginFormProps): React.JSX.Element {
    const { register, handleSubmit, setFocus, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    })

    useEffect(() => {
        setFocus('email')
    }, [setFocus])

    return (
        <section className="w-full max-w-md">
            <div className="mb-10 lg:hidden"><LoginBrandMark compact /></div>
            <header className="mb-8">
                <p className="mb-3 text-xs font-semibold uppercase text-[var(--color-primary)]">{authStrings.brandingSubtitle}</p>
                <h1 className="text-3xl font-semibold tracking-normal">{authStrings.title}</h1>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{authStrings.description}</p>
            </header>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <LoginEmailField register={register} error={errors.email} />
                <LoginPasswordField register={register} error={errors.password} />
                {error && <p role="alert" className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] px-3 py-2.5 text-sm text-[var(--color-danger)]">{error}</p>}
                <LoginSubmitButton loading={loading} />
            </form>
        </section>
    )
}