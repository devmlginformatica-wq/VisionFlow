import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

interface RelatorioPerguntaFormProps {
    loading: boolean
    isOnline: boolean
    onGenerate: (question: string) => Promise<void>
}

export function RelatorioPerguntaForm({ loading, isOnline, onGenerate }: RelatorioPerguntaFormProps): React.JSX.Element {
    const { t } = useTranslation()
    const [question, setQuestion] = useState('')

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault()
        void onGenerate(question)
    }

    return (
        <form className="space-y-3" onSubmit={handleSubmit}>
            <label htmlFor="report-question" className="block text-sm font-medium text-[var(--color-foreground)]">{t('reports.ai.question')}</label>
            <textarea id="report-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={t('reports.ai.placeholder')} rows={3} className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
            <button type="submit" disabled={loading || !isOnline} className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-primary-foreground)] disabled:cursor-not-allowed disabled:opacity-50">
                {t(loading ? 'reports.ai.generating' : 'reports.ai.generate')}
            </button>
            {!isOnline && <p className="text-sm text-[var(--color-warning)]" role="status">{t('reports.errors.offline')}</p>}
        </form>
    )
}
