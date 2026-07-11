import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { StatCard } from '../Components/ui/StatCard';
import { 
    ScrollText, 
    Building2, 
    Boxes, 
    BarChart2, 
    ChevronRight,
    Server,
    Activity,
    AlertTriangle
} from 'lucide-react';

export default function Dashboard({ stats, systemStatus }) {
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
                <div className="text-xs font-medium text-atlas-secondary bg-atlas-card border border-atlas-border rounded-input px-4 py-2 self-start sm:self-auto font-mono">
                    {today}
                </div>
            </div>

            {/* Grid stats (10 items - Bento styled) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                <StatCard label="Est. Cost Today" value={stats.estimated_cost_today} prefix="$" />
                <StatCard label="Active Users" value={stats.active_users} />
                <StatCard label="Active API Keys" value={stats.active_api_keys} />
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
                {/* System Status card (2 cols width) */}
                <div className="lg:col-span-2 bg-atlas-card border border-atlas-border rounded-card p-6 flex flex-col justify-between transition-all duration-300 hover:border-atlas-border/80">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <Server className="h-5 w-5 text-atlas-accent" />
                            <h2 className="text-sm font-bold tracking-tight text-atlas-primary">Integrasi Provider</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Primary provider SumoPod */}
                            <div className="flex items-center justify-between p-4 bg-atlas-surface border border-atlas-border/50 hover:border-atlas-accent/30 rounded-input transition-all duration-[var(--duration-fast)] group/provider">
                                <div className="flex items-center gap-3">
                                    {getStatusIndicator(systemStatus.primary_provider?.is_active)}
                                    <div>
                                        <p className="text-sm font-semibold text-atlas-primary group-hover/provider:text-atlas-accent transition-colors">
                                            {systemStatus.primary_provider?.name || 'SumoPod'}
                                        </p>
                                        <p className="text-[10px] text-atlas-secondary mt-0.5 font-mono">Primary Engine</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-semibold font-mono tracking-wider ${systemStatus.primary_provider?.is_active ? 'text-atlas-accent' : 'text-atlas-secondary'}`}>
                                    {systemStatus.primary_provider?.is_active ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>

                            {/* Fallback provider */}
                            <div className="flex items-center justify-between p-4 bg-atlas-surface border border-atlas-border/50 hover:border-atlas-accent/30 rounded-input transition-all duration-[var(--duration-fast)] group/provider">
                                <div className="flex items-center gap-3">
                                    {getStatusIndicator(systemStatus.fallback_provider?.is_active)}
                                    <div>
                                        <p className="text-sm font-semibold text-atlas-primary group-hover/provider:text-atlas-accent transition-colors">
                                            {systemStatus.fallback_provider?.name || 'Fallback API'}
                                        </p>
                                        <p className="text-[10px] text-atlas-secondary mt-0.5 font-mono">Secondary Engine</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-semibold font-mono tracking-wider ${systemStatus.fallback_provider?.is_active ? 'text-atlas-accent' : 'text-atlas-secondary'}`}>
                                    {systemStatus.fallback_provider?.is_active ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-atlas-border/40 flex items-center justify-between text-xs text-atlas-secondary font-mono">
                        <div className="flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5 text-atlas-secondary" />
                            <span>Queue: {stats.queue_pending} Pending | {systemStatus.queue_failed_today} Failed Today</span>
                        </div>
                        {systemStatus.queue_failed_today > 0 ? (
                            <Link 
                                href="/queue" 
                                className="text-atlas-danger hover:text-atlas-danger/80 flex items-center gap-1 bg-atlas-danger/10 border border-atlas-danger/20 hover:border-atlas-danger/40 px-2.5 py-1 rounded-button transition-all duration-[var(--duration-fast)] active:scale-95"
                            >
                                <AlertTriangle className="h-3 w-3 animate-bounce" />
                                <span>Perlu Tindakan (Retry)</span>
                            </Link>
                        ) : (
                            <span className="text-atlas-accent flex items-center gap-1 font-mono text-[10px]">
                                <Activity className="h-3 w-3" />
                                ALL SYSTEM HEALTHY
                            </span>
                        )}
                    </div>
                </div>

                {/* Quick Navigation Links */}
                <div className="bg-atlas-card border border-atlas-border rounded-card p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="h-5 w-5 text-atlas-accent" />
                        <h2 className="text-sm font-bold tracking-tight text-atlas-primary">Navigasi Pintas</h2>
                    </div>

                    <div className="flex-1 flex flex-col gap-3 justify-center">
                        <Link 
                            href="/logs"
                            className="flex items-center justify-between p-3.5 bg-atlas-surface border border-atlas-border/30 hover:border-atlas-border rounded-input text-sm text-atlas-secondary hover:text-atlas-primary hover:bg-atlas-hover transition-all duration-[var(--duration-fast)] group"
                        >
                            <div className="flex items-center gap-3">
                                <ScrollText className="h-4 w-4 text-atlas-secondary group-hover:text-atlas-accent" />
                                <span className="font-medium">Lihat Log Transaksi</span>
                            </div>
                            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        <Link 
                            href="/tenants"
                            className="flex items-center justify-between p-3.5 bg-atlas-surface border border-atlas-border/30 hover:border-atlas-border rounded-input text-sm text-atlas-secondary hover:text-atlas-primary hover:bg-atlas-hover transition-all duration-[var(--duration-fast)] group"
                        >
                            <div className="flex items-center gap-3">
                                <Building2 className="h-4 w-4 text-atlas-secondary group-hover:text-atlas-accent" />
                                <span className="font-medium">Kelola Project Tenant</span>
                            </div>
                            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        <Link 
                            href="/providers"
                            className="flex items-center justify-between p-3.5 bg-atlas-surface border border-atlas-border/30 hover:border-atlas-border rounded-input text-sm text-atlas-secondary hover:text-atlas-primary hover:bg-atlas-hover transition-all duration-[var(--duration-fast)] group"
                        >
                            <div className="flex items-center gap-3">
                                <Boxes className="h-4 w-4 text-atlas-secondary group-hover:text-atlas-accent" />
                                <span className="font-medium">Konfigurasi Engine</span>
                            </div>
                            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        <Link 
                            href="/analytics"
                            className="flex items-center justify-between p-3.5 bg-atlas-surface border border-atlas-border/30 hover:border-atlas-border rounded-input text-sm text-atlas-secondary hover:text-atlas-primary hover:bg-atlas-hover transition-all duration-[var(--duration-fast)] group"
                        >
                            <div className="flex items-center gap-3">
                                <BarChart2 className="h-4 w-4 text-atlas-secondary group-hover:text-atlas-accent" />
                                <span className="font-medium">Statistik Performa</span>
                            </div>
                            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
