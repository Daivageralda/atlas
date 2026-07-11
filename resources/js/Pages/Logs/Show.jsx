import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    ChevronLeft, 
    Copy, 
    Check, 
    Server, 
    Clock, 
    Activity, 
    Coins, 
    ArrowRight, 
    FileText,
    AlertCircle,
    Building2,
    Key
} from 'lucide-react';

export default function Show({ log }) {
    const [copiedRequest, setCopiedRequest] = useState(false);
    const [copiedResponse, setCopiedResponse] = useState(false);

    const handleCopy = (text, setCopied) => {
        if (!text) return;
        const rawString = typeof text === 'object' ? JSON.stringify(text, null, 2) : text;
        navigator.clipboard.writeText(rawString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 select-none">
            <Head title={`Log Detail — ${log.id}`} />

            {/* Breadcrumb Header */}
            <div className="border-b border-atlas-border/50 pb-6">
                <Link
                    href={route('logs.index')}
                    className="inline-flex items-center gap-1.5 text-xs text-atlas-secondary hover:text-atlas-accent font-medium mb-3 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Kembali ke Logs</span>
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-atlas-accent/10 border border-atlas-accent/25 flex items-center justify-center text-atlas-accent">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-atlas-primary">Audit Detail Transaksi</h1>
                            <p className="text-xs font-mono text-atlas-secondary mt-0.5 select-all">UUID: {log.id}</p>
                        </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        log.status === 'success' 
                            ? 'text-atlas-success bg-atlas-success/10 border-atlas-success/20' 
                            : log.status === 'cached'
                            ? 'text-atlas-accent bg-atlas-accent/10 border-atlas-accent/20'
                            : 'text-atlas-danger bg-atlas-danger/10 border-atlas-danger/20'
                    }`}>
                        {log.status}
                    </span>
                </div>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left metadata card: 2 columns wide */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {/* Cost */}
                        <div className="bg-atlas-card border border-atlas-border rounded-card p-4">
                            <p className="text-[10px] text-atlas-secondary uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                                <Coins className="h-3.5 w-3.5" />
                                <span>Estimasi Biaya</span>
                            </p>
                            <p className="font-mono text-base font-bold text-atlas-primary">
                                {log.estimated_cost > 0 ? `$${log.estimated_cost.toFixed(6)}` : '—'}
                            </p>
                        </div>

                        {/* Duration */}
                        <div className="bg-atlas-card border border-atlas-border rounded-card p-4">
                            <p className="text-[10px] text-atlas-secondary uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Durasi Gateway</span>
                            </p>
                            <p className="font-mono text-base font-bold text-atlas-primary">{log.duration_ms}ms</p>
                        </div>

                        {/* Retries */}
                        <div className="bg-atlas-card border border-atlas-border rounded-card p-4">
                            <p className="text-[10px] text-atlas-secondary uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                                <Activity className="h-3.5 w-3.5" />
                                <span>Retries Attempt</span>
                            </p>
                            <p className="font-mono text-base font-bold text-atlas-primary">{log.retry_count}</p>
                        </div>

                        {/* Fallback Used */}
                        <div className="bg-atlas-card border border-atlas-border rounded-card p-4">
                            <p className="text-[10px] text-atlas-secondary uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                                <Server className="h-3.5 w-3.5" />
                                <span>Fallback Engine</span>
                            </p>
                            <p className="font-mono text-base font-bold text-atlas-primary">{log.fallback_used ? 'YES' : 'NO'}</p>
                        </div>
                    </div>

                    {/* Metadata details list */}
                    <div className="bg-atlas-card border border-atlas-border rounded-card p-6 space-y-4 text-xs">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-atlas-primary">Properties Rincian</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5 p-3 bg-atlas-surface border border-atlas-border/50 rounded-input">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-atlas-secondary flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    <span>Tenant Pemilik</span>
                                </span>
                                <p className="font-semibold text-atlas-primary">{log.tenant_name}</p>
                            </div>

                            <div className="space-y-1.5 p-3 bg-atlas-surface border border-atlas-border/50 rounded-input">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-atlas-secondary flex items-center gap-1">
                                    <Key className="h-3 w-3" />
                                    <span>Kredensial API Key</span>
                                </span>
                                <p className="font-semibold text-atlas-primary">{log.api_key_label}</p>
                            </div>

                            <div className="space-y-1.5 p-3 bg-atlas-surface border border-atlas-border/50 rounded-input">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-atlas-secondary">Bahasa Terjemahan</span>
                                <div className="flex items-center gap-1.5 font-mono text-[11px] text-atlas-primary">
                                    <span className="font-bold">{log.source_lang.toUpperCase()}</span>
                                    <ArrowRight className="h-3.5 w-3.5 text-atlas-secondary" />
                                    <span className="font-bold">{log.target_lang.toUpperCase()}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5 p-3 bg-atlas-surface border border-atlas-border/50 rounded-input">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-atlas-secondary">Format Content Type</span>
                                <p className="font-mono text-atlas-primary uppercase text-[10px] tracking-wider">{log.content_type}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right payloads columns: 1 column wide */}
                <div className="space-y-6">
                    {/* Error Alerts */}
                    {log.status === 'failed' && log.error_message && (
                        <div className="bg-atlas-danger/10 border border-atlas-danger/30 rounded-card p-5 flex gap-3 text-xs">
                            <AlertCircle className="h-5 w-5 text-atlas-danger flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <h4 className="font-bold text-atlas-danger">Error Execution</h4>
                                <p className="text-atlas-secondary font-mono leading-relaxed text-[11px]">
                                    {log.error_message}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Request Payload Metadata (Length log) */}
                    <div className="bg-atlas-card border border-atlas-border rounded-card p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-atlas-primary">Request Metadata</span>
                            <button
                                onClick={() => handleCopy(log.request_payload, setCopiedRequest)}
                                className="p-1.5 bg-atlas-surface hover:bg-atlas-hover border border-atlas-border rounded text-atlas-secondary hover:text-atlas-primary transition-colors"
                            >
                                {copiedRequest ? <Check className="h-3.5 w-3.5 text-atlas-success" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                        <pre className="p-3 bg-atlas-surface border border-atlas-border/50 rounded-input font-mono text-[11px] text-atlas-primary overflow-x-auto select-all max-h-[140px]">
                            {JSON.stringify(log.request_payload, null, 2)}
                        </pre>
                    </div>

                    {/* Response Payload (if success/cached) */}
                    {(log.status === 'success' || log.status === 'cached') && log.response_payload && (
                        <div className="bg-atlas-card border border-atlas-border rounded-card p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-atlas-primary">Response Payload</span>
                                <button
                                    onClick={() => handleCopy(log.response_payload, setCopiedResponse)}
                                    className="p-1.5 bg-atlas-surface hover:bg-atlas-hover border border-atlas-border rounded text-atlas-secondary hover:text-atlas-primary transition-colors"
                                >
                                    {copiedResponse ? <Check className="h-3.5 w-3.5 text-atlas-success" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                            <pre className="p-3 bg-atlas-surface border border-atlas-border/50 rounded-input font-mono text-[11px] text-atlas-primary overflow-x-auto select-all max-h-[180px]">
                                {JSON.stringify(log.response_payload, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
