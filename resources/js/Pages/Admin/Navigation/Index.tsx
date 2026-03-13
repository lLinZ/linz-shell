import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { Save, Braces, Palette, Globe, Image as ImageIcon, Sparkles, ChevronLeft, ShieldCheck } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import TextInput from '@/Components/TextInput';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from '@/Stores/useToastStore';

interface Props {
    navbar_config: any;
    branding_config: {
        site_name: string;
        site_logo: string;
        site_favicon: string;
    };
}

export default function Index({ navbar_config, branding_config }: Props) {
    const [jsonBuffer, setJsonBuffer] = useState<string>(JSON.stringify(navbar_config, null, 2));

    const { data, setData, post, processing, transform } = useForm({
        navbar_config: navbar_config,
        branding_config: branding_config
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const parsed = JSON.parse(jsonBuffer);

            transform((data) => ({
                ...data,
                navbar_config: parsed
            }));

            post(route('admin.navigation.update'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('¡Configuración guardada!', 'Tus cambios en branding y navegación se han aplicado.');
                },
                onError: (errs) => {
                    toast.error('Error al guardar', Object.values(errs).join(', '));
                }
            });
        } catch (err) {
            toast.error('JSON Inválido', 'Revisa el formato antes de guardar la configuración.');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master: Branding & Navigation" />

            <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
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
                                <Globe className="w-8 h-8" />
                            </div>
                            <div>
                                <Typography variant="gradient">
                                    Branding & Navegación
                                </Typography>
                                <Typography variant="muted" className="text-lg font-medium opacity-60">
                                    Control total sobre la identidad visual y estructura global.
                                </Typography>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] backdrop-blur-sm">
                        <ShieldCheck className="w-5 h-5 text-emerald-500 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">Master Authority</span>
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-10"
                >
                    {/* Identity Section */}
                    <motion.div variants={itemVariants}>
                        <Surface variant="premium" rounding="3xl" shadow="2xl" className="p-0 overflow-hidden" glow>
                            <div className="p-8 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-tertiary)]/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                                        <Palette className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <Typography variant="h3" className="font-black">Identidad de Marca</Typography>
                                        <Typography variant="small" className="font-bold opacity-40 uppercase tracking-widest">Global Branding</Typography>
                                    </div>
                                </div>
                                <Sparkles className="w-5 h-5 text-amber-500/40" />
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 text-[10px] ml-1">NOMBRE DEL SITIO</Typography>
                                    <TextInput
                                        className="w-full h-14 bg-[var(--color-bg-primary)] border-[var(--color-border)] focus:border-[var(--color-primary)]/50 rounded-2xl px-6 font-bold text-lg"
                                        value={data.branding_config.site_name}
                                        onChange={(e) => setData('branding_config', { ...data.branding_config, site_name: e.target.value })}
                                        placeholder="Ej: JOBI"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 text-[10px] ml-1">URL DEL FAVICON</Typography>
                                    <TextInput
                                        className="w-full h-14 bg-[var(--color-bg-primary)] border-[var(--color-border)] focus:border-[var(--color-primary)]/50 rounded-2xl px-6"
                                        value={data.branding_config.site_favicon}
                                        onChange={(e) => setData('branding_config', { ...data.branding_config, site_favicon: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 text-[10px] ml-1">URL DEL LOGOTIPO PRINCIPAL</Typography>
                                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                                        <TextInput
                                            className="flex-1 w-full h-14 bg-[var(--color-bg-primary)] border-[var(--color-border)] focus:border-[var(--color-primary)]/50 rounded-2xl px-6"
                                            value={data.branding_config.site_logo}
                                            onChange={(e) => setData('branding_config', { ...data.branding_config, site_logo: e.target.value })}
                                            placeholder="https://..."
                                        />
                                        {data.branding_config.site_logo && (
                                            <Surface variant="tertiary" rounding="2xl" size="none" className="p-3 bg-black/5 border border-[var(--color-border)] flex-shrink-0">
                                                <img src={data.branding_config.site_logo} alt="Preview" className="h-10 object-contain" />
                                            </Surface>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Surface>
                    </motion.div>

                    {/* Navigation Section */}
                    <motion.div variants={itemVariants}>
                        <Surface variant="premium" rounding="3xl" shadow="2xl" className="p-0 overflow-hidden" glow>
                            <div className="p-8 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-tertiary)]/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                        <Braces className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <Typography variant="h3" className="font-black">Configuración Navbar</Typography>
                                        <Typography variant="small" className="font-bold opacity-40 uppercase tracking-widest">JSON Architecture</Typography>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    <Typography variant="small" className="text-[9px] font-black uppercase tracking-widest text-white/40">JSON Validator Active</Typography>
                                </div>
                            </div>

                            <div className="p-0 border-b border-white/5">
                                <CodeMirror
                                    value={jsonBuffer}
                                    height="400px"
                                    theme="dark"
                                    extensions={[json()]}
                                    className="codemirror-premium"
                                    onChange={(value) => setJsonBuffer(value)}
                                />
                            </div>

                            <div className="p-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                                <div className="flex items-start gap-3 bg-[var(--color-primary)]/5 p-4 rounded-2xl border border-[var(--color-primary)]/10">
                                    <ShieldCheck className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                                    <Typography variant="small" className="text-[var(--color-text-secondary)] font-medium leading-relaxed max-w-lg">
                                        Asegúrate de mantener la estructura: <code className="text-[var(--color-primary)] opacity-100 font-bold">{'{ "logo_text": "...", "links": [...] }'}</code>. Cambios incorrectos pueden afectar la visibilidad del sitio.
                                    </Typography>
                                </div>
                                <Button
                                    variant="premium"
                                    className="h-16 px-12 rounded-2xl min-w-fit shadow-xl shadow-[var(--color-primary)]/10"
                                    onClick={handleUpdate}
                                    disabled={processing}
                                >
                                    <Save className="w-5 h-5 mr-3" />
                                    Sincronizar Todo
                                </Button>
                            </div>
                        </Surface>
                    </motion.div>
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}
