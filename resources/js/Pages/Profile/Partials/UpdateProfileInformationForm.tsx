import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Button } from '@/Components/ui/button';
import TextInput from '@/Components/TextInput';
import { Switch, Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Typography } from '@/Components/ui/Typography';
import { motion } from 'framer-motion';
import { User, Mail, Palette, Moon, Sun, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const VALID_COLORS = [
    { value: '#3B82F6', label: 'Océano' },
    { value: '#EAB308', label: 'Sol' },
    { value: '#EF4444', label: 'Pasión' },
    { value: '#22C55E', label: 'Naturaleza' },
    { value: '#A855F7', label: 'Místico' },
    { value: '#F43F5E', label: 'Rosa' },
];

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            avatar_color: user.avatar_color || '#3B82F6',
            dark_mode: user.dark_mode || false,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true
        });
    };

    return (
        <section className="relative">
            <header className="mb-10 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-black uppercase tracking-widest mb-3 border border-[var(--color-primary)]/10">
                    <User className="w-3 h-3" />
                    Identidad
                </div>
                <Typography variant="h2" className="text-3xl font-black tracking-tight leading-none bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-primary)] bg-clip-text text-transparent">
                    Información Personal
                </Typography>
                <Typography variant="muted" className="mt-3 text-sm font-medium opacity-60">
                    Personaliza tu presencia digital y preferencias de visualización.
                </Typography>
            </header>

            <form onSubmit={submit} className="space-y-8">
                {/* Visual Identity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        {/* Name Input */}
                        <div className="space-y-2 group">
                            <InputLabel htmlFor="name" value="Nombre Completo" className="ml-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors" />
                            <div className="relative group/input">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within/input:text-[var(--color-primary)] transition-all">
                                    <User className="w-5 h-5" />
                                </div>
                                <TextInput
                                    id="name"
                                    className="block w-full pl-14 pr-6 h-16 bg-[var(--color-bg-tertiary)]/30 border-white/10 rounded-[1.25rem] focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-secondary)] text-lg font-medium transition-all duration-500 shadow-inner"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder="Tu nombre real..."
                                />
                            </div>
                            <InputError message={errors.name} className="mt-1 ml-4" />
                        </div>

                        {/* Email Input */}
                        <div className="space-y-2 group">
                            <InputLabel htmlFor="email" value="Dirección de Correo" className="ml-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors" />
                            <div className="relative group/input">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within/input:text-[var(--color-primary)] transition-all">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <TextInput
                                    id="email"
                                    type="email"
                                    className="block w-full pl-14 pr-6 h-16 bg-[var(--color-bg-tertiary)]/30 border-white/10 rounded-[1.25rem] focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-secondary)] text-lg font-medium transition-all duration-500 shadow-inner"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder="nombre@dominio.com"
                                />
                            </div>
                            <InputError message={errors.email} className="mt-1 ml-4" />
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Avatar Color Picker */}
                        <div className="space-y-4 p-6 rounded-3xl bg-[var(--color-bg-tertiary)]/20 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <Palette className="w-4 h-4 text-[var(--color-primary)]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Paleta de Marca</span>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                {VALID_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setData('avatar_color', color.value)}
                                        className={cn(
                                            "relative h-12 w-12 rounded-2xl transition-all duration-300 group/color active:scale-95 shadow-lg",
                                            data.avatar_color === color.value
                                                ? "scale-110 ring-4 ring-[var(--color-primary)]/30"
                                                : "hover:scale-105 hover:rotate-6 grayscale-[0.5] hover:grayscale-0"
                                        )}
                                        style={{ backgroundColor: color.value }}
                                        title={color.label}
                                    >
                                        {data.avatar_color === color.value && (
                                            <motion.div
                                                layoutId="activeColor"
                                                className="absolute inset-0 flex items-center justify-center text-white"
                                            >
                                                <CheckCircle2 className="w-6 h-6 drop-shadow-md" />
                                            </motion.div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between p-6 rounded-3xl bg-[var(--color-bg-tertiary)]/20 border border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Experiencia Visual</span>
                                <div className="flex items-center gap-2">
                                    {data.dark_mode ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-orange-400" />}
                                    <span className="text-sm font-bold text-[var(--color-text-primary)]">Modo Oscuro</span>
                                </div>
                            </div>
                            <Switch
                                checked={data.dark_mode}
                                onChange={(checked: boolean) => {
                                    setData('dark_mode', checked);
                                    if (checked) document.documentElement.classList.add('dark');
                                    else document.documentElement.classList.remove('dark');
                                }}
                                className={cn(
                                    "relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-500 focus:outline-none ring-offset-2 ring-offset-[var(--color-bg-secondary)]",
                                    data.dark_mode ? "bg-gradient-to-r from-purple-600 to-blue-600" : "bg-gray-200"
                                )}
                            >
                                <span className="sr-only">Cambiar Tema</span>
                                <span
                                    className={cn(
                                        "inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-500 shadow-xl",
                                        data.dark_mode ? "translate-x-7 rotate-12" : "translate-x-1"
                                    )}
                                />
                            </Switch>
                        </div>
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-medium"
                    >
                        Tu correo no ha sido verificado.
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="ml-2 font-black underline uppercase tracking-tighter hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                        >
                            Reenviar enlace mágico
                        </Link>
                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-xs font-black uppercase">
                                Enlace enviado con éxito.
                            </div>
                        )}
                    </motion.div>
                )}

                <div className="flex flex-wrap items-center gap-6 pt-4">
                    <Button
                        disabled={processing}
                        className="relative h-16 px-10 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] hover:from-[var(--color-accent)] hover:to-[var(--color-primary)] text-white rounded-2xl text-lg font-black shadow-xl flex items-center justify-center gap-3 group overflow-hidden border-none"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        ACTUALIZAR PERFIL
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
                            <CheckCircle2 className="w-4 h-4" />
                            Cambios guardados
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
