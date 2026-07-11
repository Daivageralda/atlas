import React from 'react';
import { usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Building2,
    KeyRound,
    Boxes,
    ScrollText,
    Database,
    ListTodo,
    BarChart2,
    Users,
    ClipboardList,
    Settings,
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';

export function Sidebar({ isCollapsed = false }) {
    const { url } = usePage();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: Building2, label: 'Tenants', href: '/tenants' },
        { icon: KeyRound, label: 'API Keys', href: '/api-keys' },
        { icon: Boxes, label: 'Providers', href: '/providers' },
        { icon: ScrollText, label: 'Translation Logs', href: '/logs' },
        { icon: Database, label: 'Translation Memory', href: '/memory' },
        { icon: ListTodo, label: 'Queue', href: '/queue' },
        { icon: BarChart2, label: 'Analytics', href: '/analytics' },
        { icon: Users, label: 'Users', href: '/users' },
        { icon: ClipboardList, label: 'Audit Log', href: '/audit-log' },
    ];

    const isItemActive = (href) => {
        if (href === '/dashboard') {
            return url === '/dashboard' || url === '/';
        }
        return url.startsWith(href);
    };

    return (
        <div className="flex flex-col h-full bg-atlas-surface border-r border-atlas-border transition-all duration-[var(--duration-base)] select-none">
            {/* Logo area */}
            <div className={`flex items-center h-16 border-b border-atlas-border ${isCollapsed ? 'justify-center' : 'px-6 gap-3'}`}>
                <div className="h-8 w-8 rounded-lg bg-atlas-accent/10 border border-atlas-accent/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-atlas-accent font-mono font-bold text-sm">A</span>
                </div>
                {!isCollapsed && (
                    <span className="font-bold tracking-tight text-atlas-primary text-sm">Atlas Gateway</span>
                )}
            </div>

            {/* Navigation links */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {navItems.map((item) => (
                    <SidebarItem
                        key={item.href}
                        icon={item.icon}
                        label={item.label}
                        href={item.href}
                        isActive={isItemActive(item.href)}
                        isCollapsed={isCollapsed}
                    />
                ))}
            </div>

            {/* Footer settings */}
            <div className="p-3 border-t border-atlas-border">
                <SidebarItem
                    icon={Settings}
                    label="Settings"
                    href="/settings"
                    isActive={isItemActive('/settings')}
                    isCollapsed={isCollapsed}
                />
            </div>
        </div>
    );
}
