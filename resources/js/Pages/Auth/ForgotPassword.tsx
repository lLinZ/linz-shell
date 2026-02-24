import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Typography } from '@/Components/ui/Typography';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, KeyRound } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

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
            <Head title="Recuperar Acceso" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6 sm:space-y-8 md:space-y-10"
            >
                {/* Immersive Header */}
                <motion.div variants={itemVariants} className="text-center space-y-2 sm:space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1 sm:mb-2 border border-[var(--color-primary)]/10">
                        <KeyRound className="w-3 h-3" />
                        Seguridad
                    </div>
                    <Typography variant="h1" className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        <span className="bg-gradient-to-br from-[var(--color-text-primary)] via-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
                            Recuperar clave.
                        </span>
                    </Typography>
                    <Typography variant="muted" className="text-sm sm:text-base md:text-lg font-medium opacity-70 px-2">
                        Te enviaremos un enlace mágico para entrar.
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

                <form onSubmit={submit} className="space-y-6 sm:space-y-8">
                    <motion.div variants={itemVariants} className="space-y-1.5 sm:space-y-2 group">
                        <div className="relative group/input">
                            <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within/input:text-[var(--color-primary)] transition-all duration-300">
                                <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full pl-12 sm:pl-14 pr-4 sm:pr-6 h-[60px] sm:h-[66px] md:h-[72px] bg-[var(--color-bg-tertiary)]/30 group-hover/input:bg-[var(--color-bg-tertiary)]/50 border-white/10 rounded-xl sm:rounded-2xl md:rounded-[1.5rem] focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-secondary)] text-lg sm:text-xl font-medium transition-all duration-500 shadow-inner"
                                isFocused={true}
                                placeholder="tu@correo.com"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>
                        <InputError message={errors.email} className="mt-1 ml-2 sm:ml-4" />
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-2 sm:pt-4 space-y-4 sm:space-y-6">
                        <PrimaryButton
                            className="relative w-full h-[60px] sm:h-[66px] md:h-[72px] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] text-white rounded-xl sm:rounded-2xl md:rounded-[1.5rem] text-lg sm:text-xl font-black shadow-lg flex items-center justify-center gap-2 sm:gap-3 group transition-all duration-500 overflow-hidden"
                            disabled={processing}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            <Send className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            <span>ENVIAR ENLACE</span>
                        </PrimaryButton>

                        <div className="text-center pt-1 sm:pt-2">
                            <Link
                                href={route('login')}
                                className="inline-flex items-center gap-2 text-[10px] sm:text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all font-bold uppercase tracking-widest group"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 h-4 transition-transform group-hover:-translate-x-2" />
                                Volver al inicio
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
