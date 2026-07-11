import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Input } from '@/Components/ui/Input';
import { Button } from '@/Components/ui/Button';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-base font-bold text-atlas-danger">
                    Hapus Akun Anda
                </h2>

                <p className="mt-1 text-xs text-atlas-secondary">
                    Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen. Sebelum menghapus akun Anda, harap unduh data atau informasi apa pun yang ingin Anda pertahankan.
                </p>
            </header>

            <Button
                type="button"
                onClick={confirmUserDeletion}
                variant="destructive"
                size="sm"
            >
                Hapus Akun
            </Button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-base font-bold text-atlas-primary">
                        Apakah Anda yakin ingin menghapus akun Anda?
                    </h2>

                    <p className="mt-2 text-xs text-atlas-secondary">
                        Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen. Silakan masukkan kata sandi Anda untuk mengonfirmasi bahwa Anda ingin menghapus akun Anda secara permanen.
                    </p>

                    <div className="mt-6">
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            error={errors.password}
                            placeholder="Masukkan Kata Sandi Anda"
                            required
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            onClick={closeModal}
                            variant="secondary"
                            size="sm"
                        >
                            Batal
                        </Button>

                        <Button
                            type="submit"
                            loading={processing}
                            variant="destructive"
                            size="sm"
                        >
                            Hapus Akun Secara Permanen
                        </Button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
