import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { AppMenuItem } from './AppMenuItem'
import { kStr, shellNavigation } from './shell.constants'

export interface AppDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AppDrawer({ open, onOpenChange }: AppDrawerProps): React.JSX.Element {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-[var(--color-overlay)] md:hidden" />
                <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(84vw,20rem)] flex-col bg-[var(--color-sidebar)] p-4 text-[var(--color-sidebar-foreground)] shadow-xl md:hidden">
                    <div className="mb-5 flex items-center justify-between">
                        <Dialog.Title className="text-sm font-semibold">{kStr.appName}</Dialog.Title>
                        <Dialog.Close aria-label={kStr.menuClose} className="rounded-md p-2 hover:bg-[var(--color-sidebar-hover)]">
                            <X aria-hidden="true" size={20} />
                        </Dialog.Close>
                    </div>
                    <nav aria-label={kStr.menuOpen} className="space-y-1">
                        {shellNavigation.map((item) => (
                            <AppMenuItem key={item.path} item={item} expanded onNavigate={() => onOpenChange(false)} />
                        ))}
                    </nav>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}