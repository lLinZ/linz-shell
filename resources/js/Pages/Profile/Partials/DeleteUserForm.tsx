import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import { Button } from '@/Components/ui/button';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { Typography } from '@/Components/ui/Typography';
import { Trash2, AlertTriangle, ShieldX, X, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DeleteUserForm() {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

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

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className="relative">
            <header className="mb-8 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest mb-3 border border-red-500/10 mx-auto sm:mx-0">
                    <ShieldX className="w-3 h-3" />
                    Zona de Peligro
                </div>
                <Typography variant="h2" className="text-2xl sm:text-3xl font-black tracking-tight leading-tight bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent text-balance">
                    Eliminar Cuenta
                </Typography>
                <Typography variant="muted" className="mt-3 text-sm font-medium opacity-60 text-balance">
                    Una vez eliminada, toda tu información será borrada permanentemente. No habrá marcha atrás.
                </Typography>
            </header>

            <div className="p-4 sm:p-6 rounded-3xl bg-red-500/5 border border-red-500/10 max-w-2xl">
                <Typography className="text-sm font-bold text-red-600 dark:text-red-400 mb-6 flex items-center gap-2 italic text-balance">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    Por favor, descarga toda tu información antes de proceder.
                </Typography>
                <Button
                    variant="destructive"
                    onClick={confirmUserDeletion}
                    className="w-full sm:w-auto h-auto sm:h-14 py-4 sm:py-0 px-6 sm:px-8 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black shadow-lg shadow-red-500/20 active:scale-95 transition-all flex flex-col sm:flex-row items-center justify-center gap-2 border-none whitespace-normal text-center sm:text-left"
                >
                    <Trash2 className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">DESACTIVAR MI CUENTA</span>
                </Button>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <div className="relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-red-500/10 blur-3xl rounded-full" />

                    <form onSubmit={deleteUser} className="p-6 sm:p-10 relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-red-100 dark:bg-red-500/10 rounded-2xl text-red-600 flex-shrink-0">
                                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8" />
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-[var(--color-text-muted)]" />
                            </button>
                        </div>

                        <Typography variant="h3" className="text-2xl font-black tracking-tight mb-3">
                            ¿Estás absolutamente seguro?
                        </Typography>

                        <Typography variant="muted" className="text-sm font-medium opacity-70 mb-8 leading-relaxed">
                            Esta acción es final e irreversible. Ingrese su contraseña actual para confirmar que desea eliminar permanentemente su identidad digital de este sistema.
                        </Typography>

                        <div className="space-y-2 group mb-10">
                            <InputLabel
                                htmlFor="password"
                                value="Confirmación de Seguridad"
                                className="ml-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] group-focus-within:text-red-600 transition-colors"
                            />
                            <div className="relative group/input">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within/input:text-red-600 transition-all">
                                    <ShieldX className="w-5 h-5" />
                                </div>
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full pl-14 pr-6 h-16 bg-[var(--color-bg-primary)] border-red-500/20 rounded-2xl focus:ring-red-600/30 focus:border-red-600 text-lg font-medium transition-all shadow-inner"
                                    isFocused
                                    placeholder="Ingrese clave de seguridad..."
                                />
                            </div>
                            <InputError message={errors.password} className="mt-2 ml-4" />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Button
                                variant="destructive"
                                type="submit"
                                className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black shadow-xl shadow-red-500/30 transition-all flex items-center justify-center gap-2 group border-none"
                                disabled={processing}
                            >
                                <Trash2 className="w-5 h-5 group-hover:animate-bounce" />
                                ELIMINAR AHORA
                            </Button>

                            <Button
                                variant="outline"
                                type="button"
                                onClick={closeModal}
                                className="w-full sm:w-auto h-16 px-10 rounded-2xl border-2 font-black text-sm tracking-widest flex items-center justify-center gap-2 group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                CANCELAR Y VOLVER
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </section>
    );
}
