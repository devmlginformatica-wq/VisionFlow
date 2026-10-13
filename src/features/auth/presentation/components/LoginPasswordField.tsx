import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { FieldError, UseFormRegister } from 'react-hook-form'
import type { LoginFormValues } from '../../domain/validators/loginSchema'
import { authStrings } from '../auth.constants'
import { VfFieldError } from './VfFieldError'

interface LoginPasswordFieldProps {
    register: UseFormRegister<LoginFormValues>
    error?: FieldError
}

export function LoginPasswordField({ register, error }: LoginPasswordFieldProps): React.JSX.Element {
    const [visible, setVisible] = useState(false)

    return (
        <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">{authStrings.passwordLabel}</label>
            <div className="relative">
                <input
                    {...register('password')}
                    id="password"
                    type={visible ? 'text' : 'password'}
                    placeholder={authStrings.passwordPlaceholder}
                    autoComplete="current-password"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'password-error' : undefined}
                    className="h-12 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 pr-12 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                />
                <button
                    type="button"
                    aria-label={visible ? authStrings.hidePassword : authStrings.showPassword}
                    onClick={() => setVisible((current) => !current)}
                    className="absolute right-1 top-1 flex size-10 items-center justify-center rounded-md text-[var(--color-muted)] hover:bg-[var(--color-canvas)] hover:text-[var(--color-foreground)]"
                >
                    {visible ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
                </button>
            </div>
            <VfFieldError id="password-error" message={error?.message} />
        </div>
    )
}