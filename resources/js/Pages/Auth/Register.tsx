import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Typography } from '@/Components/ui/Typography';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
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
            <Head title="Únete a la Vanguardia" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6 sm:space-y-8 md:space-y-10"
            >
                {/* Immersive Header */}
                <motion.div variants={itemVariants} className="text-center space-y-2 sm:space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1 sm:mb-2 border border-[var(--color-primary)]/10">
                        <UserPlus className="w-3 h-3" />
                        Nueva Experiencia
                    </div>
                    <Typography variant="h1" className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        <span className="bg-gradient-to-br from-[var(--color-text-primary)] via-[var(--color-accent)] to-[var(--color-primary)] bg-clip-text text-transparent">
                            Crea tu cuenta.
                        </span>
                    </Typography>
                    <Typography variant="muted" className="text-sm sm:text-base md:text-lg font-medium opacity-70">
                        Solo te tomará un minuto unirte a nosotros.
                    </Typography>
                </motion.div>

                <form onSubmit={submit} className="space-y-4 sm:space-y-6">
                    {/* Name Input */}
                    <motion.div variants={itemVariants} className="space-y-1.5 sm:space-y-2 group">
                        <InputLabel htmlFor="name" value="Tu Nombre" className="ml-2 sm:ml-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors" />
                        <div className="relative group/input">
                            <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within/input:text-[var(--color-primary)] transition-all">
                                <User className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="block w-full pl-12 sm:pl-14 pr-4 sm:pr-6 h-[56px] sm:h-[64px] bg-[var(--color-bg-tertiary)]/30 border-white/10 rounded-xl sm:rounded-2xl md:rounded-[1.5rem] focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-secondary)] text-base sm:text-lg font-medium transition-all duration-500 shadow-inner"
                                autoComplete="name"
                                isFocused={true}
                                placeholder="Escribe tu nombre..."
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                        </div>
                        <InputError message={errors.name} className="mt-1 ml-2 sm:ml-4" />
                    </motion.div>

                    {/* Email Input */}
                    <motion.div variants={itemVariants} className="space-y-1.5 sm:space-y-2 group">
                        <InputLabel htmlFor="email" value="Correo Electrónico" className="ml-2 sm:ml-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors" />
                        <div className="relative group/input">
                            <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within/input:text-[var(--color-primary)] transition-all">
                                <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full pl-12 sm:pl-14 pr-4 sm:pr-6 h-[56px] sm:h-[64px] bg-[var(--color-bg-tertiary)]/30 border-white/10 rounded-xl sm:rounded-2xl md:rounded-[1.5rem] focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-secondary)] text-base sm:text-lg font-medium transition-all duration-500 shadow-inner"
                                autoComplete="username"
                                placeholder="tu@correo.com"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                        </div>
                        <InputError message={errors.email} className="mt-1 ml-2 sm:ml-4" />
                    </motion.div>

                    {/* Password Fields Row */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:space-y-2 group">
                            <InputLabel htmlFor="password" value="Contraseña" className="ml-2 sm:ml-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors" />
                            <div className="relative group/input">
                                <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within/input:text-[var(--color-primary)] transition-all">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="block w-full pl-12 sm:pl-14 pr-4 sm:pr-6 h-[56px] sm:h-[64px] bg-[var(--color-bg-tertiary)]/30 border-white/10 rounded-xl sm:rounded-2xl md:rounded-[1.5rem] focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-secondary)] text-sm sm:text-base font-medium transition-all duration-500 shadow-inner"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2 group">
                            <InputLabel htmlFor="password_confirmation" value="Confirmar" className="ml-2 sm:ml-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors" />
                            <div className="relative group/input">
                                <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within/input:text-[var(--color-primary)] transition-all">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="block w-full pl-12 sm:pl-14 pr-4 sm:pr-6 h-[56px] sm:h-[64px] bg-[var(--color-bg-tertiary)]/30 border-white/10 rounded-xl sm:rounded-2xl md:rounded-[1.5rem] focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-secondary)] text-sm sm:text-base font-medium transition-all duration-500 shadow-inner"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                        <InputError message={errors.password} className="ml-2 sm:ml-4" />
                        <InputError message={errors.password_confirmation} className="ml-2 sm:ml-4" />
                    </div>

                    {/* Trust Indicators */}
                    <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-1 sm:py-2">
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 h-4" />
                            Seguro & Encriptado
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-400">
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 h-4" />
                            Acceso Inmediato
                        </div>
                    </motion.div>

                    {/* Cinematic Actions */}
                    <motion.div variants={itemVariants} className="pt-2 sm:pt-6 space-y-4 sm:space-y-6">
                        <PrimaryButton
                            className="relative w-full h-[60px] sm:h-[66px] md:h-[72px] bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] hover:from-[var(--color-primary)] hover:to-[var(--color-accent)] text-white rounded-xl sm:rounded-2xl md:rounded-[1.5rem] text-lg sm:text-xl font-black shadow-lg flex items-center justify-center gap-2 sm:gap-3 group transition-all duration-500 overflow-hidden"
                            disabled={processing}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
                            <span>EMPEZAR MI VIAJE</span>
                        </PrimaryButton>

                        <div className="text-center pt-1 sm:pt-2">
                            <Link
                                href={route('login')}
                                className="inline-flex items-center gap-2 text-[10px] sm:text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all font-bold uppercase tracking-widest group"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 h-4 transition-transform group-hover:-translate-x-2" />
                                Ya tengo una cuenta. Entrar
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
