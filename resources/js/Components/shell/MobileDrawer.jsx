import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import { Sidebar } from './Sidebar';

export function MobileDrawer({ open, onClose }) {
    return (
        <Dialog.Root open={open} onOpenChange={(val) => !val && onClose()}>
            <Dialog.Portal>
                {/* Backdrop */}
                <Dialog.Overlay className="fixed inset-0 z-40 bg-atlas-overlay backdrop-blur-sm transition-opacity duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                
                {/* Panel content */}
                <Dialog.Content className="fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-atlas-surface border-r border-atlas-border focus:outline-none transition-transform duration-[var(--duration-slow)] var(--ease-entrance) data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left">
                    <div className="h-full relative">
                        <Sidebar isCollapsed={false} />
                        
                        {/* Close button indicator */}
                        <Dialog.Close asChild>
                            <button
                                className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-atlas-hover border border-atlas-border flex items-center justify-center text-atlas-secondary hover:text-atlas-primary outline-none focus-visible:ring-2 focus-visible:ring-atlas-accent/40"
                                aria-label="Close menu"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
