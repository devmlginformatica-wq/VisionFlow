import type { FieldError, UseFormRegister } from 'react-hook-form'
import type { LoginFormValues } from '../../domain/validators/loginSchema'
import { authStrings } from '../auth.constants'
import { VfFieldError } from './VfFieldError'

interface LoginEmailFieldProps {
    register: UseFormRegister<LoginFormValues>
    error?: FieldError
}

export function LoginEmailField({ register, error }: LoginEmailFieldProps): React.JSX.Element {
    return (
        <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">{authStrings.emailLabel}</label>
            <input
                {...register('email')}
                id="email"
                type="email"
                placeholder={authStrings.emailPlaceholder}
                autoComplete="email"
                autoCapitalize="none"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'email-error' : undefined}
                className="h-12 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
            />
            <VfFieldError id="email-error" message={error?.message} />
        </div>
    )
}