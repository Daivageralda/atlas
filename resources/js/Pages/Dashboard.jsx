import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { StatCard } from '../Components/ui/StatCard';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../Components/ui/Table';
import {
    Scroll,
    Buildings,
    Package,
    ChartBar,
    CaretRight,
    HardDrive,
    Pulse,
    Warning,
    ArrowRight
} from '@phosphor-icons/react';

export default function Dashboard({ stats, systemStatus, recentLogs }) {
    const { auth } = usePage().props;
    const isAdmin = auth.user.role === 'admin';

    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const getStatusIndicator = (active) => {
        return active
            ? <span className="h-2.5 w-2.5 rounded-full bg-atlas-success shadow-lg shadow-atlas-success/50" />
            : <span className="h-2.5 w-2.5 rounded-full bg-atlas-disabled" />;
    };

    return (
        <div className="space-y-8 select-none">
            <Head title="Dashboard" />

            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-atlas-border/50 pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-atlas-primary">Ringkasan Sistem</h1>
                    <p className="text-sm text-atlas-secondary mt-1">Status dan metrik performa terjemahan hari ini</p>
                </div>
                <div className="flex items-center gap-2 bg-atlas-card border border-atlas-border rounded-card px-4 py-2 text-xs font-medium text-atlas-secondary">
                    <span className="h-2 w-2 rounded-full bg-atlas-accent animate-pulse" />
                    <span>{today}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="sm:col-span-2 md:col-span-2 lg:col-span-2">
                    <StatCard label="Total Requests" value={stats.requests_today} />
                </div>
                <StatCard
                    label="Success Rate"
                    value={stats.success_rate}
                    suffix="%"
                    status={stats.success_rate < 90 ? 'warning' : 'default'}
                />
                <StatCard label="Avg Response" value={stats.avg_response_ms} suffix=" ms" />
                <StatCard label="Token Usage" value={stats.token_usage_today} />
                <StatCard label="Cache Hit Rate" value={stats.cache_hit_rate} suffix="%" />
                <StatCard
                    label="Failure Rate"
                    value={stats.failure_rate}
                    suffix="%"
                    status={stats.failure_rate > 5 ? 'danger' : 'default'}
                />
                <StatCard label="Est. Cost Today" value={stats.estimated_cost_today} prefix="Rp. " />
                {stats.active_users !== null ? (
                    <>
                        <StatCard label="Active Users" value={stats.active_users} />
                        <StatCard label="Active API Keys" value={stats.active_api_keys} />
                    </>
                ) : (
                    <div className="sm:col-span-2 md:col-span-1 lg:col-span-2">
                        <StatCard label="Active API Keys" value={stats.active_api_keys} />
                    </div>
                )}
                <div className="sm:col-span-2 md:col-span-1 lg:col-span-2">
                    <StatCard
                        label="Queue Pending"
                        value={stats.queue_pending}
                        status={stats.queue_pending > 50 ? 'warning' : 'default'}
                    />
                </div>
            </div>

            {/* Two column layouts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions Table (2 cols width) */}
                <div className="lg:col-span-2 bg-atlas-card border border-atlas-border rounded-card p-6 flex flex-col justify-between transition-all duration-300 hover:border-atlas-border/80">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Scroll className="h-5 w-5 text-atlas-accent" />
                                <h2 className="text-sm font-bold tracking-tight text-atlas-primary">Transaksi Terbaru</h2>
                            </div>
                            <Link
                                href="/logs"
                                className="text-[11px] font-semibold text-atlas-accent hover:underline flex items-center gap-1"
                            >
                                <span>Lihat Semua Log</span>
                                <CaretRight className="h-3 w-3" />
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow hover={false} className="hover:bg-transparent">
                                    {isAdmin && <TableHead className="py-3 pr-4">Tenant</TableHead>}
                                    <TableHead className="py-3 px-4">Bahasa</TableHead>
                                    <TableHead className="py-3 px-4 text-right">Durasi</TableHead>
                                    <TableHead className="py-3 px-4 text-right">Biaya</TableHead>
                                    <TableHead className="py-3 pl-4 text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentLogs?.data && recentLogs.data.length > 0 ? (
                                    recentLogs.data.map((log) => (
                                        <TableRow
                                            key={log.id}
                                            onClick={() => router.get(route('logs.show', log.id))}
                                            className="cursor-pointer group"
                                        >
                                            {isAdmin && (
                                                <TableCell className="py-3 pr-4 font-medium text-atlas-primary truncate max-w-[120px] group-hover:text-atlas-accent">
                                                    {log.tenant_name}
                                                </TableCell>
                                            )}
                                            <TableCell className="py-3 px-4">
                                                <div className="flex items-center gap-1.5 font-mono text-[10px] text-atlas-primary">
                                                    <span>{log.source_lang}</span>
                                                    <ArrowRight className="h-3 w-3 text-atlas-secondary" />
                                                    <span>{log.target_lang}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-right font-mono text-[10px] text-atlas-primary">
                                                {log.duration_ms}ms
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-right font-mono text-[10px] text-atlas-primary">
                                                {log.estimated_cost > 0 ? `Rp. ${log.estimated_cost.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : '—'}
                                            </TableCell>
                                            <TableCell className="py-3 pl-4 text-right">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                                    log.status === 'success'
                                                        ? 'text-atlas-success bg-atlas-success/10 border-atlas-success/20'
                                                        : log.status === 'cached'
                                                        ? 'text-atlas-accent bg-atlas-accent/10 border-atlas-accent/20'
                                                        : 'text-atlas-danger bg-atlas-danger/10 border-atlas-danger/20'
                                                }`}>
                                                    {log.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={isAdmin ? 5 : 4} className="py-8 text-center text-atlas-secondary">
                                            Belum ada transaksi log terjemahan hari ini.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        </div>
                    </div>
                </div>

                {/* System Status card (1 col width) */}
                <div className="bg-atlas-card border border-atlas-border rounded-card p-6 flex flex-col justify-between transition-all duration-300 hover:border-atlas-border/80">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <HardDrive className="h-5 w-5 text-atlas-accent" />
                                <h2 className="text-sm font-bold tracking-tight text-atlas-primary">Integrasi Provider</h2>
                            </div>
                            {isAdmin && (
                                <Link
                                    href="/providers"
                                    className="text-[10px] font-semibold text-atlas-accent hover:underline flex items-center gap-0.5"
                                >
                                    <span>Atur</span>
                                    <CaretRight className="h-2.5 w-2.5" />
                                </Link>
                            )}
                        </div>

                        <div className="space-y-4">
                            {systemStatus.providers && systemStatus.providers.length > 0 ? (
                                systemStatus.providers.map((provider, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-atlas-surface border border-atlas-border/50 hover:border-atlas-accent/30 rounded-input transition-all duration-[var(--duration-fast)] group/provider">
                                        <div className="flex items-center gap-3">
                                            {getStatusIndicator(provider.is_active)}
                                            <div>
                                                <p className="text-xs font-semibold text-atlas-primary group-hover/provider:text-atlas-accent transition-colors">
                                                    {provider.name}
                                                </p>
                                                <p className="text-[9px] text-atlas-secondary mt-0.5 font-mono uppercase tracking-wide">
                                                    {provider.role} Engine
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-semibold font-mono tracking-wider ${provider.is_active ? 'text-atlas-accent' : 'text-atlas-secondary'}`}>
                                            {provider.is_active ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-xs text-atlas-secondary">
                                    Belum ada provider yang dikonfigurasi.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-atlas-border/40 flex flex-col gap-3 text-xs text-atlas-secondary font-mono">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Pulse className="h-3.5 w-3.5 text-atlas-secondary" />
                                <span>Queue: {stats.queue_pending} Pending</span>
                            </div>
                            <span className="text-[10px] text-atlas-secondary/70">
                                {systemStatus.queue_failed_today} Failed
                            </span>
                        </div>
                        {systemStatus.queue_failed_today > 0 ? (
                            <Link
                                href="/queue"
                                className="text-atlas-danger hover:text-atlas-danger/80 flex items-center justify-center gap-1 bg-atlas-danger/10 border border-atlas-danger/20 hover:border-atlas-danger/40 py-2 rounded-button transition-all duration-[var(--duration-fast)] active:scale-95 text-[10px] font-bold"
                            >
                                <Warning className="h-3 w-3 animate-bounce" />
                                <span>Perlu Tindakan (Retry Queue)</span>
                            </Link>
                        ) : (
                            <span className="text-atlas-accent flex items-center justify-center gap-1 font-mono text-[9px] mt-1">
                                <Pulse className="h-3 w-3" />
                                ALL SYSTEM HEALTHY
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
