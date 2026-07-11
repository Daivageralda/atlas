import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import * as Dialog from '@radix-ui/react-dialog';
import { 
    FileText, 
    Search, 
    RefreshCcw, 
    Calendar, 
    Eye, 
    X,
    Lock,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { EmptyState } from '../../Components/ui/EmptyState';

// JSON Diff component
function JsonDiff({ before, after }) {
    if (!before && !after) return <p className="text-atlas-secondary text-[11px]">Tidak ada metadata payload.</p>;
    
    // If it's a delete operation, show full deleted record parameters
    if (before && !after) {
        return (
            <div className="p-3 bg-atlas-danger/5 border border-atlas-danger/20 rounded-input space-y-1 text-[11px] font-mono">
                <p className="text-atlas-danger font-bold mb-1.5">[RECORD DELETED]</p>
                {Object.entries(before).map(([key, val]) => (
                    <div key={key} className="break-words select-text">
                        <span className="text-atlas-secondary">{key}: </span>
                        <span className="text-atlas-danger/90 line-through">{JSON.stringify(val)}</span>
                    </div>
                ))}
            </div>
        );
    }

    const allKeys = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])];
    
    return (
        <div className="p-3 bg-atlas-surface border border-atlas-border/50 rounded-input space-y-1.5 text-[11px] font-mono select-text overflow-y-auto max-h-[300px]">
            {allKeys.map(key => {
                // Ignore internal sensitive tokens or password columns
                if (key.includes('password') || key.includes('remember_token') || key.includes('api_key_encrypted')) {
                    return (
                        <div key={key} className="text-atlas-secondary/40 italic flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            <span>{key}: [SENSITIVE VALUE REDACTED]</span>
                        </div>
                    );
                }

                const bVal = JSON.stringify(before?.[key]);
                const aVal = JSON.stringify(after?.[key]);
                const changed = bVal !== aVal;

                return (
                    <div key={key} className={`p-1 rounded ${changed ? 'bg-atlas-warning/10 border-l-2 border-atlas-warning' : ''} break-words`}>
                        <span className="text-atlas-secondary font-semibold">{key}: </span>
                        {changed ? (
                            <div className="pl-3 mt-0.5 space-y-0.5">
                                <div className="text-atlas-danger flex items-center gap-1 text-[10px]">
                                    <span className="line-through">{bVal || 'null'}</span>
                                </div>
                                <div className="text-atlas-success flex items-center gap-1 text-[10px] font-bold">
                                    <span>{aVal || 'null'}</span>
                                </div>
                            </div>
                        ) : (
                            <span className="text-atlas-primary">{bVal || 'null'}</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function Index({ logs, filters, entity_types, actors }) {
    const [entityType, setEntityType] = useState(filters.entity_type || '');
    const [actorId, setActorId] = useState(filters.actor_id || '');
    const [action, setAction] = useState(filters.action || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // Modal details states
    const [selectedLog, setSelectedLog] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleReset = () => {
        setEntityType('');
        setActorId('');
        setAction('');
        setDateFrom('');
        setDateTo('');
        router.get(route('audit-log.index'), {}, { replace: true, preserveState: true });
    };

    const applyFilters = () => {
        router.get(route('audit-log.index'), {
            entity_type: entityType,
            actor_id: actorId,
            action,
            date_from: dateFrom,
            date_to: dateTo
        }, {
            replace: true,
            preserveState: true
        });
    };

    const openDetails = (log) => {
        setSelectedLog(log);
        setModalOpen(true);
    };

    const getActionBadge = (actionName) => {
        switch (actionName) {
            case 'created':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider font-mono bg-atlas-success/15 text-atlas-success border border-atlas-success/25">
                        CREATED
                    </span>
                );
            case 'updated':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider font-mono bg-atlas-info/15 text-atlas-info border border-atlas-info/25">
                        UPDATED
                    </span>
                );
            case 'deleted':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider font-mono bg-atlas-danger/15 text-atlas-danger border border-atlas-danger/25">
                        DELETED
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider font-mono bg-atlas-disabled/15 text-atlas-secondary border border-atlas-disabled/25">
                        {actionName.toUpperCase()}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 select-none">
            <Head title="Audit Log" />

            {/* Header */}
            <div className="border-b border-atlas-border/50 pb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-atlas-accent/10 border border-atlas-accent/25 flex items-center justify-center text-atlas-accent">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-atlas-primary">Audit Log</h1>
                        <p className="text-xs text-atlas-secondary mt-0.5">Catatan riwayat perubahan konfigurasi, otorisasi, dan operasi sistem</p>
                    </div>
                </div>

                <div className="px-3 py-1.5 rounded-full bg-atlas-surface border border-atlas-border flex items-center gap-1.5 text-[10px] font-mono text-atlas-secondary">
                    <span className="h-1.5 w-1.5 rounded-full bg-atlas-accent animate-pulse" />
                    APPEND-ONLY ARCHIVE
                </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-atlas-card border border-atlas-border rounded-card p-4 text-xs">
                {/* Entity type */}
                <div>
                    <select
                        value={entityType}
                        onChange={(e) => {
                            setEntityType(e.target.value);
                            router.get(route('audit-log.index'), { ...filters, entity_type: e.target.value }, { replace: true, preserveState: true });
                        }}
                        className="w-full bg-atlas-surface border border-atlas-border rounded-input px-3 py-2 text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs"
                    >
                        <option value="">Semua Model...</option>
                        {entity_types.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Actor */}
                <div>
                    <select
                        value={actorId}
                        onChange={(e) => {
                            setActorId(e.target.value);
                            router.get(route('audit-log.index'), { ...filters, actor_id: e.target.value }, { replace: true, preserveState: true });
                        }}
                        className="w-full bg-atlas-surface border border-atlas-border rounded-input px-3 py-2 text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs"
                    >
                        <option value="">Semua Aktor...</option>
                        {actors.map((act) => (
                            <option key={act.id} value={act.id}>{act.name}</option>
                        ))}
                    </select>
                </div>

                {/* Action */}
                <div>
                    <select
                        value={action}
                        onChange={(e) => {
                            setAction(e.target.value);
                            router.get(route('audit-log.index'), { ...filters, action: e.target.value }, { replace: true, preserveState: true });
                        }}
                        className="w-full bg-atlas-surface border border-atlas-border rounded-input px-3 py-2 text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs"
                    >
                        <option value="">Semua Aksi...</option>
                        <option value="created">Created</option>
                        <option value="updated">Updated</option>
                        <option value="deleted">Deleted</option>
                    </select>
                </div>

                {/* Date From */}
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-atlas-secondary" />
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                            setDateFrom(e.target.value);
                            router.get(route('audit-log.index'), { ...filters, date_from: e.target.value }, { replace: true, preserveState: true });
                        }}
                        className="w-full pl-9 pr-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs font-mono"
                    />
                </div>

                {/* Date To */}
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-atlas-secondary" />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                            setDateTo(e.target.value);
                            router.get(route('audit-log.index'), { ...filters, date_to: e.target.value }, { replace: true, preserveState: true });
                        }}
                        className="w-full pl-9 pr-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs font-mono"
                    />
                </div>

                {/* Reset Actions button */}
                <div className="col-span-2 md:col-span-5 flex items-center justify-end">
                    <button
                        onClick={handleReset}
                        className="px-4 h-9 flex items-center justify-center gap-1.5 rounded-button border border-atlas-border bg-atlas-surface hover:bg-atlas-hover text-atlas-secondary hover:text-atlas-primary transition-colors font-semibold"
                    >
                        <RefreshCcw className="h-3.5 w-3.5" />
                        Reset Pencarian
                    </button>
                </div>
            </div>

            {/* List Data Table */}
            <div className="bg-atlas-card border border-atlas-border rounded-card overflow-hidden">
                {logs.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b border-atlas-border bg-atlas-surface text-[10px] uppercase font-bold tracking-wider text-atlas-secondary">
                                    <th className="px-6 py-4">Aktor Pengubah</th>
                                    <th className="px-6 py-4">Aksi</th>
                                    <th className="px-6 py-4">Model Entity</th>
                                    <th className="px-6 py-4">ID Entity</th>
                                    <th className="px-6 py-4">Waktu Kejadian (Precise)</th>
                                    <th className="px-6 py-4 text-right">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-atlas-border/50 text-atlas-secondary">
                                {logs.data.map((log) => (
                                    <tr 
                                        key={log.id} 
                                        className="hover:bg-atlas-hover/30 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-3.5">
                                            <div>
                                                <p className="font-semibold text-atlas-primary">{log.actor_name}</p>
                                                <p className="font-mono text-[10px] text-atlas-secondary mt-0.5">{log.actor_email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5">{getActionBadge(log.action)}</td>
                                        <td className="px-6 py-3.5 font-semibold text-atlas-primary">{log.entity_type}</td>
                                        <td className="px-6 py-3.5 font-mono text-[10px]" title={log.entity_id_full}>
                                            {log.entity_id}
                                        </td>
                                        <td className="px-6 py-3.5 font-mono text-[10px]">
                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <button
                                                onClick={() => openDetails(log)}
                                                className="p-1.5 text-atlas-secondary hover:text-atlas-accent hover:bg-atlas-surface rounded transition-colors"
                                                title="Bandingkan perbedaan parameter (Diff)"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-8">
                        <EmptyState
                            icon={FileText}
                            title="Audit log kosong"
                            description={Object.values(filters).some(x => !!x)
                                ? "Tidak ditemukan catatan aktivitas pengubahan yang sesuai dengan kriteria filter."
                                : "Belum ada catatan aktivitas administratif yang terekam."
                            }
                            action={Object.values(filters).some(x => !!x) && (
                                <button
                                    onClick={handleReset}
                                    className="h-8 px-4 rounded-button bg-atlas-surface border border-atlas-border text-atlas-secondary hover:text-atlas-primary text-[11px] font-semibold transition-all"
                                >
                                    Hapus Filter
                                </button>
                            )}
                        />
                    </div>
                )}
            </div>

            {/* Pagination */}
            {logs.links && logs.links.length > 3 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-[11px] text-atlas-secondary font-mono">
                        Menampilkan {logs.meta?.from || 0} - {logs.meta?.to || 0} dari {logs.meta?.total || 0} log audit
                    </p>
                    <div className="flex items-center gap-1.5 text-xs">
                        {logs.meta.links.map((link, idx) => {
                            if (link.url === null) return null;
                            const isPrev = link.label.includes('Previous');
                            const isNext = link.label.includes('Next');

                            return (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    className={`h-8 px-3 rounded-button border flex items-center justify-center font-semibold transition-colors ${
                                        link.active 
                                            ? 'bg-atlas-accent/15 border-atlas-accent/30 text-atlas-accent' 
                                            : 'bg-atlas-surface border-atlas-border text-atlas-secondary hover:text-atlas-primary hover:bg-atlas-hover'
                                    }`}
                                >
                                    {isPrev ? <ChevronLeft className="h-4 w-4" /> : isNext ? <ChevronRight className="h-4 w-4" /> : link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* View Diff Parameters Dialog Modal */}
            <Dialog.Root open={modalOpen} onOpenChange={(val) => !val && setModalOpen(false)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-40 bg-atlas-overlay backdrop-blur-sm transition-opacity" />
                    <Dialog.Content className="fixed top-[15%] left-[50%] z-50 w-full max-w-lg translate-x-[-50%] bg-atlas-card border border-atlas-border rounded-card p-6 shadow-2xl focus:outline-none">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2 text-atlas-accent">
                                <FileText className="h-4.5 w-4.5" />
                                <Dialog.Title className="text-sm font-bold text-atlas-primary">
                                    Bandingkan Parameter ({selectedLog?.entity_type})
                                </Dialog.Title>
                            </div>
                            <Dialog.Close asChild>
                                <button className="h-7 w-7 text-atlas-secondary hover:text-atlas-primary rounded-lg flex items-center justify-center">
                                    <X className="h-4 w-4" />
                                </button>
                            </Dialog.Close>
                        </div>

                        {selectedLog && (
                            <div className="space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-4 border-b border-atlas-border/50 pb-3">
                                    <div>
                                        <span className="block text-[9px] uppercase font-bold tracking-wider text-atlas-secondary mb-0.5">
                                            Aksi Operasi
                                        </span>
                                        {getActionBadge(selectedLog.action)}
                                    </div>
                                    <div>
                                        <span className="block text-[9px] uppercase font-bold tracking-wider text-atlas-secondary mb-0.5">
                                            Waktu Kejadian
                                        </span>
                                        <span className="font-mono text-atlas-primary text-[10px]">
                                            {new Date(selectedLog.created_at).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <span className="block text-[9px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                        Perbandingan Perubahan Nilai (Before → After)
                                    </span>
                                    <JsonDiff before={selectedLog.before} after={selectedLog.after} />
                                </div>
                            </div>
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
