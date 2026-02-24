import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Typography } from '@/Components/ui/Typography';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, Sparkles } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    // Animation variants for staggered appearance
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any } }
    };

    return (
        <GuestLayout>
            <Head title="Acceso Premium" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6 sm:space-y-8 md:space-y-10"
            >
                {/* Immersive Header */}
                <motion.div variants={itemVariants} className="text-center space-y-2 sm:space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1 sm:mb-2 border border-[var(--color-primary)]/10 shadow-sm animate-pulse">
                        <Sparkles className="w-3 h-3" />
                        Acceso Exclusivo
                    </div>
                    <Typography variant="h1" className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        <span className="bg-gradient-to-br from-[var(--color-text-primary)] via-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
                            Hola de nuevo.
                        </span>
                    </Typography>
                    <Typography variant="muted" className="text-sm sm:text-base md:text-lg font-medium opacity-70">
                        Inicia sesión para entrar a tu espacio.
                    </Typography>
                </motion.div>

                {status && (
                    <motion.div
                        variants={itemVariants}
                        className="p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 text-center backdrop-blur-md"
                    >
                        {status}
                    </motion.div>
                )}

                <form onSubmit={submit} className="space-y-5 sm:space-y-6 md:space-y-8">
                    {/* Email Input */}
                    <motion.div variants={itemVariants} className="space-y-1.5 sm:space-y-2 group">
                        <div className="flex justify-between items-center px-1 sm:px-2">
                            <InputLabel htmlFor="email" value="Correo Electrónico" className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] opacity-60 group-focus-within:opacity-100 transition-opacity" />
                        </div>
                        <div className="relative group/input">
                            <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within/input:text-[var(--color-primary)] transition-all duration-300">
                                <Mail className="w-5 h-5 sm:w-6 sm:h-6 outline-none" />
                            </div>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full pl-12 sm:pl-14 pr-4 sm:pr-6 h-[56px] sm:h-[64px] md:h-[72px] bg-[var(--color-bg-tertiary)]/30 group-hover/input:bg-[var(--color-bg-tertiary)]/50 border-white/10 rounded-xl sm:rounded-2xl md:rounded-[1.5rem] focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-secondary)]/80 text-base sm:text-lg font-medium transition-all duration-500 shadow-inner"
                                autoComplete="username"
                                isFocused={true}
                                placeholder="tu@ejemplo.com"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>
                        <InputError message={errors.email} className="mt-1 ml-2 sm:ml-4" />
                    </motion.div>

                    {/* Password Input - Responsive Fix for Link positioning */}
                    <motion.div variants={itemVariants} className="space-y-1.5 sm:space-y-2 group">
                        <div className="flex flex-wrap justify-between items-center px-1 sm:px-2 gap-y-1">
                            <InputLabel htmlFor="password" value="Contraseña" className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] opacity-60 group-focus-within:opacity-100 transition-opacity" />
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-[10px] sm:text-xs font-black text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors uppercase tracking-wider"
                                >
                                    ¿Olvidaste la clave?
                                </Link>
                            )}
                        </div>
                        <div className="relative group/input">
                            <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within/input:text-[var(--color-primary)] transition-all duration-300">
                                <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="block w-full pl-12 sm:pl-14 pr-4 sm:pr-6 h-[56px] sm:h-[64px] md:h-[72px] bg-[var(--color-bg-tertiary)]/30 group-hover/input:bg-[var(--color-bg-tertiary)]/50 border-white/10 rounded-xl sm:rounded-2xl md:rounded-[1.5rem] focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-secondary)]/80 text-base sm:text-lg font-medium transition-all duration-500 shadow-inner"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                        </div>
                        <InputError message={errors.password} className="mt-1 ml-2 sm:ml-4" />
                    </motion.div>

                    {/* Remember & Options */}
                    <motion.div variants={itemVariants} className="flex items-center justify-between px-1 sm:px-2">
                        <label className="flex items-center group cursor-pointer">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded sm:rounded-lg border-2 border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30 w-5 h-5 sm:w-6 sm:h-6 transition-all group-hover:border-[var(--color-primary)]/50"
                            />
                            <span className="ms-2 sm:ms-3 text-xs sm:text-sm font-bold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                                Recordar sesión
                            </span>
                        </label>
                    </motion.div>

                    {/* Primary Actions */}
                    <motion.div variants={itemVariants} className="pt-2 sm:pt-4 space-y-4 sm:space-y-6">
                        <PrimaryButton
                            className="relative w-full h-[60px] sm:h-[66px] md:h-[72px] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] text-white rounded-xl sm:rounded-2xl md:rounded-[1.5rem] text-lg sm:text-xl font-black shadow-lg sm:shadow-[0_20px_40px_-10px_rgba(var(--color-primary-rgb),0.4)] flex items-center justify-center gap-2 sm:gap-3 group transition-all duration-500 overflow-hidden"
                            disabled={processing}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            <LogIn className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-1" />
                            <span>ENTRAR AHORA</span>
                        </PrimaryButton>

                        <div className="relative flex flex-col items-center gap-3 sm:gap-4">
                            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
                            <Typography variant="muted" className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-40">
                                ¿Eres nuevo aquí?
                            </Typography>
                            <Link
                                href={route('register')}
                                className="w-full flex items-center justify-center gap-2 sm:gap-3 h-12 sm:h-14 rounded-xl sm:rounded-2xl md:rounded-[1.5rem] bg-[var(--color-bg-secondary)] border-2 border-[var(--color-primary)]/20 text-[var(--color-primary)] font-black hover:bg-[var(--color-primary)] hover:text-white transition-all duration-500 text-sm sm:text-base group"
                            >
                                CREAR CUENTA NUEVA
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-2" />
                            </Link>
                        </div>
                    </motion.div>
                </form>
            </motion.div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}} />
        </GuestLayout>
    );
}
