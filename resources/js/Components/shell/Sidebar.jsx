import React from 'react';
import { usePage } from '@inertiajs/react';
import {
    SquaresFour,
    Buildings,
    Key,
    Package,
    Scroll,
    Database,
    ListChecks,
    ChartBar,
    Users,
    ClipboardText,
    Gear,
    BookOpen,
} from '@phosphor-icons/react';
import { SidebarItem } from './SidebarItem';
 
export function Sidebar({ isCollapsed = false }) {
    const { url } = usePage();
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.role === 'admin';
 
    const navGroups = [
        {
            title: 'Ringkasan',
            items: [
                { icon: SquaresFour, label: 'Dashboard', href: '/dashboard' },
                { icon: ChartBar, label: 'Analisis Performa', href: '/analytics' },
                { icon: BookOpen, label: 'Dokumentasi API', href: '/docs' },
            ]
        },
        {
            title: 'Gateway',
            items: [
                { icon: Buildings, label: 'Tenant / Project', href: '/tenants' },
                { icon: Key, label: 'API Key', href: '/api-keys' },
                { icon: Package, label: 'Provider Engine', href: '/providers', adminOnly: true },
            ]
        },
        {
            title: 'Trafik & Data',
            items: [
                { icon: Scroll, label: 'Log Translasi', href: '/logs' },
                { icon: Database, label: 'Memori Translasi', href: '/memory' },
                { icon: ListChecks, label: 'Antrean', href: '/queue' },
            ]
        },
        {
            title: 'Sistem',
            adminOnly: true,
            items: [
                { icon: Users, label: 'Pengguna', href: '/users' },
                { icon: ClipboardText, label: 'Log Audit', href: '/audit-log' },
            ]
        }
    ];

    const filteredGroups = navGroups.map(group => {
        if (group.adminOnly && !isAdmin) return null;
        const items = group.items.filter(item => !item.adminOnly || isAdmin);
        if (items.length === 0) return null;
        return { ...group, items };
    }).filter(Boolean);

    const isItemActive = (href) => {
        if (href === '/dashboard') {
            return url === '/dashboard' || url === '/';
        }
        return url.startsWith(href);
    };

    return (
        <div className="flex flex-col h-full bg-atlas-surface border-r border-atlas-border transition-all duration-[var(--duration-base)] select-none">
            {/* Logo area */}
            <div className={`flex items-center ${isCollapsed ? 'h-16 justify-center' : 'h-20 px-6'} border-b border-atlas-border`}>
                <img 
                    src={isCollapsed ? "/logo/mono.png" : "/logo/logo.png"} 
                    alt="Logo" 
                    className={`${isCollapsed ? 'h-8 w-8' : 'h-11 w-auto'} object-contain flex-shrink-0`}
                />
            </div>

            {/* Navigation links */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
                {filteredGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="space-y-1">
                        {!isCollapsed ? (
                            <div className="text-[9px] uppercase font-bold tracking-widest text-atlas-secondary/50 px-3 mb-1.5 block">
                                {group.title}
                            </div>
                        ) : (
                            groupIdx > 0 && <div className="border-t border-atlas-border/40 my-2 pt-2" />
                        )}
                        {group.items.map((item) => (
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
                ))}
            </div>

            {/* Footer settings */}
            {isAdmin && (
                <div className="p-3 border-t border-atlas-border">
                    <SidebarItem
                        icon={Gear}
                        label="Pengaturan"
                        href="/settings"
                        isActive={isItemActive('/settings')}
                        isCollapsed={isCollapsed}
                    />
                </div>
            )}
        </div>
    );
}
