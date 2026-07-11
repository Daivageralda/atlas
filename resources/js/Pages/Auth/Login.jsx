import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import { AuroraBackground } from '../../Components/decorative/AuroraBackground';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('login.store'));
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-atlas-bg select-none">
            <Head title="Masuk" />
            <AuroraBackground />

            <div className="relative z-10 w-full max-w-md bg-atlas-card border border-atlas-border rounded-card p-8 shadow-2xl transition-all duration-300">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-10 w-10 rounded-xl bg-atlas-accent/10 border border-atlas-accent/30 flex items-center justify-center mb-3">
                        <span className="text-atlas-accent font-mono font-bold text-lg">A</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-atlas-primary">Atlas Platform</h1>
                    <p className="text-sm text-atlas-secondary mt-1">Masuk ke dashboard panel anda</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-atlas-secondary mb-2" htmlFor="email">
                            Alamat Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            autoComplete="username"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full bg-atlas-surface border border-atlas-border focus:border-atlas-accent focus:ring-2 focus:ring-atlas-accent/20 rounded-input px-4 py-3 text-sm text-atlas-primary outline-none transition-all duration-[var(--duration-fast)]"
                            placeholder="nama@email.com"
                        />
                        {errors.email && (
                            <p className="mt-2 text-xs text-atlas-danger font-medium">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-atlas-secondary" htmlFor="password">
                                Kata Sandi
                            </label>
                        </div>
                        <input
                            id="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full bg-atlas-surface border border-atlas-border focus:border-atlas-accent focus:ring-2 focus:ring-atlas-accent/20 rounded-input px-4 py-3 text-sm text-atlas-primary outline-none transition-all duration-[var(--duration-fast)]"
                            placeholder="••••••••"
                        />
                        {errors.password && (
                            <p className="mt-2 text-xs text-atlas-danger font-medium">{errors.password}</p>
                        )}
                    </div>

                    <div className="flex items-center">
                        <input
                            id="remember"
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded bg-atlas-surface border-atlas-border text-atlas-accent focus:ring-atlas-accent/20 focus:ring-offset-0 outline-none"
                        />
                        <label htmlFor="remember" className="ml-2 text-xs text-atlas-secondary font-medium cursor-pointer">
                            Ingat sesi masuk saya
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-atlas-accent hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none text-atlas-bg font-semibold rounded-button py-3 text-sm transition-all duration-[var(--duration-fast)] flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <div className="h-4 w-4 border-2 border-atlas-bg border-t-transparent rounded-full animate-spin" />
                        ) : (
                            'Masuk'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
