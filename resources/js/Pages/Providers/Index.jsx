import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Switch from '@radix-ui/react-switch';
import { 
    Plus, 
    PencilSimple, 
    Trash, 
    X, 
    HardDrive, 
    Pulse, 
    Coins, 
    Gear,
    Check
} from '@phosphor-icons/react';
import { EmptyState } from '../../Components/ui/EmptyState';
import { SpotlightCard } from '../../Components/decorative/SpotlightCard';

export default function Index({ providers }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Form inputs setups
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        role: 'fallback',
        api_url: '',
        api_key_plain: '',
        pricing_formula: {
            unit: 'per_token',
            rate: 0.0001
        },
        config: {
            model: ''
        },
        is_active: true
    });

    const openCreate = () => {
        clearErrors();
        reset();
        setEditingProvider(null);
        setModalOpen(true);
    };

    const openEdit = (provider) => {
        clearErrors();
        setEditingProvider(provider);
        setData({
            name: provider.name,
            role: provider.role,
            api_url: provider.api_url,
            api_key_plain: '', // Leave blank to preserve existing key
            pricing_formula: {
                unit: provider.pricing_formula?.unit || 'per_token',
                rate: provider.pricing_formula?.rate || 0.0001
            },
            config: {
                model: provider.config?.model || ''
            },
            is_active: provider.is_active
        });
        setModalOpen(true);
    };

    const handleToggleActive = (provider) => {
        // Simple PUT request to toggle is_active directly on click
        router.put(route('providers.update', provider.id), {
            name: provider.name,
            role: provider.role,
            api_url: provider.api_url,
            is_active: !provider.is_active
        });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (editingProvider) {
            put(route('providers.update', editingProvider.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                }
            });
        } else {
            post(route('providers.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        destroy(route('providers.destroy', deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null)
        });
    };

    return (
        <div className="space-y-6 select-none">
            <Head title="AI Translation Engines" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-atlas-border/50 pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-atlas-primary">AI Translation Engines</h1>
                    <p className="text-sm text-atlas-secondary mt-1">Konfigurasi dan kelola model engine penerjemahan AI</p>
                </div>
                <button
                    onClick={openCreate}
                    className="h-9 px-4 rounded-button bg-atlas-accent text-atlas-bg text-xs font-semibold hover:bg-atlas-accent/90 transition-all active:scale-95 flex items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-atlas-accent/40"
                >
                    <Plus className="h-4 w-4" />
                    <span>Model Engine Baru</span>
                </button>
            </div>

            {/* Grid display layout */}
            {providers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {providers.map((prov) => {
                        const CardWrapper = prov.name.toLowerCase().includes('sumopod') ? SpotlightCard : 'div';
                        
                        return (
                            <CardWrapper 
                                key={prov.id} 
                                className={prov.name.toLowerCase().includes('sumopod') 
                                    ? "flex flex-col justify-between hover:border-atlas-border/80 transition-all duration-300 relative group"
                                    : "bg-atlas-card border border-atlas-border rounded-card p-6 flex flex-col justify-between hover:border-atlas-border/80 transition-all duration-300 relative group"
                                }
                            >
                                {/* Role badge top right */}
                                <span className={`absolute top-6 right-6 text-[9px] uppercase font-bold font-mono tracking-wider px-2 py-0.5 rounded-full border ${
                                    prov.role === 'primary' 
                                        ? 'text-atlas-accent bg-atlas-accent/10 border-atlas-accent/20' 
                                        : 'text-atlas-secondary bg-atlas-surface border-atlas-border'
                                }`}>
                                    {prov.role}
                                </span>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-atlas-surface border border-atlas-border flex items-center justify-center text-atlas-secondary">
                                            <HardDrive className="h-4.5 w-4.5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-atlas-primary">{prov.name}</h3>
                                            <p className="text-[10px] text-atlas-secondary font-mono mt-0.5 truncate max-w-[200px] sm:max-w-[280px]">
                                                {prov.api_url}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 pt-4 border-t border-atlas-border/40 text-xs text-atlas-secondary">
                                        {/* Target Model */}
                                        <div className="flex items-center gap-2">
                                            <Gear className="h-3.5 w-3.5 text-atlas-secondary" />
                                            <span>Model Target: </span>
                                            <span className="font-mono text-atlas-primary bg-atlas-surface border border-atlas-border px-1.5 py-0.5 rounded text-[10px]">
                                                {prov.config?.model || 'default'}
                                            </span>
                                        </div>

                                        {/* Pricing Formula */}
                                        <div className="flex items-center gap-2">
                                            <Coins className="h-3.5 w-3.5 text-atlas-secondary" />
                                            <span>Formula Tarif: </span>
                                            <span className="font-mono text-atlas-primary bg-atlas-surface border border-atlas-border px-1.5 py-0.5 rounded text-[10px]">
                                                {prov.pricing_formula 
                                                    ? `$${prov.pricing_formula.rate} / ${
                                                        prov.pricing_formula.unit === 'per_1m_token'
                                                            ? '1M tokens'
                                                            : prov.pricing_formula.unit === 'per_token'
                                                            ? 'token'
                                                            : 'karakter'
                                                      }`
                                                    : '—'
                                                }
                                            </span>
                                        </div>

                                        {/* Toggle Active Switch */}
                                        <div className="flex items-center justify-between pt-1">
                                            <div className="flex items-center gap-2">
                                                <Pulse className="h-3.5 w-3.5 text-atlas-secondary" />
                                                <span>Status Integrasi</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <span className={`text-[10px] font-semibold font-mono ${prov.is_active ? 'text-atlas-accent' : 'text-atlas-secondary'}`}>
                                                    {prov.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                                <Switch.Root
                                                    checked={prov.is_active}
                                                    onCheckedChange={() => handleToggleActive(prov)}
                                                    className="w-8 h-4 bg-atlas-surface border border-atlas-border rounded-full relative data-[state=checked]:bg-atlas-accent/20 data-[state=checked]:border-atlas-accent/40 outline-none cursor-pointer transition-colors"
                                                >
                                                    <Switch.Thumb className="block w-2.5 h-2.5 bg-atlas-secondary data-[state=checked]:bg-atlas-accent rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[16px]" />
                                                </Switch.Root>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            {/* Actions controls */}
                            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-atlas-border/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEdit(prov)}
                                    className="h-8 px-3 rounded-button border border-atlas-border bg-atlas-surface hover:bg-atlas-hover text-[11px] font-semibold text-atlas-secondary hover:text-atlas-primary flex items-center gap-1 transition-colors"
                                >
                                    <PencilSimple className="h-3.5 w-3.5" />
                                    <span>Ubah</span>
                                </button>
                                <button
                                    onClick={() => setDeleteTarget(prov)}
                                    disabled={prov.is_active}
                                    className="h-8 px-3 rounded-button border border-atlas-border bg-atlas-surface hover:bg-atlas-danger/10 text-[11px] font-semibold text-atlas-secondary hover:text-atlas-danger flex items-center gap-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <Trash className="h-3.5 w-3.5" />
                                    <span>Hapus</span>
                                </button>
                            </div>
                        </CardWrapper>
                    );
                })}
                </div>
            ) : (
                <EmptyState
                    icon={Server}
                    title="Belum ada AI Engine Provider"
                    description="Tambahkan engine AI penerjemahan API eksternal (seperti SumoPod) untuk mengaktifkan traffic penerjemahan backend."
                    action={
                        <button
                            onClick={openCreate}
                            className="h-8 px-4 rounded-button bg-atlas-accent text-atlas-bg text-[11px] font-semibold hover:bg-atlas-accent/90 transition-all active:scale-95 flex items-center gap-1"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Daftarkan Provider</span>
                        </button>
                    }
                />
            )}

            {/* Create/Edit Provider Dialog Modal */}
            <Dialog.Root open={modalOpen} onOpenChange={(val) => !val && setModalOpen(false)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-40 bg-atlas-overlay backdrop-blur-sm transition-opacity" />
                    <Dialog.Content className="fixed top-[15%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] bg-atlas-card border border-atlas-border rounded-card p-6 shadow-2xl focus:outline-none">
                        <div className="flex items-center justify-between mb-5">
                            <Dialog.Title className="text-sm font-bold text-atlas-primary">
                                {editingProvider ? 'Edit Data Engine Provider' : 'Daftarkan Engine Provider Baru'}
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="h-7 w-7 text-atlas-secondary hover:text-atlas-primary rounded-lg flex items-center justify-center">
                                    <X className="h-4 w-4" />
                                </button>
                            </Dialog.Close>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                        Nama Engine
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: SumoPod, Gemini"
                                        className="w-full px-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50"
                                    />
                                    {errors.name && <p className="text-atlas-danger mt-1 font-mono text-[10px]">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                        Prefix / Target Model
                                    </label>
                                    <input
                                        type="text"
                                        value={data.config.model}
                                        onChange={(e) => setData('config', {
                                            ...data.config,
                                            model: e.target.value
                                        })}
                                        placeholder="gemini/gemini-3.1-flash"
                                        className="w-full px-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50"
                                    />
                                    {errors['config.model'] && <p className="text-atlas-danger mt-1 font-mono text-[10px]">{errors['config.model']}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                    Peran / Role Gateway
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="w-full bg-atlas-surface border border-atlas-border rounded-input px-3 py-2 text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs"
                                >
                                    <option value="primary">Primary Engine</option>
                                    <option value="fallback">Fallback Engine</option>
                                </select>
                                {errors.role && <p className="text-atlas-danger mt-1 font-mono text-[10px]">{errors.role}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                    API Target Endpoint URL
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={data.api_url}
                                    onChange={(e) => setData('api_url', e.target.value)}
                                    placeholder="https://ai.sumopod.com/v1"
                                    className="w-full px-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50"
                                />
                                {errors.api_url && <p className="text-atlas-danger mt-1 font-mono text-[10px]">{errors.api_url}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                    API Key Kredensial
                                </label>
                                <input
                                    type="password"
                                    value={data.api_key_plain}
                                    onChange={(e) => setData('api_key_plain', e.target.value)}
                                    placeholder={editingProvider ? '••••••••' : 'Ketik API key...'}
                                    autoComplete="off"
                                    className="w-full px-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50"
                                />
                                {editingProvider && (
                                    <span className="text-[10px] text-atlas-secondary mt-1 block">Biarkan kosong untuk mempertahankan API key saat ini.</span>
                                )}
                                {errors.api_key_plain && <p className="text-atlas-danger mt-1 font-mono text-[10px]">{errors.api_key_plain}</p>}
                            </div>

                            {/* Pricing Formula */}
                            <div className="bg-atlas-surface border border-atlas-border rounded-input p-3 space-y-3">
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary">
                                    Formula Tarif Finansial
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[9px] text-atlas-secondary mb-1">Tipe Unit</label>
                                        <select
                                            value={data.pricing_formula.unit}
                                            onChange={(e) => setData('pricing_formula', {
                                                ...data.pricing_formula,
                                                unit: e.target.value
                                            })}
                                            className="w-full bg-atlas-card border border-atlas-border rounded-input px-2 py-1 text-atlas-primary outline-none text-xs focus:border-atlas-accent/50"
                                        >
                                            <option value="per_1m_token">Per 1M Token (USD)</option>
                                            <option value="per_token">Per Token (USD)</option>
                                            <option value="per_char">Per Karakter (USD)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] text-atlas-secondary mb-1">Tarif (USD)</label>
                                        <input
                                            type="number"
                                            step="0.00000001"
                                            min="0"
                                            value={data.pricing_formula.rate}
                                            onChange={(e) => setData('pricing_formula', {
                                                ...data.pricing_formula,
                                                rate: parseFloat(e.target.value) || 0
                                            })}
                                            className="w-full px-2 py-1 bg-atlas-card border border-atlas-border rounded-input text-atlas-primary outline-none text-xs focus:border-atlas-accent/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2.5 pt-4 border-t border-atlas-border/50">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded-button bg-atlas-surface border border-atlas-border text-atlas-secondary hover:text-atlas-primary transition-all active:scale-95"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 rounded-button bg-atlas-accent text-atlas-bg font-semibold hover:bg-atlas-accent/90 transition-all active:scale-95 disabled:opacity-40"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Engine'}
                                </button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Delete Provider AlertDialog */}
            <AlertDialog.Root open={!!deleteTarget} onOpenChange={(val) => !val && setDeleteTarget(null)}>
                <AlertDialog.Portal>
                    <AlertDialog.Overlay className="fixed inset-0 z-40 bg-atlas-overlay backdrop-blur-sm" />
                    <AlertDialog.Content className="fixed top-[20%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] bg-atlas-card border border-atlas-border rounded-card p-6 shadow-2xl focus:outline-none">
                        <AlertDialog.Title className="text-sm font-bold text-atlas-danger mb-2">
                            Hapus Provider "{deleteTarget?.name}"?
                        </AlertDialog.Title>
                        <AlertDialog.Description className="text-xs text-atlas-secondary leading-relaxed mb-5">
                            Menghapus provider ini akan melenyapkan konfigurasinya secara permanen. Pastikan engine tidak dalam kondisi aktif sebelum dihapus. Tindakan ini tidak dapat dibatalkan.
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
