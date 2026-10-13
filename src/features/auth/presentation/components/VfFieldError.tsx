interface VfFieldErrorProps {
    id: string
    message?: string
}

export function VfFieldError({ id, message }: VfFieldErrorProps): React.JSX.Element | null {
    if (!message) return null
    return <p id={id} role="alert" className="mt-1.5 text-sm text-[var(--color-danger)]">{message}</p>
}