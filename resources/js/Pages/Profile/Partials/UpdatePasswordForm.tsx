import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Button } from '@/Components/ui/button';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';
import { Typography } from '@/Components/ui/Typography';
import { motion } from 'framer-motion';
import { KeyRound, ShieldCheck, Lock, Unlock, ShieldAlert } from 'lucide-react';

export default function UpdatePasswordForm() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

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

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className="relative">
            <header className="mb-10 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest mb-3 border border-orange-500/10">
                    <ShieldCheck className="w-3 h-3" />
                    Seguridad
                </div>
                <Typography variant="h2" className="text-2xl sm:text-3xl font-black tracking-tight leading-tight bg-gradient-to-r from-[var(--color-text-primary)] via-orange-500 to-[var(--color-primary)] bg-clip-text text-transparent text-balance">
                    Actualizar Contraseña
                </Typography>
                <Typography variant="muted" className="mt-3 text-sm font-medium opacity-60 text-balance">
                    Mantén tu cuenta protegida utilizando una combinación de caracteres fuerte y única.
                </Typography>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6 max-w-2xl">
                {/* Current Password */}
                <div className="space-y-2 group">
                    <div className="flex justify-between items-center px-4">
                        <InputLabel htmlFor="current_password" value="Contraseña Actual" className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <div className="relative group/input">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within/input:text-orange-500 transition-all">
                            <Unlock className="w-5 h-5" />
                        </div>
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            type="password"
                            className="block w-full pl-14 pr-6 h-16 bg-[var(--color-bg-primary)] border-[var(--color-border)] focus:ring-orange-500/30 focus:border-orange-500 focus:bg-[var(--color-bg-secondary)] text-lg font-medium transition-all duration-500 shadow-inner rounded-[1.25rem]"
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            autoComplete="current-password"
                            placeholder="Tu clave actual..."
                        />
                    </div>
                    <InputError message={errors.current_password} className="mt-2 ml-4" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* New Password */}
                    <div className="space-y-2 group">
                        <InputLabel htmlFor="password" value="Nueva Contraseña" className="ml-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors" />
                        <div className="relative group/input">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within/input:text-[var(--color-primary)] transition-all">
                                <Lock className="w-5 h-5" />
                            </div>
                            <TextInput
                                id="password"
                                ref={passwordInput}
                                type="password"
                                className="block w-full pl-14 pr-6 h-16 bg-[var(--color-bg-primary)] border-[var(--color-border)] focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-secondary)] text-lg font-medium transition-all duration-500 shadow-inner rounded-[1.25rem]"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoComplete="new-password"
                                placeholder="Nueva clave..."
                            />
                        </div>
                        <InputError message={errors.password} className="mt-2 ml-4" />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2 group">
                        <InputLabel htmlFor="password_confirmation" value="Confirmar Clave" className="ml-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors" />
                        <div className="relative group/input">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within/input:text-[var(--color-primary)] transition-all">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                className="block w-full pl-14 pr-6 h-16 bg-[var(--color-bg-primary)] border-[var(--color-border)] focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-secondary)] text-lg font-medium transition-all duration-500 shadow-inner rounded-[1.25rem]"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                                placeholder="Repite la clave..."
                            />
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-2 ml-4" />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-6">
                    <Button
                        disabled={processing}
                        className="w-full sm:w-auto relative h-16 px-10 bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-500 hover:to-orange-700 text-white rounded-2xl text-lg font-black shadow-xl flex items-center justify-center gap-3 group overflow-hidden border-none"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                        <KeyRound className="w-5 h-5 group-hover:rotate-12 transition-transform flex-shrink-0" />
                        <span className="text-sm sm:text-lg text-center">ACTUALIZAR LLAVES</span>
                    </Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition duration-1000 ease-in-out"
                        enterFrom="opacity-0 translate-x-4"
                        enterTo="opacity-100 translate-x-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-black text-xs uppercase tracking-widest">
                            <ShieldCheck className="w-4 h-4" />
                            Clave actualizada
                        </div>
                    </Transition>
                </div>
            </form>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}} />
        </section>
    );
}
