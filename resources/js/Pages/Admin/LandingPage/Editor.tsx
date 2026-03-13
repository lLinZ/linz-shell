import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import Checkbox from '@/Components/Checkbox';
import TextInput from '@/Components/TextInput';
import { Save, Sparkles, Layout, ChevronLeft, Eye, EyeOff, Component, Layers } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Section {
    id: number;
    section_key: string;
    title: string;
    content: any;
    is_visible: boolean;
    order: number;
}

export default function Editor({ auth, sections }: PageProps<{ sections: Section[] }>) {
    const { data, setData, put, processing, errors } = useForm({
        sections: sections,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.landing-page.update'));
    };

    const handleContentChange = (index: number, key: string, value: string) => {
        const newSections = JSON.parse(JSON.stringify(data.sections));
        newSections[index].content = { ...newSections[index].content, [key]: value };
        setData('sections', newSections);
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

    return (
        <AuthenticatedLayout>
            <Head title="Contenido Estático - Premium" />

            <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <form onSubmit={submit}>
                    {/* --- Page Header --- */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
                    >
                        <div className="space-y-3">
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors mb-4 group"
                            >
                                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                Volver al Panel
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-[var(--color-primary)]/10 rounded-2xl text-[var(--color-primary)]">
                                    <Layers className="w-8 h-8" />
                                </div>
                                <div>
                                    <Typography variant="gradient">
                                        Editor de Contenido
                                    </Typography>
                                    <Typography variant="muted" className="text-lg font-medium opacity-60">
                                        Personaliza los textos y secciones de la landing page.
                                    </Typography>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button variant="premium" className="h-14 px-10 rounded-2xl shadow-xl shadow-[var(--color-primary)]/10" disabled={processing}>
                                <Save className="w-5 h-5 mr-3" />
                                Sincronizar Cambios
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-10"
                    >
                        {data.sections.map((section, index) => (
                            <motion.div key={section.id || index} variants={itemVariants}>
                                <Surface variant="premium" rounding="3xl" shadow="2xl" className="p-0 overflow-hidden border-white/10" glow>
                                    {/* Section Header */}
                                    <div className="p-8 bg-white/5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                                <Component className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <Typography variant="small" className="font-black uppercase tracking-[0.2em] text-[var(--color-primary)] mb-0.5">
                                                    Módulo: {section.section_key}
                                                </Typography>
                                                <Typography variant="h3" className="font-black">
                                                    {section.title || 'Sección sin Título'}
                                                </Typography>
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all",
                                            section.is_visible ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 shadow-[var(--color-primary)]/5" : "bg-white/5 border-white/10 opacity-60"
                                        )}>
                                            {section.is_visible ? <Eye className="w-4 h-4 text-[var(--color-primary)]" /> : <EyeOff className="w-4 h-4 text-white/40" />}
                                            <Typography variant="small" className="font-black uppercase tracking-widest text-[10px]">
                                                {section.is_visible ? 'Visible' : 'Oculto'}
                                            </Typography>
                                            <Checkbox
                                                checked={section.is_visible}
                                                onChange={(e) => {
                                                    const newSections = [...data.sections];
                                                    newSections[index].is_visible = e.target.checked;
                                                    setData('sections', newSections);
                                                }}
                                                className="rounded-md border-white/20 text-[var(--color-primary)]"
                                            />
                                        </div>
                                    </div>

                                    {/* Section Body */}
                                    <div className="p-8 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                            <div className="space-y-2">
                                                <Typography variant="small" className="font-black uppercase tracking-widest text-white/40 text-[10px] ml-1">Título de Sección</Typography>
                                                <TextInput
                                                    type="text"
                                                    value={section.title || ''}
                                                    onChange={(e) => {
                                                        const newSections = [...data.sections];
                                                        newSections[index].title = e.target.value;
                                                        setData('sections', newSections);
                                                    }}
                                                    className="w-full h-14 bg-white/5 border-white/10 focus:border-[var(--color-primary)]/50 rounded-2xl px-6 font-black text-lg"
                                                    placeholder="Ingrese el título visual..."
                                                />
                                            </div>
                                        </div>

                                        {/* Dynamic content fields */}
                                        <div className="space-y-6 pt-6 border-t border-white/5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Sparkles className="w-4 h-4 text-amber-500" />
                                                <Typography variant="small" className="font-black uppercase tracking-widest text-amber-500 text-[10px]">Configuración Detallada</Typography>
                                            </div>

                                            {/* Simple Fields */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {section.content && typeof section.content === 'object' && !Array.isArray(section.content) &&
                                                    Object.keys(section.content).map((key) => {
                                                        const value = section.content[key];
                                                        if (Array.isArray(value) || (value !== null && typeof value === 'object')) return null;

                                                        return (
                                                            <div key={key} className="space-y-2">
                                                                <Typography variant="small" className="font-black uppercase tracking-widest text-white/20 text-[9px] ml-1">{key.replace(/_/g, ' ')}</Typography>
                                                                <TextInput
                                                                    type="text"
                                                                    value={value || ''}
                                                                    onChange={(e) => handleContentChange(index, key, e.target.value)}
                                                                    className="w-full h-12 bg-white/5 border-white/10 focus:border-[var(--color-primary)]/50 rounded-xl px-4 text-sm font-medium"
                                                                />
                                                            </div>
                                                        );
                                                    })
                                                }
                                            </div>

                                            {/* Arrays/Complex structures would be handled here if needed, but keeping it clean for now */}
                                        </div>
                                    </div>
                                </Surface>
                            </motion.div>
                        ))}
                    </motion.div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
