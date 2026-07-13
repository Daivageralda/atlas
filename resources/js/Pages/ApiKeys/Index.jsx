import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { 
    Key, 
    Plus, 
    Trash, 
    ArrowsCounterClockwise, 
    Prohibit, 
    Copy, 
    Check, 
    X, 
    CaretLeft,
    Buildings,
    ShieldWarning
} from '@phosphor-icons/react';
import { EmptyState } from '../../Components/ui/EmptyState';

export default function Index({ tenant, apiKeys, tenants, auth, flash }) {
    const isAdmin = auth.user?.role === 'admin';
    const [createOpen, setCreateOpen] = useState(false);
    const [revealOpen, setRevealOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    
    // Action targets
    const [revokeTarget, setRevokeTarget] = useState(null);
    const [regenTarget, setRegenTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Form setups
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        label: '',
        scopes: 'translate',
        tenant_id: tenant?.id || ''
    });

    // Reveal-Once handler
    useEffect(() => {
        if (flash?.new_key) {
            setRevealOpen(true);
        }
    }, [flash?.new_key]);

    const handleCopy = () => {
        if (!flash?.new_key) return;
        navigator.clipboard.writeText(flash.new_key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('api-keys.store'), {
            onSuccess: () => {
                setCreateOpen(false);
                reset('label', 'scopes');
            }
        });
    };

    const handleRevoke = () => {
        if (!revokeTarget) return;
        router.post(route('api-keys.revoke', revokeTarget.id), {}, {
            onSuccess: () => setRevokeTarget(null)
        });
    };

    const handleRegenerate = () => {
        if (!regenTarget) return;
        router.post(route('api-keys.regenerate', regenTarget.id), {}, {
            onSuccess: () => setRegenTarget(null)
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('api-keys.destroy', deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null)
        });
    };

    return (
        <div className="space-y-6 select-none">
            <Head title="API Credentials" />

            {/* Breadcrumb Header */}
            <div className="border-b border-atlas-border/50 pb-6">
                {tenant && (
                    <Link
                        href={route('tenants.show', tenant.id)}
                        className="inline-flex items-center gap-1.5 text-xs text-atlas-secondary hover:text-atlas-accent font-medium mb-3 transition-colors"
                    >
                        <CaretLeft className="h-4 w-4" />
                        <span>Kembali ke Tenant {tenant.name}</span>
                    </Link>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-atlas-accent/10 border border-atlas-accent/25 flex items-center justify-center text-atlas-accent">
                            <Key className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-atlas-primary">
                                {tenant ? `API Keys — ${tenant.name}` : 'API Credentials'}
                            </h1>
                            <p className="text-xs text-atlas-secondary mt-0.5">Kelola kredensial token client pengakses gateway terjemahan</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            clearErrors();
                            setData({
                                label: '',
                                scopes: 'translate',
                                tenant_id: tenant?.id || ''
                            });
                            setCreateOpen(true);
                        }}
                        className="h-9 px-4 rounded-button bg-atlas-accent text-atlas-bg text-xs font-semibold hover:bg-atlas-accent/90 transition-all active:scale-95 flex items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-atlas-accent/40"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Kredensial Baru</span>
                    </button>
                </div>
            </div>

            {/* Table layout */}
            <div className="bg-atlas-card border border-atlas-border rounded-card overflow-hidden">
                {apiKeys.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b border-atlas-border bg-atlas-surface text-[10px] uppercase font-bold tracking-wider text-atlas-secondary">
                                    <th className="px-6 py-4">Nama Key</th>
                                    <th className="px-6 py-4">Preview Token</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Scopes</th>
                                    <th className="px-6 py-4">Terakhir Digunakan</th>
                                    <th className="px-6 py-4">Dibuat</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-atlas-border/50 text-atlas-secondary">
                                {apiKeys.data.map((key) => (
                                    <tr key={key.id} className="hover:bg-atlas-hover transition-colors duration-150">
                                        <td className="px-6 py-4 font-semibold text-atlas-primary">{key.label}</td>
                                        <td className="px-6 py-4 font-sans text-[11px] select-all">{key.key_preview}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                key.status === 'active' 
                                                    ? 'text-atlas-success bg-atlas-success/10 border-atlas-success/20' 
                                                    : 'text-atlas-secondary bg-atlas-surface border-atlas-border'
                                            }`}>
                                                {key.status === 'active' ? 'Active' : 'Revoked'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-sans text-[10px]">{key.scopes || 'translate'}</td>
                                        <td className="px-6 py-4 font-sans text-[11px]">
                                            {key.last_used_at ? new Date(key.last_used_at).toLocaleString('id-ID') : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 font-sans text-[11px]">
                                            {new Date(key.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2.5">
                                                {key.status === 'active' && (
                                                    <>
                                                        <button
                                                            onClick={() => setRegenTarget(key)}
                                                            className="p-1.5 text-atlas-secondary hover:text-atlas-primary rounded hover:bg-atlas-surface transition-colors"
                                                            title="Regenerate Key"
                                                        >
                                                            <ArrowsCounterClockwise className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setRevokeTarget(key)}
                                                            className="p-1.5 text-atlas-secondary hover:text-atlas-warning rounded hover:bg-atlas-warning/10 transition-colors"
                                                            title="Nonaktifkan Key"
                                                        >
                                                            <Prohibit className="h-3.5 w-3.5" />
                                                        </button>
                                                    </>
                                                )}
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => setDeleteTarget(key)}
                                                        className="p-1.5 text-atlas-secondary hover:text-atlas-danger rounded hover:bg-atlas-danger/10 transition-colors"
                                                        title="Hapus Key"
                                                    >
                                                        <Trash className="h-3.5 w-3.5" />
                                                    </button>
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
                            icon={Key}
                            title="Belum ada API Key terdaftar"
                            description="Buat API key perdana untuk memulai integrasi backend client pengakses gateway terjemahan."
                            action={
                                <button
                                    onClick={() => setCreateOpen(true)}
                                    className="h-8 px-4 rounded-button bg-atlas-accent text-atlas-bg text-[11px] font-semibold hover:bg-atlas-accent/90 transition-all active:scale-95 flex items-center gap-1"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>Buat Kredensial</span>
                                </button>
                            }
                        />
                    </div>
                )}
            </div>

            {/* Create API Key Radix Dialog Modal */}
            <Dialog.Root open={createOpen} onOpenChange={(val) => !val && setCreateOpen(false)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-40 bg-atlas-overlay backdrop-blur-sm transition-opacity" />
                    <Dialog.Content className="fixed top-[20%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] bg-atlas-card border border-atlas-border rounded-card p-6 shadow-2xl focus:outline-none">
                        <div className="flex items-center justify-between mb-5">
                            <Dialog.Title className="text-sm font-bold text-atlas-primary">
                                Daftarkan API Key Baru
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="h-7 w-7 text-atlas-secondary hover:text-atlas-primary rounded-lg flex items-center justify-center">
                                    <X className="h-4 w-4" />
                                </button>
                            </Dialog.Close>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                            {isAdmin && !tenant && (
                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                        Pilih Tenant Project
                                    </label>
                                    <select
                                        required
                                        value={data.tenant_id}
                                        onChange={(e) => setData('tenant_id', e.target.value)}
                                        className="w-full bg-atlas-surface border border-atlas-border rounded-input px-3 py-2 text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs"
                                    >
                                        <option value="">Pilih Tenant...</option>
                                        {tenants.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    {errors.tenant_id && <p className="text-atlas-danger mt-1 font-sans text-[10px]">{errors.tenant_id}</p>}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                    Nama / Label Key
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.label}
                                    onChange={(e) => setData('label', e.target.value)}
                                    placeholder="Contoh: Production Environment, Staging"
                                    className="w-full px-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50"
                                />
                                {errors.label && <p className="text-atlas-danger mt-1 font-sans text-[10px]">{errors.label}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                    Scopes (Comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={data.scopes}
                                    onChange={(e) => setData('scopes', e.target.value)}
                                    placeholder="translate, memory.write"
                                    className="w-full px-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50"
                                />
                                {errors.scopes && <p className="text-atlas-danger mt-1 font-sans text-[10px]">{errors.scopes}</p>}
                            </div>

                            <div className="flex justify-end gap-2.5 pt-4 border-t border-atlas-border/50">
                                <button
                                    type="button"
                                    onClick={() => setCreateOpen(false)}
                                    className="px-4 py-2 rounded-button bg-atlas-surface border border-atlas-border text-atlas-secondary hover:text-atlas-primary transition-all active:scale-95"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 rounded-button bg-atlas-accent text-atlas-bg font-semibold hover:bg-atlas-accent/90 transition-all active:scale-95 disabled:opacity-40"
                                >
                                    {processing ? 'Mendaftarkan...' : 'Daftarkan Token'}
                                </button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Reveal-Once Key Display Modal */}
            <Dialog.Root open={revealOpen} onOpenChange={(val) => !val && setRevealOpen(false)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-40 bg-atlas-overlay backdrop-blur-md transition-opacity" />
                    <Dialog.Content 
                        onPointerDownOutside={(e) => e.preventDefault()}
                        onEscapeKeyDown={(e) => e.preventDefault()}
                        className="fixed top-[20%] left-[50%] z-50 w-full max-w-lg translate-x-[-50%] bg-atlas-card border border-atlas-border rounded-card p-6 shadow-2xl focus:outline-none"
                    >
                        <div className="flex items-center gap-2 mb-4 text-atlas-accent">
                            <ShieldWarning className="h-5 w-5 animate-pulse" />
                            <Dialog.Title className="text-sm font-bold text-atlas-primary">
                                API Key Berhasil Dibuat
                            </Dialog.Title>
                        </div>

                        <div className="p-4 bg-atlas-warning/10 border border-atlas-warning/30 rounded-input mb-5">
                            <p className="text-[11px] text-atlas-warning leading-relaxed font-semibold">
                                PERINGATAN: Simpan key ini sekarang. Demi keamanan, token ini hanya akan ditampilkan sekali ini saja dan tidak dapat diakses kembali di masa mendatang.
                            </p>
                        </div>

                        {flash?.new_key && (
                            <div className="flex items-center justify-between gap-3 p-3 bg-atlas-surface border border-atlas-border rounded-input font-sans text-xs mb-6 select-all break-all">
                                <span className="text-atlas-primary font-bold">{flash.new_key}</span>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 bg-atlas-card border border-atlas-border hover:bg-atlas-hover rounded-button text-atlas-secondary hover:text-atlas-primary transition-colors flex-shrink-0"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <Check className="h-4 w-4 text-atlas-success" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-atlas-border/50 text-xs">
                            <button
                                onClick={() => setRevealOpen(false)}
                                className="px-4 py-2 rounded-button bg-atlas-accent text-atlas-bg font-semibold hover:bg-atlas-accent/90 transition-all active:scale-95"
                            >
                                Selesai & Tutup
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Revoke API Key AlertDialog */}
            <AlertDialog.Root open={!!revokeTarget} onOpenChange={(val) => !val && setRevokeTarget(null)}>
                <AlertDialog.Portal>
                    <AlertDialog.Overlay className="fixed inset-0 z-40 bg-atlas-overlay backdrop-blur-sm" />
                    <AlertDialog.Content className="fixed top-[20%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] bg-atlas-card border border-atlas-border rounded-card p-6 shadow-2xl focus:outline-none">
                        <AlertDialog.Title className="text-sm font-bold text-atlas-warning mb-2">
                            Nonaktifkan API Key "{revokeTarget?.label}"?
                        </AlertDialog.Title>
                        <AlertDialog.Description className="text-xs text-atlas-secondary leading-relaxed mb-5">
                            Aplikasi backend client pengakses gateway terjemahan yang menggunakan token ini akan langsung tertolak. Tindakan penonaktifan ini aman dan dapat di-regenerate kembali di kemudian hari.
                        </AlertDialog.Description>
                        <div className="flex justify-end gap-2.5 pt-4 border-t border-atlas-border/50 text-xs">
                            <button
                                onClick={() => setRevokeTarget(null)}
                                className="px-4 py-2 rounded-button bg-atlas-surface border border-atlas-border text-atlas-secondary hover:text-atlas-primary transition-all active:scale-95"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleRevoke}
                                className="px-4 py-2 rounded-button bg-atlas-warning text-atlas-bg font-semibold hover:bg-atlas-warning/90 transition-all active:scale-95"
                            >
                                Nonaktifkan Token
                            </button>
                        </div>
                    </AlertDialog.Content>
                </AlertDialog.Portal>
            </AlertDialog.Root>

            {/* Regenerate API Key AlertDialog */}
            <AlertDialog.Root open={!!regenTarget} onOpenChange={(val) => !val && setRegenTarget(null)}>
                <AlertDialog.Portal>
                    <AlertDialog.Overlay className="fixed inset-0 z-40 bg-atlas-overlay backdrop-blur-sm" />
                    <AlertDialog.Content className="fixed top-[20%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] bg-atlas-card border border-atlas-border rounded-card p-6 shadow-2xl focus:outline-none">
                        <AlertDialog.Title className="text-sm font-bold text-atlas-primary mb-2">
                            Regenerate API Key "{regenTarget?.label}"?
                        </AlertDialog.Title>
                        <AlertDialog.Description className="text-xs text-atlas-secondary leading-relaxed mb-5">
                            Token API lama akan langsung hangus dan tidak berlaku lagi. Token baru yang dihasilkan akan kembali ditunjukkan sekali saja.
                        </AlertDialog.Description>
                        <div className="flex justify-end gap-2.5 pt-4 border-t border-atlas-border/50 text-xs">
                            <button
                                onClick={() => setRegenTarget(null)}
                                className="px-4 py-2 rounded-button bg-atlas-surface border border-atlas-border text-atlas-secondary hover:text-atlas-primary transition-all active:scale-95"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleRegenerate}
                                className="px-4 py-2 rounded-button bg-atlas-accent text-atlas-bg font-semibold hover:bg-atlas-accent/90 transition-all active:scale-95"
                            >
                                Regenerate Token
                            </button>
                        </div>
                    </AlertDialog.Content>
                </AlertDialog.Portal>
            </AlertDialog.Root>

            {/* Delete API Key AlertDialog */}
            <AlertDialog.Root open={!!deleteTarget} onOpenChange={(val) => !val && setDeleteTarget(null)}>
                <AlertDialog.Portal>
                    <AlertDialog.Overlay className="fixed inset-0 z-40 bg-atlas-overlay backdrop-blur-sm" />
                    <AlertDialog.Content className="fixed top-[20%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] bg-atlas-card border border-atlas-border rounded-card p-6 shadow-2xl focus:outline-none">
                        <AlertDialog.Title className="text-sm font-bold text-atlas-danger mb-2">
                            Hapus API Key "{deleteTarget?.label}"?
                        </AlertDialog.Title>
                        <AlertDialog.Description className="text-xs text-atlas-secondary leading-relaxed mb-5">
                            Menghapus kredensial ini akan melenyapkan token dari database secara permanen. Tindakan ini merusak integrasi client pengakses dan tidak dapat dibatalkan.
                        </AlertDialog.Description>
                        <div className="flex justify-end gap-2.5 pt-4 border-t border-atlas-border/50 text-xs">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 rounded-button bg-atlas-surface border border-atlas-border text-atlas-secondary hover:text-atlas-primary transition-all active:scale-95"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-button bg-atlas-danger text-white hover:bg-atlas-danger/90 font-semibold transition-all active:scale-95"
                            >
                                Hapus Permanen
                            </button>
                        </div>
                    </AlertDialog.Content>
                </AlertDialog.Portal>
            </AlertDialog.Root>
        </div>
    );
}
