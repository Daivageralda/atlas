import React, { useState, useEffect } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import * as Dialog from '@radix-ui/react-dialog';
import { 
    Users, 
    MagnifyingGlass, 
    UserPlus, 
    PencilSimple, 
    UserMinus, 
    UserCheck,
    X,
    Shield,
    Briefcase,
    Question,
    CaretLeft,
    CaretRight,
    ArrowsCounterClockwise
} from '@phosphor-icons/react';
import { EmptyState } from '../../Components/ui/EmptyState';

export default function Index({ users, filters, tenants, auth }) {
    const currentUserId = auth.user?.id;
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');

    // Modal invite/edit states
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [confirmDeactivateUser, setConfirmDeactivateUser] = useState(null);

    // Form logic
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        role: 'developer',
        tenant_scope: '',
        status: 'active'
    });

    const handleReset = () => {
        setSearch('');
        setRole('');
        router.get(route('users.index'), {}, { replace: true, preserveState: true });
    };

    const applyFilters = () => {
        router.get(route('users.index'), {
            search,
            role
        }, {
            replace: true,
            preserveState: true
        });
    };

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                applyFilters();
            }
        }, 450);
        return () => clearTimeout(timer);
    }, [search]);

    const openInviteModal = () => {
        clearErrors();
        setEditingUser(null);
        reset();
        setData({
            name: '',
            email: '',
            role: 'developer',
            tenant_scope: tenants[0]?.id || '',
            status: 'active'
        });
        setModalOpen(true);
    };

    const openEditModal = (user) => {
        clearErrors();
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            role: user.role,
            tenant_scope: user.tenant_scope || tenants[0]?.id || '',
            status: user.status
        });
        setModalOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        if (editingUser) {
            put(route('users.update', editingUser.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    setEditingUser(null);
                    reset();
                }
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDeactivate = (userId) => {
        router.delete(route('users.destroy', userId), {
            onSuccess: () => {
                setConfirmDeactivateUser(null);
            }
        });
    };

    const handleReactivate = (user) => {
        router.put(route('users.update', user.id), {
            status: 'active'
        });
    };

    const getRoleBadge = (roleName) => {
        if (roleName === 'admin') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider font-mono bg-atlas-accent/15 text-atlas-accent border border-atlas-accent/25">
                    <Shield className="h-2.5 w-2.5" />
                    ADMIN
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider font-mono bg-atlas-info/15 text-atlas-info border border-atlas-info/25">
                <Briefcase className="h-2.5 w-2.5" />
                DEVELOPER
            </span>
        );
    };

    const getStatusBadge = (status) => {
        if (status === 'active') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider font-mono bg-atlas-success/15 text-atlas-success border border-atlas-success/25">
                    ACTIVE
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider font-mono bg-atlas-disabled/15 text-atlas-secondary border border-atlas-disabled/25">
                INACTIVE
            </span>
        );
    };

    return (
        <div className="space-y-6 select-none">
            <Head title="Users Management" />

            {/* Header */}
            <div className="border-b border-atlas-border/50 pb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-atlas-accent/10 border border-atlas-accent/25 flex items-center justify-center text-atlas-accent">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-atlas-primary">Users Management</h1>
                        <p className="text-xs text-atlas-secondary mt-0.5">Kelola otorisasi akun pengguna, role administratif, dan scope akses tenant</p>
                    </div>
                </div>

                <button
                    onClick={openInviteModal}
                    className="h-9 px-4 flex items-center justify-center gap-1.5 rounded-button bg-atlas-accent text-atlas-bg font-bold hover:bg-atlas-accent/90 transition-all active:scale-95 text-xs"
                >
                    <UserPlus className="h-4 w-4" />
                    Undang Pengguna
                </button>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-atlas-card border border-atlas-border rounded-card p-4 text-xs">
                {/* Search */}
                <div className="relative">
                    <MagnifyingGlass className="absolute left-3 top-2.5 h-3.5 w-3.5 text-atlas-secondary" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama atau email..."
                        className="w-full pl-9 pr-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50 placeholder:text-atlas-secondary/70 text-xs"
                    />
                </div>

                {/* Role select */}
                <div>
                    <select
                        value={role}
                        onChange={(e) => {
                            setRole(e.target.value);
                            router.get(route('users.index'), { ...filters, role: e.target.value }, { replace: true, preserveState: true });
                        }}
                        className="w-full bg-atlas-surface border border-atlas-border rounded-input px-3 py-2 text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs"
                    >
                        <option value="">Semua Role...</option>
                        <option value="admin">Admin</option>
                        <option value="developer">Developer</option>
                    </select>
                </div>

                {/* Reset button */}
                <div className="flex items-center justify-end">
                    <button
                        onClick={handleReset}
                        className="w-full sm:w-auto px-4 h-9 flex items-center justify-center gap-1.5 rounded-button border border-atlas-border bg-atlas-surface hover:bg-atlas-hover text-atlas-secondary hover:text-atlas-primary transition-colors font-semibold"
                    >
                        <ArrowsCounterClockwise className="h-3.5 w-3.5" />
                        Reset
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-atlas-card border border-atlas-border rounded-card overflow-hidden">
                {users.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b border-atlas-border bg-atlas-surface text-[10px] uppercase font-bold tracking-wider text-atlas-secondary">
                                    <th className="px-6 py-4">Nama</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Scope Akses Tenant</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Bergabung Sejak</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-atlas-border/50 text-atlas-secondary">
                                {users.data.map((user) => (
                                    <tr 
                                        key={user.id} 
                                        className="hover:bg-atlas-hover/30 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-3.5 font-semibold text-atlas-primary">{user.name}</td>
                                        <td className="px-6 py-3.5 font-mono text-atlas-secondary">{user.email}</td>
                                        <td className="px-6 py-3.5">{getRoleBadge(user.role)}</td>
                                        <td className="px-6 py-3.5 text-[11px] font-medium text-atlas-primary">
                                            {user.role === 'admin' ? 'Akses Penuh (All)' : user.tenant_scope_name}
                                        </td>
                                        <td className="px-6 py-3.5">{getStatusBadge(user.status)}</td>
                                        <td className="px-6 py-3.5 text-[10px]">
                                            {new Date(user.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-1.5 text-atlas-secondary hover:text-atlas-accent hover:bg-atlas-surface rounded transition-colors"
                                                    title="Edit parameter pengguna"
                                                >
                                                    <PencilSimple className="h-3.5 w-3.5" />
                                                </button>

                                                {user.id !== currentUserId ? (
                                                    user.status === 'active' ? (
                                                        <button
                                                            onClick={() => setConfirmDeactivateUser(user)}
                                                            className="p-1.5 text-atlas-secondary hover:text-atlas-danger hover:bg-atlas-surface rounded transition-colors"
                                                            title="Nonaktifkan pengguna"
                                                        >
                                                            <UserMinus className="h-3.5 w-3.5" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleReactivate(user)}
                                                            className="p-1.5 text-atlas-secondary hover:text-atlas-success hover:bg-atlas-surface rounded transition-colors"
                                                            title="Aktifkan kembali pengguna"
                                                        >
                                                            <UserCheck className="h-3.5 w-3.5" />
                                                        </button>
                                                    )
                                                ) : (
                                                    <span 
                                                        className="p-1.5 text-atlas-secondary/35 cursor-not-allowed"
                                                        title="Tidak bisa menonaktifkan akun sendiri"
                                                    >
                                                        <UserMinus className="h-3.5 w-3.5" />
                                                    </span>
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
                            icon={Users}
                            title="Pengguna tidak ditemukan"
                            description={search || role
                                ? "Tidak ditemukan nama atau email pengguna yang sesuai dengan kata kunci filter."
                                : "Belum ada rekaman pengguna tambahan yang tersimpan."
                            }
                            action={(search || role) && (
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
            {users.links && users.links.length > 3 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-[11px] text-atlas-secondary font-mono">
                        Menampilkan {users.meta?.from || 0} - {users.meta?.to || 0} dari {users.meta?.total || 0} pengguna
                    </p>
                    <div className="flex items-center gap-1.5 text-xs">
                        {users.meta.links.map((link, idx) => {
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
                                    {isPrev ? <CaretLeft className="h-4 w-4" /> : isNext ? <CaretRight className="h-4 w-4" /> : link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Invite / Edit User Dialog Modal */}
            <Dialog.Root open={modalOpen} onOpenChange={(val) => !val && setModalOpen(false)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-40 bg-atlas-overlay backdrop-blur-sm transition-opacity" />
                    <Dialog.Content className="fixed top-[15%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] bg-atlas-card border border-atlas-border rounded-card p-6 shadow-2xl focus:outline-none">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2 text-atlas-accent">
                                <Users className="h-4.5 w-4.5" />
                                <Dialog.Title className="text-sm font-bold text-atlas-primary">
                                    {editingUser ? 'Edit Detail Pengguna' : 'Undang Pengguna Baru'}
                                </Dialog.Title>
                            </div>
                            <Dialog.Close asChild>
                                <button className="h-7 w-7 text-atlas-secondary hover:text-atlas-primary rounded-lg flex items-center justify-center">
                                    <X className="h-4 w-4" />
                                </button>
                            </Dialog.Close>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                            {/* Name */}
                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                    Nama Lengkap
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="w-full px-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs"
                                />
                                {errors.name && <p className="text-atlas-danger mt-1 font-mono text-[10px]">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                    Alamat Email
                                </label>
                                <input
                                    required
                                    type="email"
                                    disabled={!!editingUser}
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="e.g. john@example.com"
                                    className="w-full px-3 py-2 bg-atlas-surface border border-atlas-border rounded-input text-atlas-primary outline-none focus:border-atlas-accent/50 disabled:opacity-40 text-xs font-mono"
                                />
                                {errors.email && <p className="text-atlas-danger mt-1 font-mono text-[10px]">{errors.email}</p>}
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                    Role Akses
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) => {
                                        const nextRole = e.target.value;
                                        setData('role', nextRole);
                                        if (nextRole === 'developer' && tenants.length > 0) {
                                            setData('tenant_scope', tenants[0].id);
                                        } else {
                                            setData('tenant_scope', '');
                                        }
                                    }}
                                    className="w-full bg-atlas-surface border border-atlas-border rounded-input px-3 py-2 text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs"
                                >
                                    <option value="developer">Developer (Tenant Scoped)</option>
                                    <option value="admin">Admin (Full Access)</option>
                                </select>
                                {errors.role && <p className="text-atlas-danger mt-1 font-mono text-[10px]">{errors.role}</p>}
                            </div>

                            {/* Tenant Scope (developer only) */}
                            {data.role === 'developer' && (
                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                        Scope Proyek Tenant
                                    </label>
                                    <select
                                        required
                                        value={data.tenant_scope}
                                        onChange={(e) => setData('tenant_scope', e.target.value)}
                                        className="w-full bg-atlas-surface border border-atlas-border rounded-input px-3 py-2 text-atlas-primary outline-none focus:border-atlas-accent/50 text-xs"
                                    >
                                        {tenants.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    {errors.tenant_scope && <p className="text-atlas-danger mt-1 font-mono text-[10px]">{errors.tenant_scope}</p>}
                                </div>
                            )}

                            {/* Status (edit only) */}
                            {editingUser && (
                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-wider text-atlas-secondary mb-1.5">
                                        Status Keanggotaan
                                    </label>
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
                            )}

                            {!editingUser && (
                                <div className="p-3 bg-atlas-accent/5 border border-atlas-accent/15 rounded-input">
                                    <p className="text-[10px] text-atlas-accent leading-relaxed font-semibold">
                                        Info: Pengguna yang diundang akan didaftarkan dengan temporary password default acak. Temporary credentials akan dicatat pada server log transaksi administratif untuk pengujian.
                                    </p>
                                </div>
                            )}

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
                                    className="px-4 py-2 rounded-button bg-atlas-accent text-atlas-bg font-bold hover:bg-atlas-accent/90 transition-all active:scale-95 disabled:opacity-40"
                                >
                                    {processing ? 'Menyimpan...' : (editingUser ? 'Simpan Perubahan' : 'Undang Pengguna')}
                                </button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Deactivation Confirmation Dialog Modal */}
            <Dialog.Root open={!!confirmDeactivateUser} onOpenChange={(val) => !val && setConfirmDeactivateUser(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-40 bg-atlas-overlay backdrop-blur-sm transition-opacity" />
                    <Dialog.Content className="fixed top-[20%] left-[50%] z-50 w-full max-w-sm translate-x-[-50%] bg-atlas-card border border-atlas-border rounded-card p-6 shadow-2xl focus:outline-none">
                        <div className="mb-4 text-center">
                            <h2 className="text-sm font-bold text-atlas-primary mb-2">
                                Nonaktifkan {confirmDeactivateUser?.name}?
                            </h2>
                            <p className="text-xs text-atlas-secondary leading-relaxed">
                                Pengguna tidak akan diizinkan login kembali ke sistem dashboard. Aksi penonaktifan ini dapat dibatalkan di kemudian hari.
                            </p>
                        </div>

                        <div className="flex justify-center gap-2.5 pt-4 border-t border-atlas-border/50 text-xs">
                            <button
                                type="button"
                                onClick={() => setConfirmDeactivateUser(null)}
                                className="px-4 py-2 rounded-button bg-atlas-surface border border-atlas-border text-atlas-secondary hover:text-atlas-primary transition-all active:scale-95"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleDeactivate(confirmDeactivateUser.id)}
                                className="px-4 py-2 rounded-button bg-atlas-danger text-atlas-primary font-bold hover:bg-atlas-danger/90 transition-all active:scale-95"
                            >
                                Nonaktifkan
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
