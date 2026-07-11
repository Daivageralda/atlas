import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <div className="space-y-8 select-none">
            <Head title="Profil Saya" />

            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-atlas-border/50 pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-atlas-primary">Profil Saya</h1>
                    <p className="text-sm text-atlas-secondary mt-1">Ubah informasi akun dan kata sandi Anda</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 max-w-4xl">
                <div className="bg-atlas-card border border-atlas-border rounded-card p-6">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                </div>

                <div className="bg-atlas-card border border-atlas-border rounded-card p-6">
                    <UpdatePasswordForm />
                </div>

                <div className="bg-atlas-card border border-atlas-border rounded-card p-6 border-red-500/20 bg-red-500/[0.01]">
                    <DeleteUserForm />
                </div>
            </div>
        </div>
    );
}
