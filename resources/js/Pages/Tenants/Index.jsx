import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import {
    Plus,
    MagnifyingGlassIcon,
    PencilSimple,
    Trash,
    X,
    ArrowRight,
    Buildings,
    CheckCircleIcon,
    CaretLeft,
    CaretRight
} from '@phosphor-icons/react';

import { EmptyState } from '../../Components/ui/EmptyState';

export default function Index({ tenants, filters, auth }) {
    const isAdmin = auth.user?.role === 'admin';
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Form helper
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: '',
        status: 'active'
    });

    // Handle filter submit
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('tenants.index'), { search, status }, {
                preserveState: true,
                replace: true
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, status]);

    const openCreate = () => {
        clearErrors();
        reset();
        setEditingTenant(null);
        setModalOpen(true);
    };

    const openEdit = (tenant) => {
        clearErrors();
        setEditingTenant(tenant);
        setData({
            name: tenant.name,
            type: tenant.type || '',
            status: tenant.status
        });
        setModalOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (editingTenant) {
            put(route('tenants.update', editingTenant.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                }
            });
        } else {
            post(route('tenants.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        destroy(route('tenants.destroy', deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null)
        });
    };

    return (
        <div className="space-y-6 select-none">
            <Head title="Tenants / Projects" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-atlas-border/50 pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-atlas-primary">Projects & Tenants</h1>
                    <p className="text-sm text-atlas-secondary mt-1">Daftar tenant pengakses translation engine gateway</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={openCreate}
                        className="h-9 px-4 rounded-button bg-atlas-accent text-atlas-bg text-xs font-semibold hover:bg-atlas-accent/90 transition-all active:scale-95 flex items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-atlas-accent/40"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Tenant Baru</span>
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-atlas-card border border-atlas-border rounded-input p-4">
                <div className="relative w-full sm:max-w-xs">
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-atlas-secondary" />
                    <input
                        type="text"
                        placeholder="Cari nama tenant..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-atlas-surface border border-atlas-border rounded-input text-xs text-atlas-primary placeholder-atlas-secondary focus:border-atlas-accent/50 focus:ring-0 outline-none"
                    />
                </div>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full sm:w-auto bg-atlas-surface border border-atlas-border rounded-input text-xs text-atlas-primary px-3 py-2 outline-none focus:border-atlas-accent/50"
                >
                    <option value="">Semua Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-atlas-card border border-atlas-border rounded-card overflow-hidden">
                {tenants.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-atlas-border bg-atlas-surface text-[10px] uppercase font-bold tracking-wider text-atlas-secondary">
                                    <th className="px-6 py-4">Nama Tenant</th>
                                    <th className="px-6 py-4">Tipe / Kategori</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">API Keys</th>
                                    <th className="px-6 py-4">Dibuat</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-atlas-border/50 text-xs text-atlas-secondary">
                                {tenants.data.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-atlas-hover transition-colors duration-150">
                                        <td className="px-6 py-4 font-semibold text-atlas-primary">
                                            <Link
                                                href={route('tenants.show', tenant.id)}
                                                className="hover:text-atlas-accent flex items-center gap-1.5"
                                            >
                                                <Buildings className="h-4 w-4 text-atlas-secondary" />
                                                <span>{tenant.name}</span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 font-sans text-[11px]">{tenant.type || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tenant.status === 'active'
                                                ? 'text-atlas-success bg-atlas-success/10 border-atlas-success/20'
                                                : 'text-atlas-secondary bg-atlas-surface border-atlas-border'
                                                }`}>
                                                {tenant.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-sans bg-atlas-surface border border-atlas-border px-2 py-0.5 rounded text-[10px]">
                                                {tenant.api_keys_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-sans text-[11px]">
                                            {new Date(tenant.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2.5">
                                                <button
                                                    onClick={() => openEdit(tenant)}
                                                    className="p-1.5 text-atlas-secondary hover:text-atlas-primary rounded hover:bg-atlas-surface transition-colors"
                                                    title="Edit Tenant"
                                                >
                                                    <PencilSimple className="h-3.5 w-3.5" />
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => setDeleteTarget(tenant)}
                                                        className="p-1.5 text-atlas-secondary hover:text-atlas-danger rounded hover:bg-atlas-danger/10 transition-colors"
                                                        title="Hapus Tenant"
                                                    >
                                                        <Trash className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                                <Link
                                                    href={route('tenants.show', tenant.id)}
                                                    className="p-1.5 text-atlas-secondary hover:text-atlas-accent rounded hover:bg-atlas-surface transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
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
                            icon={Buildings}
                            title="Belum ada Tenant terdaftar"
                            description="Daftarkan project tenant pengakses API gateway untuk memulai monitoring log transaksi terjemahan."
                            action={
                                isAdmin && (
                                    <button
                                        onClick={openCreate}
                                        className="h-8 px-4 rounded-button bg-atlas-accent text-atlas-bg text-[11px] font-semibold hover:bg-atlas-accent/90 transition-all active:scale-95 flex items-center gap-1"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>Daftarkan Tenant</span>
                                    </button>
                                )
                            }
                        />
                    </div>
                )}

                {/* Pagination */}
                {tenants.meta && tenants.meta.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-atlas-border px-6 py-4 text-xs font-sans">
                        <span className="text-atlas-secondary">
                            Page {tenants.meta.current_page} of {tenants.meta.last_page}
                        </span>
                        <div className="flex gap-2">
                            <Link
                                href={tenants.links.prev || '#'}
                                disabled={!tenants.links.prev}
                                className={`h-8 w-8 rounded bg-atlas-surface border border-atlas-border flex items-center justify-center text-atlas-secondary ${!tenants.links.prev ? 'opacity-40 cursor-not-allowed' : 'hover:bg-atlas-hover'}`}
                            >
                                <CaretLeft className="h-4 w-4" />
                            </Link>
                            <Link
                                href={tenants.links.next || '#'}
                                disabled={!tenants.links.next}
                                className={`h-8 w-8 rounded bg-atlas-surface border border-atlas-border flex items-center justify-center text-atlas-secondary ${!tenants.links.next ? 'opacity-40 cursor-not-allowed' : 'hover:bg-atlas-hover'}`}
                            >
                                <CaretRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Radix Dialog Modal */}
            <Dialog.Root open={modalOpen} onOpenChange={(val) => !val && setModalOpen(false)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-40 bg-atlas-overlay backdrop-blur-sm transition-opacity" />
                    <Dialog.Content className="fixed top-[20%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] bg-atlas-card border border-atlas-border rounded-card p-6 shadow-2xl focus:outline-none">
                        <div className="flex items-center justify-between mb-5">
                            <Dialog.Title className="text-sm font-bold text-atlas-primary">
                                {editingTenant ? 'Edit Data Tenant' : 'Daftarkan Tenant Baru'}
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="h-7 w-7 text-atlas-secondary hover:text-atlas-primary rounded-lg flex items-center justify-center">
                                    <X className="h-4 w-4" />
                                </button>
                            </Dialog.Close>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                    Nama Tenant
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Duta Meta Graha"
                                    className="w-full px-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50"
                                />
                                {errors.name && <p className="text-atlas-danger mt-1 font-sans text-[10px]">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                    Tipe / Kategori
                                </label>
                                <input
                                    type="text"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    placeholder="Contoh: Mobile App, E-Commerce"
                                    className="w-full px-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50"
                                />
                                {errors.type && <p className="text-atlas-danger mt-1 font-sans text-[10px]">{errors.type}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                    Status Keaktifan
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full bg-atlas-surface border border-atlas-border rounded-input px-3 py-2 text-atlas-primary outline-none focus:border-atlas-accent/50"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                {errors.status && <p className="text-atlas-danger mt-1 font-sans text-[10px]">{errors.status}</p>}
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
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Delete Confirmation AlertDialog */}
            <AlertDialog.Root open={!!deleteTarget} onOpenChange={(val) => !val && setDeleteTarget(null)}>
                <AlertDialog.Portal>
                    <AlertDialog.Overlay className="fixed inset-0 z-40 bg-atlas-overlay backdrop-blur-sm" />
                    <AlertDialog.Content className="fixed top-[20%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] bg-atlas-card border border-atlas-border rounded-card p-6 shadow-2xl focus:outline-none">
                        <AlertDialog.Title className="text-sm font-bold text-atlas-danger mb-2">
                            Hapus Tenant "{deleteTarget?.name}"?
                        </AlertDialog.Title>
                        <AlertDialog.Description className="text-xs text-atlas-secondary leading-relaxed mb-5">
                            Menghapus tenant ini akan otomatis menonaktifkan seluruh API keys yang berasosiasi dengannya. Tindakan ini merusak data transaksional dan tidak dapat dibatalkan.
                        </AlertDialog.Description>
                        <div className="flex justify-end gap-2.5 pt-4 border-t border-atlas-border/50 text-xs">
                            <AlertDialog.Cancel asChild>
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="px-4 py-2 rounded-button bg-atlas-surface border border-atlas-border text-atlas-secondary hover:text-atlas-primary transition-all active:scale-95"
                                >
                                    Batal
                                </button>
                            </AlertDialog.Cancel>
                            <AlertDialog.Action asChild>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 rounded-button bg-atlas-danger text-white hover:bg-atlas-danger/90 font-semibold transition-all active:scale-95"
                                >
                                    Hapus Permanen
                                </button>
                            </AlertDialog.Action>
                        </div>
                    </AlertDialog.Content>
                </AlertDialog.Portal>
            </AlertDialog.Root>
        </div>
    );
}
