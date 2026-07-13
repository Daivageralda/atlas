import React, { useEffect, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import * as Dialog from '@radix-ui/react-dialog';
import {
    Pulse,
    ArrowsCounterClockwise,
    Clock,
    Play,
    CheckCircleIcon,
    XCircleIcon,
    WarningCircle,
    CircleNotch,
    Eye,
    X
} from '@phosphor-icons/react';
import { EmptyState } from '../../Components/ui/EmptyState';

export default function Index({ jobs, counts }) {
    const [confirmRetryId, setConfirmRetryId] = useState(null);
    const [detailJob, setDetailJob] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const { post, processing } = useForm();

    // Auto refresh data every 15 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['jobs', 'counts'],
                preserveState: true,
                preserveScroll: true
            });
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const handleRetrySubmit = (jobId) => {
        post(route('queue.retry', jobId), {
            onSuccess: () => {
                setConfirmRetryId(null);
            }
        });
    };

    const openDetailModal = (job) => {
        setDetailJob(job);
        setDetailModalOpen(true);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold font-sans tracking-wider bg-atlas-warning/10 text-atlas-warning border border-atlas-warning/20">
                        <Clock className="h-3 w-3" />
                        PENDING
                    </span>
                );
            case 'running':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold font-sans tracking-wider bg-atlas-info/10 text-atlas-info border border-atlas-info/20 animate-pulse">
                        <CircleNotch className="h-3 w-3 animate-spin" />
                        RUNNING
                    </span>
                );
            case 'success':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold font-sans tracking-wider bg-atlas-success/10 text-atlas-success border border-atlas-success/20">
                        <CheckCircleIcon className="h-3 w-3" />
                        SUCCESS
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold font-sans tracking-wider bg-atlas-danger/10 text-atlas-danger border border-atlas-danger/20">
                        <XCircleIcon className="h-3 w-3" />
                        FAILED
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold font-sans tracking-wider bg-atlas-disabled/10 text-atlas-disabled border border-atlas-disabled/20">
                        UNKNOWN
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 select-none">
            <Head title="Queue Monitor" />

            {/* Header */}
            <div className="border-b border-atlas-border/50 pb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-atlas-accent/10 border border-atlas-accent/25 flex items-center justify-center text-atlas-accent">
                        <Pulse className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-atlas-primary">Queue Monitor</h1>
                        <p className="text-xs text-atlas-secondary mt-0.5">Pemantauan antrean proses transaksi dan webhook QStash</p>
                    </div>
                </div>

                <button
                    onClick={() => router.reload({ only: ['jobs', 'counts'], preserveScroll: true })}
                    className="p-2 rounded-button bg-atlas-card border border-atlas-border text-atlas-secondary hover:text-atlas-primary hover:bg-atlas-hover transition-colors"
                    title="Refresh data antrean"
                >
                    <ArrowsCounterClockwise className="h-4 w-4" />
                </button>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Pending */}
                <div className="bg-atlas-card border border-atlas-border rounded-card p-4 transition-all hover:border-atlas-border/80">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-atlas-secondary">Pending Jobs</p>
                    <p className="text-2xl font-bold text-atlas-warning mt-2 font-sans">{counts.pending}</p>
                </div>

                {/* Running */}
                <div className="bg-atlas-card border border-atlas-border rounded-card p-4 transition-all hover:border-atlas-border/80">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-atlas-secondary">Running Jobs</p>
                    <p className="text-2xl font-bold text-atlas-info mt-2 font-sans">{counts.running}</p>
                </div>

                {/* Success */}
                <div className="bg-atlas-card border border-atlas-border rounded-card p-4 transition-all hover:border-atlas-border/80">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-atlas-secondary">Success Jobs</p>
                    <p className="text-2xl font-bold text-atlas-success mt-2 font-sans">{counts.success}</p>
                </div>

                {/* Failed */}
                <div className="bg-atlas-card border border-atlas-border rounded-card p-4 transition-all hover:border-atlas-border/80">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-atlas-secondary">Failed Jobs</p>
                    <p className="text-2xl font-bold text-atlas-danger mt-2 font-sans">{counts.failed}</p>
                </div>
            </div>

            {/* Table layout */}
            <div className="bg-atlas-card border border-atlas-border rounded-card overflow-hidden">
                {jobs.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b border-atlas-border bg-atlas-surface text-[10px] uppercase font-bold tracking-wider text-atlas-secondary">
                                    <th className="px-6 py-4">Job ID</th>
                                    <th className="px-6 py-4">Tipe Job</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Retries</th>
                                    <th className="px-6 py-4">Pesan Error</th>
                                    <th className="px-6 py-4">Waktu Dibuat</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-atlas-border/50 text-atlas-secondary">
                                {jobs.data.map((job) => (
                                    <tr
                                        key={job.id}
                                        className="hover:bg-atlas-hover/30 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-3.5 font-sans text-[11px] text-atlas-primary font-semibold">
                                            {job.id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className="font-sans text-[10px] text-atlas-primary">
                                                {job.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            {getStatusBadge(job.status)}
                                        </td>
                                        <td className="px-6 py-3.5 font-sans text-[10px]">
                                            {job.retry_count}
                                        </td>
                                        <td className="px-6 py-3.5 max-w-[240px] truncate text-[10px] font-sans text-atlas-danger" title={job.error}>
                                            {job.error || '—'}
                                        </td>
                                        <td className="px-6 py-3.5 text-[10px]">
                                            {new Date(job.created_at).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openDetailModal(job)}
                                                    className="p-1 text-atlas-secondary hover:text-atlas-primary hover:bg-atlas-surface rounded"
                                                    title="Lihat detail payload & error"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </button>

                                                {(job.status === 'failed' || job.error) && (
                                                    confirmRetryId === job.id ? (
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() => setConfirmRetryId(null)}
                                                                className="px-2 py-1 text-[10px] rounded-button bg-atlas-surface border border-atlas-border text-atlas-secondary hover:text-atlas-primary transition-all font-semibold"
                                                            >
                                                                Batal
                                                            </button>
                                                            <button
                                                                disabled={processing}
                                                                onClick={() => handleRetrySubmit(job.id)}
                                                                className="px-2 py-1 text-[10px] rounded-button bg-atlas-accent text-atlas-bg font-bold transition-all active:scale-95 disabled:opacity-40"
                                                            >
                                                                Kirim Ulang
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmRetryId(job.id)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded bg-atlas-accent/10 border border-atlas-accent/20 text-atlas-accent hover:bg-atlas-accent/20 transition-all"
                                                        >
                                                            <Play className="h-2.5 w-2.5" />
                                                            Retry
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-8">
                        <EmptyState
                            icon={Pulse}
                            title="Antrean job kosong"
                            description="Belum ada proses background job yang sedang berjalan atau mengantre di database."
                        />
                    </div>
                )}
            </div>

            {/* Detail Job Dialog Modal */}
            <Dialog.Root open={detailModalOpen} onOpenChange={(val) => !val && setDetailModalOpen(false)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-40 bg-atlas-overlay backdrop-blur-sm transition-opacity" />
                    <Dialog.Content className="fixed top-[15%] left-[50%] z-50 w-full max-w-lg translate-x-[-50%] bg-atlas-card border border-atlas-border rounded-card p-6 shadow-2xl focus:outline-none">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2 text-atlas-accent">
                                <Pulse className="h-4.5 w-4.5" />
                                <Dialog.Title className="text-sm font-bold text-atlas-primary">
                                    Detail Background Job
                                </Dialog.Title>
                            </div>
                            <Dialog.Close asChild>
                                <button className="h-7 w-7 text-atlas-secondary hover:text-atlas-primary rounded-lg flex items-center justify-center">
                                    <X className="h-4 w-4" />
                                </button>
                            </Dialog.Close>
                        </div>

                        {detailJob && (
                            <div className="space-y-4 text-xs">
                                <div>
                                    <span className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1">
                                        Job ID (ULID)
                                    </span>
                                    <span className="font-sans text-atlas-primary select-all text-[11px]">
                                        {detailJob.id}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1">
                                            Status
                                        </span>
                                        {getStatusBadge(detailJob.status)}
                                    </div>
                                    <div>
                                        <span className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1">
                                            Retries Count
                                        </span>
                                        <span className="font-sans text-atlas-primary text-[11px]">
                                            {detailJob.retry_count} kali
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <span className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1">
                                        Payload (JSON)
                                    </span>
                                    <pre className="p-3 bg-atlas-surface border border-atlas-border/50 rounded-input text-atlas-primary font-sans text-[10px] max-h-[140px] overflow-y-auto select-text break-words">
                                        {JSON.stringify(detailJob.payload, null, 2)}
                                    </pre>
                                </div>

                                {detailJob.error && (
                                    <div>
                                        <span className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1">
                                            Error Trace / Message
                                        </span>
                                        <pre className="p-3 bg-atlas-surface border border-atlas-border/50 rounded-input text-atlas-danger font-sans text-[10px] max-h-[140px] overflow-y-auto select-text break-words whitespace-pre-wrap">
                                            {detailJob.error}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
