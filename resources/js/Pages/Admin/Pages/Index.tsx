import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { Edit3, Trash2, Layout, Plus, ExternalLink, Globe, Lock } from 'lucide-react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

interface Page {
    id: number;
    title: string;
    slug: string;
    is_published: boolean;
}

interface Props {
    pages: Page[];
}

import { motion } from 'framer-motion';
import { Settings, Sparkles } from 'lucide-react';

export default function Index({ pages }: Props) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingPage, setEditingPage] = useState<Page | null>(null);

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

    const { data: createData, setData: setCreateData, post: postCreate, processing: processingCreate, reset: resetCreate } = useForm({
        title: '',
        is_published: false
    });

    const { data: editData, setData: setEditData, patch: patchEdit, processing: processingEdit, reset: resetEdit } = useForm({
        title: '',
        slug: ''
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        postCreate(route('admin.pages.store'), {
            onSuccess: () => {
                setIsCreating(false);
                resetCreate();
            }
        });
    };

    const handleEditClick = (page: Page) => {
        setEditingPage(page);
        setEditData({
            title: page.title,
            slug: page.slug
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPage) return;
        patchEdit(route('admin.pages.update', editingPage.id), {
            onSuccess: () => {
                setEditingPage(null);
                resetEdit();
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar esta página y todos sus bloques?')) {
            router.delete(route('admin.pages.destroy', id));
        }
    };

    const togglePublish = (id: number) => {
        router.post(route('admin.pages.toggle-publish', id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Páginas - Premium" />

            <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* --- Page Header --- */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-[var(--color-primary)]/10 rounded-2xl text-[var(--color-primary)]">
                                <Layout className="w-8 h-8" />
                            </div>
                            <div>
                                <Typography variant="gradient">
                                    Gestión de Páginas
                                </Typography>
                                <Typography variant="muted" className="text-lg font-medium opacity-60">
                                    Crea y administra las secciones de tu sitio web.
                                </Typography>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] backdrop-blur-sm">
                            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">Premium Suite</span>
                        </div>
                        <Button variant="premium" onClick={() => setIsCreating(true)} size="lg">
                            <Plus className="w-5 h-5 mr-2" /> Nueva Página
                        </Button>
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Surface variant="premium" rounding="3xl" shadow="2xl" className="p-0 overflow-hidden" glow>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/50 backdrop-blur-md">
                                        <th className="p-6"><Typography variant="small" className="font-black uppercase tracking-widest text-[var(--color-text-muted)]">TÍTULO</Typography></th>
                                        <th className="p-6"><Typography variant="small" className="font-black uppercase tracking-widest text-[var(--color-text-muted)]">RUTA (SLUG)</Typography></th>
                                        <th className="p-6"><Typography variant="small" className="font-black uppercase tracking-widest text-[var(--color-text-muted)]">ESTADO</Typography></th>
                                        <th className="p-6 text-right"><Typography variant="small" className="font-black uppercase tracking-widest text-[var(--color-text-muted)]">ACCIONES</Typography></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-border)]">
                                    {pages.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-20 text-center">
                                                <div className="flex flex-col items-center gap-4 opacity-30">
                                                    <Layout className="w-16 h-16" />
                                                    <Typography variant="h3">No hay páginas creadas aún.</Typography>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {pages.map((page) => (
                                        <motion.tr
                                            key={page.id}
                                            variants={itemVariants}
                                            className="hover:bg-[var(--color-bg-tertiary)]/50 transition-all duration-300 group"
                                        >
                                            <td className="p-6">
                                                <Typography className="font-bold text-lg group-hover:text-[var(--color-primary)] transition-colors">
                                                    {page.title}
                                                </Typography>
                                            </td>
                                            <td className="p-6">
                                                <div className="px-3 py-1 bg-[var(--color-bg-tertiary)] rounded-lg inline-block border border-[var(--color-border)]">
                                                    <Typography variant="muted" className="font-mono text-xs font-bold">
                                                        /{page.slug}
                                                    </Typography>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <button
                                                    onClick={() => togglePublish(page.id)}
                                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all border shadow-sm ${page.is_published
                                                        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/20 shadow-[var(--color-primary)]/10'
                                                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 shadow-amber-500/10'
                                                        }`}
                                                >
                                                    {page.is_published ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                                    {page.is_published ? 'Publicado' : 'Borrador'}
                                                </button>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-3 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 lg:translate-x-4 lg:group-hover:translate-x-0">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.get(route('admin.pages.builder', page.id))}
                                                        className="px-4 border-[var(--color-border)] hover:border-[var(--color-primary)]/50 bg-[var(--color-bg-secondary)]"
                                                    >
                                                        <Edit3 className="w-4 h-4 mr-2" /> Editor
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEditClick(page)}
                                                        className="hover:bg-[var(--color-primary)]/10"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => window.open(`/${page.slug}`, '_blank')}
                                                        className="hover:text-[var(--color-primary)]"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => handleDelete(page.id)}
                                                        className="rounded-full"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Surface>
                </motion.div>
            </div>

            {/* Crear Nueva Página Modal */}
            <Modal show={isCreating} onClose={() => setIsCreating(false)} maxWidth="md">
                <form onSubmit={handleCreate} className="p-6">
                    <Typography variant="h3" className="mb-6">Crear Nueva Página</Typography>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="TÍTULO DE LA PÁGINA" />
                            <TextInput
                                className="mt-1 block w-full"
                                value={createData.title}
                                onChange={(e) => setCreateData('title', e.target.value)}
                                placeholder="Ej: Servicios de Limpieza"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsCreating(false)}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processingCreate}>Crear Página</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Editar Ajustes de Página Modal */}
            <Modal show={!!editingPage} onClose={() => setEditingPage(null)} maxWidth="md">
                <form onSubmit={handleUpdate} className="p-6">
                    <Typography variant="h3" className="mb-6">Ajustes de Página</Typography>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="TÍTULO DE LA PÁGINA" />
                            <TextInput
                                className="mt-1 block w-full"
                                value={editData.title}
                                onChange={(e) => setEditData('title', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="SLUG / RUTA" />
                            <div className="flex items-center mt-1">
                                <span className="bg-[var(--color-bg-tertiary)] px-3 py-2 border border-[var(--color-border)] border-r-0 rounded-l-lg text-[var(--color-text-muted)] text-sm font-mono">
                                    /
                                </span>
                                <TextInput
                                    className="block w-full rounded-l-none"
                                    value={editData.slug}
                                    onChange={(e) => setEditData('slug', e.target.value)}
                                    required
                                />
                            </div>
                            <Typography variant="small" className="mt-1.5 text-[var(--color-text-muted)] italic">
                                El slug se limpiará automáticamente al guardar (ej: "Mi Página" &rarr; "mi-pagina").
                            </Typography>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setEditingPage(null)}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processingEdit}>
                            Guardar Ajustes
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
