import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { Input } from '@/Components/ui/Input';
import { Button } from '@/Components/ui/Button';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-base font-bold text-atlas-primary">
                    Perbarui Kata Sandi
                </h2>

                <p className="mt-1 text-xs text-atlas-secondary">
                    Pastikan akun Anda menggunakan kata sandi acak yang panjang untuk tetap aman.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6 max-w-xl">
                <Input
                    id="current_password"
                    ref={currentPasswordInput}
                    label="Kata Sandi Saat Ini"
                    type="password"
                    value={data.current_password}
                    onChange={(e) =>
                        setData('current_password', e.target.value)
                    }
                    error={errors.current_password}
                    autoComplete="current-password"
                />

                <Input
                    id="password"
                    ref={passwordInput}
                    label="Kata Sandi Baru"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    autoComplete="new-password"
                />

                <Input
                    id="password_confirmation"
                    label="Konfirmasi Kata Sandi"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData('password_confirmation', e.target.value)
                    }
                    error={errors.password_confirmation}
                    autoComplete="new-password"
                />

                <div className="flex items-center gap-4">
                    <Button
                        type="submit"
                        loading={processing}
                        variant="primary"
                    >
                        Simpan Sandi
                    </Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0"
                    >
                        <p className="text-xs text-atlas-success font-medium">
                            Kata sandi diperbarui.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
