import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ScrollText, 
    Search, 
    RefreshCcw, 
    Calendar,
    ArrowRight,
    HelpCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { EmptyState } from '../../Components/ui/EmptyState';

export default function Index({ logs, filters, tenants, auth }) {
    const isAdmin = auth.user?.role === 'admin';
    const [search, setSearch] = useState(filters.search || '');
    const [tenantId, setTenantId] = useState(filters.tenant_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [provider, setProvider] = useState(filters.provider || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // Reset filters
    const handleReset = () => {
        setSearch('');
        setTenantId('');
        setStatus('');
        setProvider('');
        setDateFrom('');
        setDateTo('');
        router.get(route('logs.index'), {}, { replace: true, preserveState: true });
    };

    // Apply filters on changes
    const applyFilters = () => {
        router.get(route('logs.index'), {
            search,
            tenant_id: tenantId,
            status,
            provider,
            date_from: dateFrom,
            date_to: dateTo
        }, {
            replace: true,
            preserveState: true
        });
    };

    // Trigger filters on form fields changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                applyFilters();
            }
        }, 400); // 400ms debounce for search query input
        return () => clearTimeout(timer);
    }, [search]);

    const handleSelectFilter = () => {
        applyFilters();
    };

    return (
        <div className="space-y-6 select-none">
            <Head title="Translation Logs" />

            {/* Header */}
            <div className="border-b border-atlas-border/50 pb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-atlas-accent/10 border border-atlas-accent/25 flex items-center justify-center text-atlas-accent">
                        <ScrollText className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-atlas-primary">Translation Logs</h1>
                        <p className="text-xs text-atlas-secondary mt-0.5">Monitoring audit data transaksi gateway penerjemahan realtime</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 bg-atlas-card border border-atlas-border rounded-card p-4 text-xs">
                {/* Search */}
                <div className="relative lg:col-span-2">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-atlas-secondary" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari ID transaksi..."
                        className="w-full pl-9 pr-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50 placeholder:text-atlas-secondary/70 text-xs"
                    />
                </div>

                {/* Tenant dropdown (Admin only) */}
                {isAdmin ? (
                    <div>
                        <select
                            value={tenantId}
                            onChange={(e) => {
                                setTenantId(e.target.value);
                                router.get(route('logs.index'), { ...filters, tenant_id: e.target.value }, { replace: true, preserveState: true });
                            }}
                            className="w-full bg-atlas-surface border border-atlas-border rounded-input px-3 py-2 text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs"
                        >
                            <option value="">Semua Tenant...</option>
                            {tenants.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                ) : <div className="hidden lg:block"></div>}

                {/* Status Filter */}
                <div>
                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            router.get(route('logs.index'), { ...filters, status: e.target.value }, { replace: true, preserveState: true });
                        }}
                        className="w-full bg-atlas-surface border border-atlas-border rounded-input px-3 py-2 text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs"
                    >
                        <option value="">Semua Status...</option>
                        <option value="success">Success</option>
                        <option value="cached">Cached</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>

                {/* Provider Filter */}
                <div>
                    <select
                        value={provider}
                        onChange={(e) => {
                            setProvider(e.target.value);
                            router.get(route('logs.index'), { ...filters, provider: e.target.value }, { replace: true, preserveState: true });
                        }}
                        className="w-full bg-atlas-surface border border-atlas-border rounded-input px-3 py-2 text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs"
                    >
                        <option value="">Semua Provider...</option>
                        <option value="SumoPod">SumoPod</option>
                        <option value="Public Translation API">Public Translation API</option>
                    </select>
                </div>

                {/* Dates picker */}
                <div className="relative">
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                            setDateFrom(e.target.value);
                            router.get(route('logs.index'), { ...filters, date_from: e.target.value }, { replace: true, preserveState: true });
                        }}
                        className="w-full bg-atlas-surface border border-atlas-border rounded-input px-3 py-2 text-atlas-primary outline-none focus:border-atlas-accent/50 text-[11px]"
                    />
                </div>

                {/* Reset button */}
                <div className="flex items-center justify-end">
                    <button
                        onClick={handleReset}
                        className="w-full h-9 flex items-center justify-center gap-1.5 px-3 rounded-button border border-atlas-border bg-atlas-surface hover:bg-atlas-hover text-atlas-secondary hover:text-atlas-primary transition-colors text-xs font-semibold"
                    >
                        <RefreshCcw className="h-3.5 w-3.5" />
                        <span>Reset</span>
                    </button>
                </div>
            </div>

            {/* Table list view */}
            <div className="bg-atlas-card border border-atlas-border rounded-card overflow-hidden">
                {logs.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b border-atlas-border bg-atlas-surface text-[10px] uppercase font-bold tracking-wider text-atlas-secondary">
                                    <th className="px-6 py-4">ID Transaksi</th>
                                    {isAdmin && <th className="px-6 py-4">Tenant</th>}
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Provider</th>
                                    <th className="px-6 py-4">Tipe</th>
                                    <th className="px-6 py-4">Bahasa</th>
                                    <th className="px-6 py-4">Retries</th>
                                    <th className="px-6 py-4 text-right">Durasi</th>
                                    <th className="px-6 py-4 text-right">Tarif</th>
                                    <th className="px-6 py-4 text-right">Waktu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-atlas-border/50 text-atlas-secondary">
                                {logs.data.map((log) => (
                                    <tr 
                                        key={log.id} 
                                        onClick={() => router.get(route('logs.show', log.id))}
                                        className="hover:bg-atlas-hover/50 cursor-pointer transition-colors duration-100"
                                    >
                                        <td className="px-6 py-3.5 font-mono text-[10px] text-atlas-primary select-all">
                                            {log.id.substring(0, 8)}...
                                        </td>
                                        {isAdmin && <td className="px-6 py-3.5 font-medium text-atlas-primary">{log.tenant_name}</td>}
                                        <td className="px-6 py-3.5">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                                log.status === 'success' 
                                                    ? 'text-atlas-success bg-atlas-success/10 border-atlas-success/20' 
                                                    : log.status === 'cached'
                                                    ? 'text-atlas-accent bg-atlas-accent/10 border-atlas-accent/20'
                                                    : 'text-atlas-danger bg-atlas-danger/10 border-atlas-danger/20'
                                            }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 font-mono text-[10px]">{log.provider}</td>
                                        <td className="px-6 py-3.5 font-mono text-[9px] uppercase tracking-wider">{log.content_type}</td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-1 font-mono text-[10px] text-atlas-primary">
                                                <span>{log.source_lang}</span>
                                                <ArrowRight className="h-3 w-3 text-atlas-secondary" />
                                                <span>{log.target_lang}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 font-mono text-[10px]">
                                            <span className={log.retry_count > 0 ? 'text-atlas-warning font-bold' : ''}>
                                                {log.retry_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-right font-mono text-[11px] text-atlas-primary">
                                            {log.duration_ms}ms
                                        </td>
                                        <td className="px-6 py-3.5 text-right font-mono text-[11px] text-atlas-primary">
                                            {log.estimated_cost > 0 ? `$${log.estimated_cost.toFixed(6)}` : '—'}
                                        </td>
                                        <td className="px-6 py-3.5 text-right text-[10px]">
                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-8">
                        <EmptyState
                            icon={ScrollText}
                            title="Tidak ada transaksi log"
                            description={Object.values(filters).some(x => !!x) 
                                ? "Tidak ditemukan data log yang sesuai dengan filter pencarian Anda." 
                                : "Belum ada riwayat lalu lintas request terjemahan di platform ini."
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
                        Menampilkan {logs.meta?.from || 0} - {logs.meta?.to || 0} dari {logs.meta?.total || 0} transaksi log
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
        </div>
    );
}
