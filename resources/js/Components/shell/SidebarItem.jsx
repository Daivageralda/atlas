import React from 'react';
import { Link } from '@inertiajs/react';
import * as Tooltip from '@radix-ui/react-tooltip';

export function SidebarItem({ icon: Icon, label, href, isActive, isCollapsed }) {
    const linkContent = (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium transition-all duration-[var(--duration-fast)] select-none outline-none focus-visible:ring-2 focus-visible:ring-atlas-accent/40 ${
                isActive
                    ? 'bg-atlas-card text-atlas-accent relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r before:bg-atlas-accent'
                    : 'text-atlas-secondary hover:bg-atlas-hover hover:text-atlas-primary'
            } ${isCollapsed ? 'justify-center' : ''}`}
        >
            <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'text-atlas-accent scale-110' : 'text-atlas-secondary group-hover:text-atlas-primary'}`} />
            {!isCollapsed && <span className="truncate">{label}</span>}
        </Link>
    );

    if (isCollapsed) {
        return (
            <Tooltip.Provider delayDuration={100}>
                <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                        {linkContent}
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                        <Tooltip.Content
                            side="right"
                            align="center"
                            sideOffset={10}
                            className="z-50 px-3 py-1.5 text-xs bg-atlas-card border border-atlas-border text-atlas-primary rounded-md shadow-md animate-in fade-in zoom-in-95 duration-100"
                        >
                            {label}
                            <Tooltip.Arrow className="fill-atlas-border" />
                        </Tooltip.Content>
                    </Tooltip.Portal>
                </Tooltip.Root>
            </Tooltip.Provider>
        );
    }

    return linkContent;
}
