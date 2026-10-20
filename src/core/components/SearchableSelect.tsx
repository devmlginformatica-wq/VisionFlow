import { useEffect, useMemo, useRef, useState } from 'react'
import type { Ref } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Check, ChevronsUpDown, LoaderCircle, Search } from 'lucide-react'

export interface SearchableSelectOption {
    value: string
    label: string
    searchTerms?: readonly string[]
}

interface SearchableSelectProps {
    id: string
    value: string
    options: readonly SearchableSelectOption[]
    onValueChange: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    disabled?: boolean
    error?: string
    onBlur?: () => void
    triggerRef?: Ref<HTMLButtonElement>
    onSearch?: (query: string) => Promise<void> | void
    debounceMs?: number
    loading?: boolean
    minSearchLength?: number
}

function normalizeSearch(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR')
        .trim()
}

export function SearchableSelect({
    id,
    value,
    options,
    onValueChange,
    placeholder = 'Selecione',
    searchPlaceholder = 'Buscar...',
    emptyMessage = 'Nenhum resultado encontrado.',
    disabled = false,
    error,
    onBlur,
    triggerRef,
    onSearch,
    debounceMs = 300,
    loading = false,
    minSearchLength = 1,
}: SearchableSelectProps): React.JSX.Element {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [activeIndex, setActiveIndex] = useState(0)
    const [searchError, setSearchError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const hasSearchedRef = useRef(false)
    const listboxId = `${id}-options`
    const selectedOption = options.find((option) => option.value === value)
    const filteredOptions = useMemo(() => {
        if (onSearch) return options

        const normalizedQuery = normalizeSearch(query)
        if (!normalizedQuery) return options

        return options.filter((option) =>
            [option.label, option.value, ...(option.searchTerms ?? [])]
                .some((term) => normalizeSearch(term).includes(normalizedQuery)),
        )
    }, [onSearch, options, query])

    useEffect(() => {
        if (!open || !onSearch) return

        const trimmedQuery = query.trim()
        const searchTerm = Array.from(trimmedQuery).length < minSearchLength ? '' : trimmedQuery
        if (!searchTerm && !hasSearchedRef.current) return

        const timeoutId = window.setTimeout(() => {
            hasSearchedRef.current = searchTerm.length > 0
            setSearchError(null)
            Promise.resolve(onSearch(searchTerm)).catch((searchFailure: unknown) => {
                setSearchError(searchFailure instanceof Error ? searchFailure.message : 'Não foi possível realizar a busca.')
            })
        }, debounceMs)

        return () => window.clearTimeout(timeoutId)
    }, [debounceMs, minSearchLength, onSearch, open, query])

    const safeActiveIndex = Math.min(activeIndex, Math.max(filteredOptions.length - 1, 0))

    function closeSearch(): void {
        setOpen(false)
        setQuery('')
        setSearchError(null)
        if (onSearch && hasSearchedRef.current) {
            hasSearchedRef.current = false
            Promise.resolve(onSearch('')).catch((searchFailure: unknown) => {
                setSearchError(searchFailure instanceof Error ? searchFailure.message : 'Não foi possível restaurar as opções.')
            })
        }
    }

    function selectOption(option: SearchableSelectOption): void {
        onValueChange(option.value)
        closeSearch()
    }

    function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActiveIndex((index) => filteredOptions.length === 0 ? 0 : Math.min(Math.max(index, safeActiveIndex) + 1, filteredOptions.length - 1))
        } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActiveIndex((index) => Math.max(Math.min(index, safeActiveIndex) - 1, 0))
        } else if (event.key === 'Home') {
            event.preventDefault()
            setActiveIndex(0)
        } else if (event.key === 'End') {
            event.preventDefault()
            setActiveIndex(Math.max(filteredOptions.length - 1, 0))
        } else if (event.key === 'Enter' && filteredOptions[safeActiveIndex]) {
            event.preventDefault()
            selectOption(filteredOptions[safeActiveIndex])
        }
    }

    return (
        <Popover.Root
            open={open}
            onOpenChange={(nextOpen) => {
                if (nextOpen) {
                    setOpen(true)
                    setActiveIndex(0)
                } else {
                    closeSearch()
                }
            }}
        >
            <Popover.Trigger asChild>
                <button
                    ref={triggerRef}
                    id={id}
                    type="button"
                    role="combobox"
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-controls={listboxId}
                    aria-activedescendant={open && filteredOptions[safeActiveIndex] ? `${listboxId}-${safeActiveIndex}` : undefined}
                    aria-busy={loading}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : undefined}
                    disabled={disabled}
                    onBlur={onBlur}
                    onKeyDown={(event) => {
                        if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
                            event.preventDefault()
                            hasSearchedRef.current = false
                            setQuery(event.key)
                            setSearchError(null)
                            setActiveIndex(0)
                            setOpen(true)
                        }
                    }}
                    className="flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-left text-sm disabled:bg-[var(--color-canvas)] disabled:opacity-60"
                >
                    <span className="truncate">{selectedOption?.label ?? placeholder}</span>
                    <ChevronsUpDown aria-hidden="true" size={16} className="shrink-0 text-[var(--color-muted)]" />
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    align="start"
                    sideOffset={4}
                    onOpenAutoFocus={(event) => {
                        event.preventDefault()
                        inputRef.current?.focus()
                    }}
                    className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[min(16rem,calc(100vw-2rem))] rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-1 text-[var(--color-foreground)] shadow-xl"
                >
                    <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-2">
                        <Search aria-hidden="true" size={16} className="shrink-0 text-[var(--color-muted)]" />
                        <input
                            ref={inputRef}
                            type="search"
                            role="searchbox"
                            aria-label={searchPlaceholder}
                            aria-controls={listboxId}
                            aria-activedescendant={filteredOptions[safeActiveIndex] ? `${listboxId}-${safeActiveIndex}` : undefined}
                            autoComplete="off"
                            value={query}
                            onChange={(event) => {
                                hasSearchedRef.current = hasSearchedRef.current || event.target.value.length > 0
                                setQuery(event.target.value)
                                setSearchError(null)
                                setActiveIndex(0)
                            }}
                            onKeyDown={handleSearchKeyDown}
                            placeholder={searchPlaceholder}
                            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-muted)]"
                        />
                        {loading && <LoaderCircle aria-label="Buscando" role="status" size={16} className="shrink-0 animate-spin text-[var(--color-muted)]" />}
                    </div>
                    <div
                        id={listboxId}
                        role="listbox"
                        aria-label={placeholder}
                        aria-busy={loading}
                        className="max-h-60 overflow-y-auto py-1"
                    >
                        {searchError
                            ? <p role="alert" className="px-3 py-2 text-sm text-[var(--color-danger)]">{searchError}</p>
                            : filteredOptions.length === 0
                            ? <p role="status" className="px-3 py-2 text-sm text-[var(--color-muted)]">{onSearch && query.trim() ? `Nenhum resultado para '${query.trim()}'.` : emptyMessage}</p>
                            : filteredOptions.map((option, index) => (
                                <button
                                    key={option.value}
                                    id={`${listboxId}-${index}`}
                                    type="button"
                                    role="option"
                                    aria-selected={option.value === value}
                                    onMouseMove={() => setActiveIndex(index)}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => selectOption(option)}
                                    className={`flex min-h-9 w-full items-center gap-2 rounded px-2 text-left text-sm hover:bg-[var(--color-canvas)] ${index === safeActiveIndex ? 'bg-[var(--color-canvas)]' : ''}`}
                                >
                                    <Check aria-hidden="true" size={16} className={`shrink-0 ${option.value === value ? 'opacity-100' : 'opacity-0'}`} />
                                    <span className="truncate">{option.label}</span>
                                </button>
                            ))}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}
