import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import * as Tabs from '@radix-ui/react-tabs';
import { 
    CaretLeft, 
    Buildings, 
    Key, 
    ClockCounterClockwise, 
    ChartBar, 
    Gear,
    Pulse,
    WarningCircle,
    UserCheck
} from '@phosphor-icons/react';
import { StatCard } from '../../Components/ui/StatCard';
import { EmptyState } from '../../Components/ui/EmptyState';

export default function Show({ tenant, apiKeys, overview, auth }) {
    const isAdmin = auth.user?.role === 'admin';
    const [activeTab, setActiveTab] = useState('overview');

    // Update settings form helper
    const { data, setData, put, processing, errors } = useForm({
        name: tenant.name,
        type: tenant.type || '',
        status: tenant.status
    });

    const handleUpdateSettings = (e) => {
        e.preventDefault();
        put(route('tenants.update', tenant.id));
    };

    return (
        <div className="space-y-6 select-none">
            <Head title={`Tenant ${tenant.name}`} />

            {/* Breadcrumb Header */}
            <div className="border-b border-atlas-border/50 pb-6">
                <Link
                    href="/tenants"
                    className="inline-flex items-center gap-1.5 text-xs text-atlas-secondary hover:text-atlas-accent font-medium mb-3 transition-colors"
                >
                    <CaretLeft className="h-4 w-4" />
                    <span>Kembali ke Tenants</span>
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-atlas-accent/10 border border-atlas-accent/25 flex items-center justify-center text-atlas-accent">
                            <Buildings className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-atlas-primary">{tenant.name}</h1>
                            <p className="text-xs text-atlas-secondary mt-0.5">Kategori: {tenant.type || '—'}</p>
                        </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        tenant.status === 'active' 
                            ? 'text-atlas-success bg-atlas-success/10 border-atlas-success/20' 
                            : 'text-atlas-secondary bg-atlas-surface border-atlas-border'
                    }`}>
                        {tenant.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Radix Tabs */}
            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
                <Tabs.List className="flex border-b border-atlas-border gap-2">
                    <Tabs.Trigger 
                        value="overview" 
                        className={`px-4 py-2.5 text-xs font-semibold border-b-2 outline-none transition-all ${
                            activeTab === 'overview' 
                                ? 'border-atlas-accent text-atlas-accent' 
                                : 'border-transparent text-atlas-secondary hover:text-atlas-primary'
                        }`}
                    >
                        Overview
                    </Tabs.Trigger>
                    <Tabs.Trigger 
                        value="apikeys" 
                        className={`px-4 py-2.5 text-xs font-semibold border-b-2 outline-none transition-all ${
                            activeTab === 'apikeys' 
                                ? 'border-atlas-accent text-atlas-accent' 
                                : 'border-transparent text-atlas-secondary hover:text-atlas-primary'
                        }`}
                    >
                        API Keys
                    </Tabs.Trigger>
                    <Tabs.Trigger 
                        value="logs" 
                        className={`px-4 py-2.5 text-xs font-semibold border-b-2 outline-none transition-all ${
                            activeTab === 'logs' 
                                ? 'border-atlas-accent text-atlas-accent' 
                                : 'border-transparent text-atlas-secondary hover:text-atlas-primary'
                        }`}
                    >
                        Logs
                    </Tabs.Trigger>
                    <Tabs.Trigger 
                        value="analytics" 
                        className={`px-4 py-2.5 text-xs font-semibold border-b-2 outline-none transition-all ${
                            activeTab === 'analytics' 
                                ? 'border-atlas-accent text-atlas-accent' 
                                : 'border-transparent text-atlas-secondary hover:text-atlas-primary'
                        }`}
                    >
                        Analytics
                    </Tabs.Trigger>
                </Tabs.List>

                {/* TAB OVERVIEW */}
                <Tabs.Content value="overview" className="space-y-6 focus:outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard label="Total Translations" value={overview.total_translations} />
                        <StatCard label="Total Cost" value={overview.total_cost} prefix="Rp. " />
                        <StatCard label="Cache Hits" value={overview.cache_hit_count} />
                    </div>

                    {/* Metadata & Quick Edit settings */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Properties Card */}
                        <div className="lg:col-span-2 bg-atlas-card border border-atlas-border rounded-card p-6 space-y-4">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-atlas-primary">Properti Tenant</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="p-3.5 bg-atlas-surface border border-atlas-border/50 rounded-input">
                                    <p className="text-[10px] text-atlas-secondary uppercase font-bold tracking-wider mb-1">ID Tenant</p>
                                    <p className="font-mono text-atlas-primary select-all break-all">{tenant.id}</p>
                                </div>
                                <div className="p-3.5 bg-atlas-surface border border-atlas-border/50 rounded-input">
                                    <p className="text-[10px] text-atlas-secondary uppercase font-bold tracking-wider mb-1">Dibuat Pada</p>
                                    <p className="font-mono text-atlas-primary">{new Date(tenant.created_at).toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Settings (Inline edit for profile name) */}
                        <div className="bg-atlas-card border border-atlas-border rounded-card p-6">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-atlas-primary mb-4">Pengaturan Profil</h2>
                            <form onSubmit={handleUpdateSettings} className="space-y-4 text-xs">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1">Nama Project</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50"
                                    />
                                    {errors.name && <p className="text-atlas-danger mt-1 font-mono text-[10px]">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1">Kategori Tipe</label>
                                    <input
                                        type="text"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full px-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50"
                                    />
                                    {errors.type && <p className="text-atlas-danger mt-1 font-mono text-[10px]">{errors.type}</p>}
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1">Status Keaktifan</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full bg-atlas-surface border border-atlas-border rounded-input px-3 py-2 text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    {errors.status && <p className="text-atlas-danger mt-1 font-mono text-[10px]">{errors.status}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-2.5 rounded-button bg-atlas-accent text-atlas-bg font-semibold hover:bg-atlas-accent/90 transition-all active:scale-95 disabled:opacity-40"
                                >
                                    {processing ? 'Menyimpan...' : 'Perbarui Profil'}
                                </button>
                            </form>
                        </div>
                    </div>
                </Tabs.Content>

                {/* TAB API KEYS */}
                <Tabs.Content value="apikeys" className="space-y-4 focus:outline-none">
                    <div className="bg-atlas-card border border-atlas-border rounded-card p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <Key className="h-4 w-4 text-atlas-accent" />
                                <h2 className="text-xs font-bold uppercase tracking-wider text-atlas-primary">API Credentials</h2>
                            </div>
                            <Link
                                href={`/api-keys?tenant_id=${tenant.id}`}
                                className="h-8 px-3 rounded-button border border-atlas-border bg-atlas-surface text-[11px] font-semibold text-atlas-secondary hover:text-atlas-primary hover:bg-atlas-hover transition-colors flex items-center gap-1"
                            >
                                <span>Kelola Kredensial</span>
                            </Link>
                        </div>

                        {apiKeys.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-atlas-border bg-atlas-surface text-[10px] uppercase font-bold tracking-wider text-atlas-secondary">
                                            <th className="px-6 py-3">Nama Key</th>
                                            <th className="px-6 py-3">Preview Key</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Dibuat</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-atlas-border/40 text-atlas-secondary">
                                        {apiKeys.data.map((key) => (
                                            <tr key={key.id} className="hover:bg-atlas-hover/50 transition-colors">
                                                <td className="px-6 py-3 font-semibold text-atlas-primary">{key.label}</td>
                                                <td className="px-6 py-3 font-mono text-[11px] select-all">{key.key_preview}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
                                                        key.status === 'active' 
                                                            ? 'text-atlas-success bg-atlas-success/10 border-atlas-success/20' 
                                                            : 'text-atlas-secondary bg-atlas-surface border-atlas-border'
                                                    }`}>
                                                        {key.status === 'active' ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 font-mono text-[10px]">
                                                    {new Date(key.created_at).toLocaleDateString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState
                                icon={Key}
                                title="Belum ada API Key terdaftar"
                                description="Buka panel kredensial untuk men-generate API key perdana bagi project ini."
                                action={
                                    <Link
                                        href={`/api-keys?tenant_id=${tenant.id}`}
                                        className="h-8 px-4 rounded-button bg-atlas-accent text-atlas-bg text-[11px] font-semibold hover:bg-atlas-accent/90 transition-all flex items-center gap-1"
                                    >
                                        <span>Buat Kredensial Baru</span>
                                    </Link>
                                }
                            />
                        )}
                    </div>
                </Tabs.Content>

                {/* TAB LOGS (Redirect link) */}
                <Tabs.Content value="logs" className="focus:outline-none">
                    <div className="bg-atlas-card border border-atlas-border rounded-card p-6 flex flex-col items-center justify-center py-16 text-center gap-4">
                        <ClockCounterClockwise className="h-10 w-10 text-atlas-secondary" />
                        <div>
                            <h3 className="text-sm font-bold text-atlas-primary">Logs Transaksi Terjemahan</h3>
                            <p className="text-xs text-atlas-secondary mt-1 max-w-sm leading-relaxed">
                                Seluruh rekaman audit log transaksi terjemahan terkelola secara eksternal dalam menu monitoring log global.
                            </p>
                        </div>
                        <Link
                            href={`/logs?tenant_id=${tenant.id}`}
                            className="h-9 px-4 rounded-button bg-atlas-accent text-atlas-bg text-xs font-semibold hover:bg-atlas-accent/90 transition-all flex items-center gap-1.5"
                        >
                            <span>Periksa Logs Tenant</span>
                            <CaretLeft className="h-4 w-4 rotate-180" />
                        </Link>
                    </div>
                </Tabs.Content>

                {/* TAB ANALYTICS (Redirect link) */}
                <Tabs.Content value="analytics" className="focus:outline-none">
                    <div className="bg-atlas-card border border-atlas-border rounded-card p-6 flex flex-col items-center justify-center py-16 text-center gap-4">
                        <ChartBar className="h-10 w-10 text-atlas-secondary" />
                        <div>
                            <h3 className="text-sm font-bold text-atlas-primary">Statistik & Analisis Biaya</h3>
                            <p className="text-xs text-atlas-secondary mt-1 max-w-sm leading-relaxed">
                                Periksa perbandingan cache hit rate, sebaran log, dan akumulasi token provider pada platform analytics.
                            </p>
                        </div>
                        <Link
                            href={`/analytics?tenant_id=${tenant.id}`}
                            className="h-9 px-4 rounded-button bg-atlas-accent text-atlas-bg text-xs font-semibold hover:bg-atlas-accent/90 transition-all flex items-center gap-1.5"
                        >
                            <span>Buka Dashboard Analisis</span>
                            <CaretLeft className="h-4 w-4 rotate-180" />
                        </Link>
                    </div>
                </Tabs.Content>
            </Tabs.Root>
        </div>
    );
}
