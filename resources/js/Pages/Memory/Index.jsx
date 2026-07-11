import React, { useState, useEffect } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import * as Dialog from '@radix-ui/react-dialog';
import { 
    Database, 
    Search, 
    RefreshCcw, 
    Edit2, 
    X, 
    ArrowRight,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    Languages
} from 'lucide-react';
import { EmptyState } from '../../Components/ui/EmptyState';

export default function Index({ entries, filters, tenants, auth }) {
    const isAdmin = auth.user?.role === 'admin';
    const [search, setSearch] = useState(filters.search || '');
    const [tenantId, setTenantId] = useState(filters.tenant_id || '');
    const [sourceLang, setSourceLang] = useState(filters.source_lang || '');
    const [targetLang, setTargetLang] = useState(filters.target_lang || '');
    
    // Edit modal states
    const [editTarget, setEditTarget] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Form logic
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        translated_text: ''
    });

    const handleReset = () => {
        setSearch('');
        setTenantId('');
        setSourceLang('');
        setTargetLang('');
        router.get(route('memory.index'), {}, { replace: true, preserveState: true });
    };

    const applyFilters = () => {
        router.get(route('memory.index'), {
            search,
            tenant_id: tenantId,
            source_lang: sourceLang,
            target_lang: targetLang
        }, {
            replace: true,
            preserveState: true
        });
    };

    // Debounce text search query
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                applyFilters();
            }
        }, 450);
        return () => clearTimeout(timer);
    }, [search]);

    const openEditModal = (entry) => {
        clearErrors();
        setEditTarget(entry);
        setData('translated_text', entry.translated_text_full);
        setModalOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!editTarget) return;
        
        put(route('memory.update', editTarget.id), {
            onSuccess: () => {
                setModalOpen(false);
                setEditTarget(null);
                reset();
            }
        });
    };

    return (
        <div className="space-y-6 select-none">
            <Head title="Translation Memory" />

            {/* Header */}
            <div className="border-b border-atlas-border/50 pb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-atlas-accent/10 border border-atlas-accent/25 flex items-center justify-center text-atlas-accent">
                        <Database className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-atlas-primary">Translation Memory</h1>
                        <p className="text-xs text-atlas-secondary mt-0.5">Database cache glosarium hasil terjemahan untuk optimasi latensi</p>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-3 bg-atlas-card border border-atlas-border rounded-card p-4 text-xs">
                {/* Search */}
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-atlas-secondary" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari teks asal / terjemahan..."
                        className="w-full pl-9 pr-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50 placeholder:text-atlas-secondary/70 text-xs"
                    />
                </div>

                {/* Tenant Filter (Admin Only) */}
                {isAdmin ? (
                    <div>
                        <select
                            value={tenantId}
                            onChange={(e) => {
                                setTenantId(e.target.value);
                                router.get(route('memory.index'), { ...filters, tenant_id: e.target.value }, { replace: true, preserveState: true });
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

                {/* Source Lang */}
                <div>
                    <input
                        type="text"
                        maxLength="2"
                        value={sourceLang}
                        onChange={(e) => {
                            setSourceLang(e.target.value);
                            router.get(route('memory.index'), { ...filters, source_lang: e.target.value }, { replace: true, preserveState: true });
                        }}
                        placeholder="Asal (e.g. id)"
                        className="w-full px-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50 placeholder:text-atlas-secondary/70 text-xs text-center font-mono"
                    />
                </div>

                {/* Target Lang */}
                <div>
                    <input
                        type="text"
                        maxLength="2"
                        value={targetLang}
                        onChange={(e) => {
                            setTargetLang(e.target.value);
                            router.get(route('memory.index'), { ...filters, target_lang: e.target.value }, { replace: true, preserveState: true });
                        }}
                        placeholder="Target (e.g. en)"
                        className="w-full px-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50 placeholder:text-atlas-secondary/70 text-xs text-center font-mono"
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

            {/* List data table */}
            <div className="bg-atlas-card border border-atlas-border rounded-card overflow-hidden">
                {entries.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b border-atlas-border bg-atlas-surface text-[10px] uppercase font-bold tracking-wider text-atlas-secondary">
                                    {isAdmin && <th className="px-6 py-4">Tenant</th>}
                                    <th className="px-6 py-4">Bahasa</th>
                                    <th className="px-6 py-4">Tipe</th>
                                    <th className="px-6 py-4">Teks Asli (Source)</th>
                                    <th className="px-6 py-4">Hasil Terjemahan (Cache)</th>
                                    <th className="px-6 py-4">Hit</th>
                                    <th className="px-6 py-4">Terakhir Digunakan</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-atlas-border/50 text-atlas-secondary">
                                {entries.data.map((entry) => (
                                    <tr 
                                        key={entry.id} 
                                        className="hover:bg-atlas-hover/30 transition-colors duration-150"
                                    >
                                        {isAdmin && <td className="px-6 py-3.5 font-medium text-atlas-primary">{entry.tenant_name}</td>}
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-1 font-mono text-[10px] text-atlas-primary">
                                                <span>{entry.source_lang}</span>
                                                <ArrowRight className="h-3 w-3 text-atlas-secondary" />
                                                <span>{entry.target_lang}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 font-mono text-[9px] uppercase tracking-wider">{entry.content_type}</td>
                                        <td className="px-6 py-3.5 max-w-[220px] truncate font-medium text-atlas-primary" title={entry.source_text_full}>
                                            {entry.source_text}
                                        </td>
                                        <td className="px-6 py-3.5 max-w-[220px] truncate font-mono text-atlas-secondary" title={entry.translated_text_full}>
                                            {entry.translated_text}
                                        </td>
                                        <td className="px-6 py-3.5 font-mono text-[10px] text-atlas-accent font-semibold">{entry.usage_count}</td>
                                        <td className="px-6 py-3.5 text-[10px]">
                                            {new Date(entry.updated_at).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <button
                                                onClick={() => openEditModal(entry)}
                                                className="p-1.5 text-atlas-secondary hover:text-atlas-accent hover:bg-atlas-surface rounded transition-colors"
                                                title="Koreksi manual terjemahan"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
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
                            icon={Database}
                            title="Tidak ada glosarium translation memory"
                            description={Object.values(filters).some(x => !!x)
                                ? "Tidak ditemukan data cache yang sesuai dengan kriteria filter."
                                : "Belum ada rekaman memory terjemahan yang disimpan di database."
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
            {entries.links && entries.links.length > 3 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-[11px] text-atlas-secondary font-mono">
                        Menampilkan {entries.meta?.from || 0} - {entries.meta?.to || 0} dari {entries.meta?.total || 0} entri cache
                    </p>
                    <div className="flex items-center gap-1.5 text-xs">
                        {entries.meta.links.map((link, idx) => {
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

            {/* Correct Manual Translation override Dialog Modal */}
            <Dialog.Root open={modalOpen} onOpenChange={(val) => !val && setModalOpen(false)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-40 bg-atlas-overlay backdrop-blur-sm transition-opacity" />
                    <Dialog.Content className="fixed top-[15%] left-[50%] z-50 w-full max-w-lg translate-x-[-50%] bg-atlas-card border border-atlas-border rounded-card p-6 shadow-2xl focus:outline-none">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2 text-atlas-accent">
                                <Languages className="h-4.5 w-4.5" />
                                <Dialog.Title className="text-sm font-bold text-atlas-primary">
                                    Koreksi Terjemahan Manual
                                </Dialog.Title>
                            </div>
                            <Dialog.Close asChild>
                                <button className="h-7 w-7 text-atlas-secondary hover:text-atlas-primary rounded-lg flex items-center justify-center">
                                    <X className="h-4 w-4" />
                                </button>
                            </Dialog.Close>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                            {/* Readonly Source Text */}
                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                    Teks Asal (Source Text)
                                </label>
                                <div className="p-3 bg-atlas-surface border border-atlas-border/50 rounded-input text-atlas-primary font-mono text-[11px] max-h-[140px] overflow-y-auto select-text break-words">
                                    {editTarget?.source_text_full}
                                </div>
                            </div>

                            {/* Editable Corrected Translation Text */}
                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                    Koreksi Hasil Terjemahan (Corrected Translation)
                                </label>
                                <textarea
                                    required
                                    rows="4"
                                    value={data.translated_text}
                                    onChange={(e) => setData('translated_text', e.target.value)}
                                    placeholder="Ketik hasil terjemahan koreksi..."
                                    className="w-full px-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary font-mono text-[11px] outline-none focus:border-atlas-accent/50 resize-y"
                                />
                                {errors.translated_text && <p className="text-atlas-danger mt-1 font-mono text-[10px]">{errors.translated_text}</p>}
                            </div>

                            <div className="p-3 bg-atlas-accent/5 border border-atlas-accent/15 rounded-input">
                                <p className="text-[10px] text-atlas-accent leading-relaxed font-semibold">
                                    Info: Perubahan manual ini akan langsung menggantikan cache translation memory. Request API client selanjutnya dengan hash segmen yang sama akan langsung menerima hasil koreksi baru ini tanpa memicu request API ulang ke AI engine provider.
                                </p>
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
                                    {processing ? 'Menyimpan...' : 'Simpan Koreksi'}
                                </button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
