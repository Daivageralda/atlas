import React, { useState, useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { List, MagnifyingGlass, Bell, CaretDown, User, Gear, SignOut } from '@phosphor-icons/react';
import { CommandPalette } from './CommandPalette';

export function Topbar({ onMenuClick }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [paletteOpen, setPaletteOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setPaletteOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <header className="h-16 bg-atlas-surface border-b border-atlas-border flex items-center justify-between px-6 select-none relative z-35">
            {/* Left side actions */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="md:hidden h-9 w-9 rounded-lg bg-atlas-hover border border-atlas-border flex items-center justify-center text-atlas-secondary hover:text-atlas-primary outline-none focus-visible:ring-2 focus-visible:ring-atlas-accent/40"
                    aria-label="Open sidebar"
                >
                    <List className="h-5 w-5" />
                </button>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
                {/* Search placeholder */}
                <button
                    onClick={() => setPaletteOpen(true)}
                    className="h-9 w-9 rounded-lg bg-atlas-hover border border-atlas-border flex items-center justify-center text-atlas-secondary hover:text-atlas-primary outline-none focus-visible:ring-2 focus-visible:ring-atlas-accent/40"
                    title="Cari (Cmd+K)"
                >
                    <MagnifyingGlass className="h-4 w-4" />
                </button>

                <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

                {/* Notifications */}
                <button
                    className="h-9 w-9 rounded-lg bg-atlas-hover border border-atlas-border flex items-center justify-center text-atlas-secondary hover:text-atlas-primary outline-none focus-visible:ring-2 focus-visible:ring-atlas-accent/40 relative"
                    title="Notifikasi"
                >
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-atlas-accent" />
                </button>

                {/* User menu dropdown */}
                {user && (
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-button bg-atlas-hover border border-atlas-border hover:bg-atlas-surface-hover outline-none focus-visible:ring-2 focus-visible:ring-atlas-accent/40 transition-colors">
                                <div className="h-7 w-7 rounded-lg bg-atlas-accent/15 border border-atlas-accent/25 flex items-center justify-center text-atlas-accent font-semibold text-xs uppercase">
                                    {user.name.charAt(0)}
                                </div>
                                <span className="hidden sm:inline text-xs font-medium text-atlas-primary max-w-[120px] truncate">{user.name}</span>
                                <CaretDown className="h-3 w-3 text-atlas-secondary" />
                            </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                align="end"
                                sideOffset={5}
                                className="z-50 min-w-[200px] bg-atlas-card border border-atlas-border rounded-input p-1.5 shadow-xl animate-in fade-in slide-in-from-top-1 duration-[var(--duration-fast)]"
                            >
                                <div className="px-3 py-2">
                                    <p className="text-xs font-semibold text-atlas-primary truncate">{user.name}</p>
                                    <p className="text-[10px] text-atlas-secondary truncate mt-0.5">{user.email}</p>
                                </div>
                                <DropdownMenu.Separator className="h-px bg-atlas-border my-1" />

                                <DropdownMenu.Item asChild>
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2 px-3 py-2 text-xs text-atlas-secondary hover:text-atlas-primary rounded-button outline-none hover:bg-atlas-hover cursor-pointer transition-colors"
                                    >
                                        <User className="h-3.5 w-3.5" />
                                        <span>Profil Saya</span>
                                    </Link>
                                </DropdownMenu.Item>

                                <DropdownMenu.Item asChild>
                                    <Link
                                        href="/settings"
                                        className="flex items-center gap-2 px-3 py-2 text-xs text-atlas-secondary hover:text-atlas-primary rounded-button outline-none hover:bg-atlas-hover cursor-pointer transition-colors"
                                    >
                                        <Gear className="h-3.5 w-3.5" />
                                        <span>Pengaturan</span>
                                    </Link>
                                </DropdownMenu.Item>

                                <DropdownMenu.Separator className="h-px bg-atlas-border my-1" />

                                <DropdownMenu.Item asChild>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-atlas-danger rounded-button outline-none hover:bg-atlas-danger/10 cursor-pointer transition-colors"
                                    >
                                        <SignOut className="h-3.5 w-3.5" />
                                        <span>Keluar Sesi</span>
                                    </Link>
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                )}
            </div>
        </header>
    );
}
