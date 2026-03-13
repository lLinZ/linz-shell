import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import TextInput from '@/Components/TextInput';
import { FormEventHandler } from 'react';
import { Settings, Save, CheckCircle2, ChevronLeft, Palette, Sliders, Monitor, Globe, Sparkles } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Setting {
    id: number;
    key: string;
    value: string | null;
    group: string;
    type: string;
}

interface Props {
    settings: Record<string, Setting[]>;
}

export default function Index({ settings }: Props) {
    const allSettings = Object.values(settings).flat();

    const { data, setData, patch, processing, recentlySuccessful } = useForm({
        settings: allSettings.map(s => ({ key: s.key, value: s.value || '' }))
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('admin.settings.update'));
    };

    const handleInputChange = (key: string, value: string) => {
        const newSettings = data.settings.map(s =>
            s.key === key ? { ...s, value } : s
        );
        setData('settings', newSettings);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.98 },
        visible: { opacity: 1, scale: 1 }
    };

    const getGroupIcon = (group: string) => {
        switch (group.toLowerCase()) {
            case 'branding': return <Palette className="w-5 h-5 text-amber-500" />;
            case 'colors': return <Monitor className="w-5 h-5 text-blue-500" />;
            case 'general': return <Globe className="w-5 h-5 text-emerald-500" />;
            default: return <Settings className="w-5 h-5 text-[var(--color-primary)]" />;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master: System Settings" />

            <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <form onSubmit={submit}>
                    {/* --- Page Header --- */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
                    >
                        <div className="space-y-3">
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors mb-4 group"
                            >
                                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                Administración Master
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-[var(--color-primary)]/10 rounded-2xl text-[var(--color-primary)]">
                                    <Sliders className="w-8 h-8" />
                                </div>
                                <div>
                                    <Typography variant="gradient">
                                        Ajustes del Sistema
                                    </Typography>
                                    <Typography variant="muted" className="text-lg font-medium opacity-60">
                                        Variables globales y configuración de la instancia.
                                    </Typography>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button variant="premium" className="h-14 px-10 rounded-2xl shadow-xl shadow-[var(--color-primary)]/10" disabled={processing}>
                                <Save className="w-5 h-5 mr-3" />
                                Guardar Configuración
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-10"
                    >
                        {Object.entries(settings).map(([group, groupSettings]) => (
                            <motion.div key={group} variants={itemVariants}>
                                <Surface variant="premium" rounding="3xl" shadow="2xl" className="p-0 overflow-hidden" glow>
                                    <div className="p-8 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-tertiary)]/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-primary)] flex items-center justify-center border border-[var(--color-border)]">
                                                {getGroupIcon(group)}
                                            </div>
                                            <div>
                                                <Typography variant="h3" className="font-black capitalize leading-none mb-1">{group} Settings</Typography>
                                                <Typography variant="small" className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Parámetros de {group}</Typography>
                                            </div>
                                        </div>
                                        <Sparkles className="w-5 h-5 opacity-20" />
                                    </div>

                                    <div className="p-8 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {groupSettings.map((setting) => (
                                                <div key={setting.key} className="space-y-3">
                                                    <div className="flex justify-between items-center px-1">
                                                        <Typography variant="small" className="font-black uppercase tracking-widest text-[var(--color-text-muted)] text-[9px]">{setting.key.replace(/_/g, ' ')}</Typography>
                                                        <div className="h-px bg-[var(--color-border)] flex-1 mx-4" />
                                                        <Typography variant="small" className="text-[8px] font-mono text-[var(--color-text-muted)] opacity-50">{setting.type}</Typography>
                                                    </div>

                                                    {setting.type === 'color' ? (
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative group">
                                                                <input
                                                                    type="color"
                                                                    id={setting.key}
                                                                    value={data.settings.find(s => s.key === setting.key)?.value || '#000000'}
                                                                    onChange={(e) => handleInputChange(setting.key, e.target.value)}
                                                                    className="h-14 w-14 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg-primary)] cursor-pointer overflow-hidden p-0"
                                                                />
                                                                <div className="absolute inset-0 rounded-2xl border-[var(--color-border)] pointer-events-none group-hover:border-[var(--color-primary)] transition-colors" />
                                                            </div>
                                                            <TextInput
                                                                className="flex-1 h-14 bg-[var(--color-bg-primary)] border-[var(--color-border)] focus:border-[var(--color-primary)]/50 rounded-2xl px-6 font-mono font-bold"
                                                                value={data.settings.find(s => s.key === setting.key)?.value || ''}
                                                                onChange={(e) => handleInputChange(setting.key, e.target.value)}
                                                            />
                                                        </div>
                                                    ) : setting.type === 'boolean' ? (
                                                        <div className="flex items-center gap-4 p-4 bg-[var(--color-bg-primary)] rounded-2xl border border-[var(--color-border)]">
                                                            <div className="flex-1">
                                                                <Typography variant="small" className="font-bold opacity-60">Activar / Desactivar</Typography>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleInputChange(setting.key, data.settings.find(s => s.key === setting.key)?.value === 'true' ? 'false' : 'true')}
                                                                className={cn(
                                                                    "relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none",
                                                                    data.settings.find(s => s.key === setting.key)?.value === 'true' ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"
                                                                )}
                                                            >
                                                                <span
                                                                    className={cn(
                                                                        "inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300",
                                                                        data.settings.find(s => s.key === setting.key)?.value === 'true' ? "translate-x-7" : "translate-x-1"
                                                                    )}
                                                                />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <TextInput
                                                            id={setting.key}
                                                            type="text"
                                                            className="w-full h-14 bg-[var(--color-bg-primary)] border-[var(--color-border)] focus:border-[var(--color-primary)]/50 rounded-2xl px-6 font-medium"
                                                            value={data.settings.find(s => s.key === setting.key)?.value || ''}
                                                            onChange={(e) => handleInputChange(setting.key, e.target.value)}
                                                            placeholder={`Ingrese valor para ${setting.key}...`}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Surface>
                            </motion.div>
                        ))}

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6">
                            <div className="flex items-center gap-3">
                                {recentlySuccessful && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <Typography variant="small" className="font-black uppercase tracking-widest text-[10px]">Configuración Sincronizada</Typography>
                                    </motion.div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 text-[var(--color-text-muted)] opacity-50">
                                <Sliders className="w-5 h-5" />
                                <div className="h-4 w-px bg-[var(--color-border)]" />
                                <Typography variant="small" className="font-black uppercase tracking-[0.2em] text-[10px]">Atomic Sync Active</Typography>
                            </div>
                        </div>
                    </motion.div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
