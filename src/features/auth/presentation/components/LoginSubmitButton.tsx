import { LoaderCircle } from 'lucide-react'
import { authStrings } from '../auth.constants'

interface LoginSubmitButtonProps {
    loading: boolean
}

export function LoginSubmitButton({ loading }: LoginSubmitButtonProps): React.JSX.Element {
    return (
        <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-primary-foreground)] transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-65"
        >
            {loading && <LoaderCircle aria-hidden="true" size={18} className="animate-spin" />}
            {loading ? authStrings.loading : authStrings.submit}
        </button>
    )
}