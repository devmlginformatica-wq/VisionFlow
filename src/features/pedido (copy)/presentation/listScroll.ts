let savedScrollTop: number | null = null

export function preservePedidoListScroll(): void {
    savedScrollTop = document.querySelector<HTMLElement>('[data-shell-content]')?.scrollTop ?? 0
}

export function restorePedidoListScroll(): void {
    if (savedScrollTop === null) return
    const content = document.querySelector<HTMLElement>('[data-shell-content]')
    if (content) content.scrollTop = savedScrollTop
    savedScrollTop = null
}