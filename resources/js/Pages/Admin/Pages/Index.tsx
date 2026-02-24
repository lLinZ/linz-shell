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

export default function Index({ pages }: Props) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingPage, setEditingPage] = useState<Page | null>(null);

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
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <Typography variant="h2">Gestión de Páginas</Typography>
                    <PrimaryButton onClick={() => setIsCreating(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Nueva Página
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Páginas" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <Surface variant="primary" className="p-0 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50">
                                    <th className="p-4"><Typography variant="small" className="font-bold">TÍTULO</Typography></th>
                                    <th className="p-4"><Typography variant="small" className="font-bold">RUTA (SLUG)</Typography></th>
                                    <th className="p-4"><Typography variant="small" className="font-bold">ESTADO</Typography></th>
                                    <th className="p-4 text-right"><Typography variant="small" className="font-bold">ACCIONES</Typography></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {pages.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-10 text-center">
                                            <Typography variant="muted">No hay páginas creadas aún.</Typography>
                                        </td>
                                    </tr>
                                )}
                                {pages.map((page) => (
                                    <tr key={page.id} className="hover:bg-[var(--color-bg-tertiary)]/30 transition-colors">
                                        <td className="p-4">
                                            <Typography className="font-medium text-[var(--color-text-primary)]">
                                                {page.title}
                                            </Typography>
                                        </td>
                                        <td className="p-4">
                                            <Typography variant="muted" className="font-mono text-xs">
                                                /{page.slug}
                                            </Typography>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => togglePublish(page.id)}
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${page.is_published
                                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20'
                                                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20'
                                                    }`}
                                            >
                                                {page.is_published ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                                {page.is_published ? 'Publicado' : 'Borrador'}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.get(route('admin.pages.builder', page.id))}
                                                    className="border-[var(--color-primary)]/50 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                                                >
                                                    <Layout className="w-3.5 h-3.5 mr-2" /> Constructor
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditClick(page)}
                                                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.open(`/${page.slug}`, '_blank')}
                                                    className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(page.id)}
                                                    className="text-red-500 hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Surface>
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
