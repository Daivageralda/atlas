import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    ChartBar, 
    CalendarBlank, 
    ArrowsCounterClockwise, 
    TrendUp, 
    Lightning, 
    Coins, 
    Database, 
    Clock, 
    Pulse 
} from '@phosphor-icons/react';
import { 
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { StatCard } from '../../Components/ui/StatCard';
import { EmptyState } from '../../Components/ui/EmptyState';

const CHART_COLORS = ['#3ECF8E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

function AtlasTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-atlas-card border border-atlas-border rounded-input p-3 text-[10px] font-mono shadow-2xl">
            <p className="text-atlas-secondary mb-1.5 font-bold">{label}</p>
            <div className="space-y-1">
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color || p.payload?.fill || '#3ECF8E' }}>
                        {p.name}: {typeof p.value === 'number' && p.name.toLowerCase().includes('cost') ? `$${p.value.toFixed(4)}` : p.value}
                    </p>
                ))}
            </div>
        </div>
    );
}

export default function Index({ kpi, charts, filters, tenants, auth }) {
    const isAdmin = auth.user?.role === 'admin';
    const [tenantId, setTenantId] = useState(filters.tenant_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleReset = () => {
        setTenantId('');
        setDateFrom('');
        setDateTo('');
        router.get(route('analytics.index'), {}, { replace: true, preserveState: true });
    };

    const applyFilters = () => {
        router.get(route('analytics.index'), {
            tenant_id: tenantId,
            date_from: dateFrom,
            date_to: dateTo
        }, {
            replace: true,
            preserveState: true
        });
    };

    const hasData = kpi.total_requests > 0;

    return (
        <div className="space-y-6 select-none">
            <Head title="Analytics" />

            {/* Header */}
            <div className="border-b border-atlas-border/50 pb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-atlas-accent/10 border border-atlas-accent/25 flex items-center justify-center text-atlas-accent">
                        <ChartBar className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-atlas-primary">Analytics</h1>
                        <p className="text-xs text-atlas-secondary mt-0.5">Analisis performa, visualisasi data, latensi, dan statistik biaya</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-atlas-card border border-atlas-border rounded-card p-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:max-w-2xl">
                    {/* Tenant filter (Admin Only) */}
                    {isAdmin ? (
                        <div>
                            <select
                                value={tenantId}
                                onChange={(e) => setTenantId(e.target.value)}
                                className="w-full bg-atlas-surface border border-atlas-border rounded-input px-3 py-2 text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs"
                            >
                                <option value="">Semua Tenant...</option>
                                {tenants.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    ) : <div className="hidden sm:block"></div>}

                    {/* Date From */}
                    <div className="relative">
                        <CalendarBlank className="absolute left-3 top-2.5 h-3.5 w-3.5 text-atlas-secondary" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs font-mono"
                        />
                    </div>

                    {/* Date To */}
                    <div className="relative">
                        <CalendarBlank className="absolute left-3 top-2.5 h-3.5 w-3.5 text-atlas-secondary" />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs font-mono"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        className="px-4 h-9 flex items-center justify-center gap-1.5 rounded-button border border-atlas-border bg-atlas-surface hover:bg-atlas-hover text-atlas-secondary hover:text-atlas-primary transition-colors font-semibold"
                    >
                        <ArrowsCounterClockwise className="h-3.5 w-3.5" />
                        Reset
                    </button>
                    <button
                        onClick={applyFilters}
                        className="px-4 h-9 flex items-center justify-center rounded-button bg-atlas-accent text-atlas-bg font-bold hover:bg-atlas-accent/90 transition-all active:scale-95"
                    >
                        Terapkan Filter
                    </button>
                </div>
            </div>

            {hasData ? (
                <>
                    {/* KPI Row (6 items) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <StatCard label="Total Requests" value={kpi.total_requests} />
                        <StatCard label="Success Rate" value={kpi.success_rate} suffix="%" status={kpi.success_rate < 90 ? 'warning' : 'default'} />
                        <StatCard label="Cache Hit Rate" value={kpi.cache_hit_rate} suffix="%" />
                        <StatCard label="Total Cost" value={kpi.total_cost} prefix="Rp. " />
                        <StatCard label="Total Tokens" value={kpi.total_tokens} />
                        <StatCard label="Avg Latency" value={kpi.avg_latency_ms} suffix=" ms" />
                    </div>

                    {/* Charts Grid (2 columns, 3 rows) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-[10px] font-mono">
                        {/* 1. Requests per Day */}
                        <div className="bg-atlas-card border border-atlas-border rounded-card p-5">
                            <h2 className="text-xs font-bold text-atlas-primary mb-4 flex items-center gap-1.5">
                                <TrendUp className="h-4 w-4 text-atlas-accent" />
                                Volume Request Harian
                            </h2>
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={charts.requests_per_day}>
                                        <defs>
                                            <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.25}/>
                                                <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0.01}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke="#2A2A2E" strokeDasharray="3 3" opacity={0.5} />
                                        <XAxis dataKey="date" stroke="#A1A1AA" tickLine={false} />
                                        <YAxis stroke="#A1A1AA" tickLine={false} />
                                        <Tooltip content={<AtlasTooltip />} />
                                        <Area type="monotone" dataKey="total" name="Requests" stroke="#3ECF8E" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 2. Success vs Failed */}
                        <div className="bg-atlas-card border border-atlas-border rounded-card p-5">
                            <h2 className="text-xs font-bold text-atlas-primary mb-4 flex items-center gap-1.5">
                                <Pulse className="h-4 w-4 text-atlas-accent" />
                                Rasio Sukses vs Gagal
                            </h2>
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.success_vs_failed} stackOffset="expand">
                                        <CartesianGrid stroke="#2A2A2E" strokeDasharray="3 3" opacity={0.5} />
                                        <XAxis dataKey="date" stroke="#A1A1AA" tickLine={false} />
                                        <YAxis stroke="#A1A1AA" tickLine={false} />
                                        <Tooltip content={<AtlasTooltip />} />
                                        <Legend verticalAlign="top" height={36} />
                                        <Bar dataKey="success" name="Sukses" stackId="a" fill="#3ECF8E" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="failed" name="Gagal" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 3. Provider Usage */}
                        <div className="bg-atlas-card border border-atlas-border rounded-card p-5">
                            <h2 className="text-xs font-bold text-atlas-primary mb-4 flex items-center gap-1.5">
                                <Database className="h-4 w-4 text-atlas-accent" />
                                Distribusi Engine Provider
                            </h2>
                            <div className="h-[260px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={charts.provider_usage}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {charts.provider_usage.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<AtlasTooltip />} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 4. Cost per Day */}
                        <div className="bg-atlas-card border border-atlas-border rounded-card p-5">
                            <h2 className="text-xs font-bold text-atlas-primary mb-4 flex items-center gap-1.5">
                                <Coins className="h-4 w-4 text-atlas-accent" />
                                Akumulasi Biaya Transaksi ($ USD)
                            </h2>
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={charts.cost_per_day}>
                                        <defs>
                                            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25}/>
                                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.01}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke="#2A2A2E" strokeDasharray="3 3" opacity={0.5} />
                                        <XAxis dataKey="date" stroke="#A1A1AA" tickLine={false} />
                                        <YAxis stroke="#A1A1AA" tickLine={false} />
                                        <Tooltip content={<AtlasTooltip />} />
                                        <Area type="monotone" dataKey="cost" name="Biaya ($)" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 5. Token Usage per Day */}
                        <div className="bg-atlas-card border border-atlas-border rounded-card p-5">
                            <h2 className="text-xs font-bold text-atlas-primary mb-4 flex items-center gap-1.5">
                                <Lightning className="h-4 w-4 text-atlas-accent" />
                                Konsumsi Volume Token
                            </h2>
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.token_usage_day}>
                                        <CartesianGrid stroke="#2A2A2E" strokeDasharray="3 3" opacity={0.5} />
                                        <XAxis dataKey="date" stroke="#A1A1AA" tickLine={false} />
                                        <YAxis stroke="#A1A1AA" tickLine={false} />
                                        <Tooltip content={<AtlasTooltip />} />
                                        <Bar dataKey="tokens" name="Tokens" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 6. Avg Latency per Day */}
                        <div className="bg-atlas-card border border-atlas-border rounded-card p-5">
                            <h2 className="text-xs font-bold text-atlas-primary mb-4 flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-atlas-accent" />
                                Rata-rata Latensi Respons (ms)
                            </h2>
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={charts.avg_latency_day}>
                                        <CartesianGrid stroke="#2A2A2E" strokeDasharray="3 3" opacity={0.5} />
                                        <XAxis dataKey="date" stroke="#A1A1AA" tickLine={false} />
                                        <YAxis stroke="#A1A1AA" tickLine={false} />
                                        <Tooltip content={<AtlasTooltip />} />
                                        <Line type="monotone" dataKey="latency" name="Latensi (ms)" stroke="#8B5CF6" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-atlas-card border border-atlas-border rounded-card py-16">
                    <EmptyState
                        icon={ChartBar}
                        title="Belum ada metrik data"
                        description="Tidak ditemukan log aktivitas transaksi terjemahan untuk rentang periode tanggal yang Anda pilih."
                        action={(
                            <button
                                onClick={handleReset}
                                className="h-8 px-4 rounded-button bg-atlas-surface border border-atlas-border text-atlas-secondary hover:text-atlas-primary text-[11px] font-semibold transition-all"
                            >
                                Reset Pencarian
                            </button>
                        )}
                    />
                </div>
            )}
        </div>
    );
}
