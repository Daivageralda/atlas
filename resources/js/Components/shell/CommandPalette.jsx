import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { router } from '@inertiajs/react';
import { 
    MagnifyingGlass, 
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
    Gear
} from '@phosphor-icons/react';

export function CommandPalette({ open, onClose }) {
    const [query, setQuery] = useState('');

    const commands = [
        { icon: SquaresFour, label: 'Buka Dashboard', href: '/dashboard', keys: 'dash db' },
        { icon: Buildings, label: 'Kelola Tenants', href: '/tenants', keys: 'tenant project client' },
        { icon: Key, label: 'Kelola API Keys', href: '/api-keys', keys: 'api key token auth' },
        { icon: Package, label: 'Daftar AI Providers', href: '/providers', keys: 'provider model sumopod llm' },
        { icon: Scroll, label: 'Lihat Transaksi Logs', href: '/logs', keys: 'log history transaction' },
        { icon: Database, label: 'Translation Memory', href: '/memory', keys: 'memory cache tm vocab' },
        { icon: ListChecks, label: 'Monitoring Queue', href: '/queue', keys: 'queue job background async' },
        { icon: ChartBar, label: 'Statistik Performa', href: '/analytics', keys: 'analytics stats charts cost' },
        { icon: Users, label: 'Kelola Pengguna', href: '/users', keys: 'user team role permission' },
        { icon: ClipboardText, label: 'Audit Log System', href: '/audit-log', keys: 'audit security log config' },
        { icon: Gear, label: 'Pengaturan Gateway', href: '/settings', keys: 'setting config language pricing' },
    ];

    const filtered = commands.filter(cmd => 
        cmd.label.toLowerCase().includes(query.toLowerCase()) || 
        cmd.keys.toLowerCase().includes(query.toLowerCase())
    );

    const handleNavigate = (href) => {
        router.visit(href);
        onClose();
    };

    return (
        <Dialog.Root open={open} onOpenChange={(val) => !val && onClose()}>
            <Dialog.Portal>
                {/* Backdrop */}
                <Dialog.Overlay className="fixed inset-0 z-50 bg-atlas-overlay backdrop-blur-sm transition-opacity duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                
                {/* Modal Container */}
                <Dialog.Content className="fixed top-[20%] left-[50%] z-50 w-full max-w-[550px] translate-x-[-50%] bg-atlas-card border border-atlas-border rounded-card p-0 shadow-2xl focus:outline-none transition-transform duration-[var(--duration-fast)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                    {/* Search Bar Input */}
                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-atlas-border">
                        <MagnifyingGlass className="h-5 w-5 text-atlas-secondary flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Ketik command atau cari halaman..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-transparent border-0 outline-none text-sm text-atlas-primary placeholder-atlas-secondary focus:ring-0 p-0"
                            autoFocus
                        />
                        <span className="hidden sm:inline text-[10px] font-mono text-atlas-secondary bg-atlas-surface border border-atlas-border px-1.5 py-0.5 rounded">ESC</span>
                    </div>

                    {/* Result List */}
                    <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                        {filtered.length > 0 ? (
                            filtered.map((cmd) => {
                                const Icon = cmd.icon;
                                return (
                                    <button
                                        key={cmd.href}
                                        onClick={() => handleNavigate(cmd.href)}
                                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-button text-xs text-atlas-secondary hover:text-atlas-primary hover:bg-atlas-hover transition-colors outline-none focus:bg-atlas-hover focus:text-atlas-primary text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-4 w-4 text-atlas-secondary group-hover:text-atlas-accent group-focus:text-atlas-accent transition-colors" />
                                            <span className="font-medium">{cmd.label}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-atlas-secondary opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">Enter ↵</span>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="py-6 text-center text-xs text-atlas-secondary font-mono">
                                Tidak ada hasil untuk "{query}"
                            </div>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
