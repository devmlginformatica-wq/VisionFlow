let listScrollTop: number | null = null

export function preserveClientListScroll(): void {
    const content = document.querySelector<HTMLElement>('[data-shell-content]')
    listScrollTop = content?.scrollTop ?? 0
}

export function restoreClientListScroll(): void {
    if (listScrollTop === null) return
    const content = document.querySelector<HTMLElement>('[data-shell-content]')
    if (content) content.scrollTop = listScrollTop
    listScrollTop = null
}