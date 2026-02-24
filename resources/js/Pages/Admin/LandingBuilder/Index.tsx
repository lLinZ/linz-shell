import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextAreaCustom from '@/Components/TextAreaCustom';
import { ChevronUp, ChevronDown, Edit3, Trash2, Layout, Save, X, Braces } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';

interface PageBlock {
    id: number;
    module_namespace: string;
    block_type: string;
    payload_json: any;
    order: number;
}

interface Page {
    id: number;
    title: string;
    slug: string;
}

interface Props {
    page: Page;
    blocks: PageBlock[];
}

export default function Index({ page, blocks }: Props) {
    const [editingBlock, setEditingBlock] = useState<PageBlock | null>(null);
    const [isSelectingBlock, setIsSelectingBlock] = useState(false);
    const [jsonBuffer, setJsonBuffer] = useState<Record<string, string>>({});

    const { data, setData, patch, processing, reset, transform } = useForm({
        payload_json: {} as any
    });

    // Reorder logic
    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

        // Swap
        const temp = newBlocks[index].order;
        newBlocks[index].order = newBlocks[targetIndex].order;
        newBlocks[targetIndex].order = temp;

        router.post(route('admin.landing-page.reorder'), {
            blocks: newBlocks.map(b => ({ id: b.id, order: b.order }))
        }, { preserveScroll: true });
    };

    // Edit logic
    const handleEdit = (block: PageBlock) => {
        setEditingBlock(block);
        const payload = JSON.parse(JSON.stringify(block.payload_json));
        setData('payload_json', payload);

        // Initialize buffer for complex objects
        const buffer: Record<string, string> = {};
        Object.entries(payload).forEach(([key, val]) => {
            if (typeof val === 'object' && val !== null) {
                buffer[key] = JSON.stringify(val, null, 2);
            }
        });
        setJsonBuffer(buffer);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBlock) return;

        const finalPayload = { ...data.payload_json };
        let hasError = false;

        // Validate and parse from buffer
        Object.keys(jsonBuffer).forEach(key => {
            try {
                finalPayload[key] = JSON.parse(jsonBuffer[key]);
            } catch (err) {
                alert(`Error de sintaxis en el campo "${key}": Asegúrate de que el JSON sea válido.`);
                hasError = true;
            }
        });

        if (hasError) return;

        transform((data) => ({
            ...data,
            payload_json: finalPayload
        }));

        patch(route('admin.landing-page.block.update', editingBlock.id), {
            onSuccess: () => {
                setEditingBlock(null);
                setJsonBuffer({});
                reset();
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este bloque?')) {
            router.delete(route('admin.landing-page.block.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <Typography variant="h2">Constructor de Página: {page.title}</Typography>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open('/', '_blank')}>
                            <Layout className="w-4 h-4 mr-2" /> Previsualizar
                        </Button>
                        <PrimaryButton onClick={() => setIsSelectingBlock(true)} className="py-2">
                            + Añadir Bloque
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title="Página Builder" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <Surface variant="primary" className="p-6">
                    <Typography variant="h3" className="mb-6">Estructura de Bloques</Typography>

                    <div className="space-y-4">
                        {blocks.length === 0 && (
                            <Typography variant="muted" className="text-center py-10">
                                No hay bloques configurados para esta página.
                            </Typography>
                        )}

                        {blocks.map((block, index) => (
                            <Surface
                                key={block.id}
                                variant="tertiary"
                                className="flex items-center justify-between p-4 border border-[var(--color-border)] shadow-sm hover:border-[var(--color-primary)]/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            variant="ghost"
                                            size="none"
                                            className="p-1 hover:text-[var(--color-primary)]"
                                            onClick={() => moveBlock(index, 'up')}
                                            disabled={index === 0}
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="none"
                                            className="p-1 hover:text-[var(--color-primary)]"
                                            onClick={() => moveBlock(index, 'down')}
                                            disabled={index === blocks.length - 1}
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div>
                                        <Typography variant="small" className="text-[var(--color-primary)] font-black uppercase text-[10px]">
                                            {block.module_namespace}
                                        </Typography>
                                        <Typography variant="h4" className="text-lg">
                                            {block.block_type}
                                        </Typography>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(block)}>
                                        <Edit3 className="w-4 h-4 mr-2" /> Editar
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(block.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Surface>
                        ))}
                    </div>
                </Surface>
            </div>

            {/* Panel de Edición (Modal - Portalled) */}
            <Modal show={!!editingBlock} onClose={() => setEditingBlock(null)} maxWidth="2xl">
                <form onSubmit={handleUpdate} className="flex flex-col h-full max-h-[90vh]">
                    {/* Header - Sticky */}
                    <div className="sticky top-0 z-10 bg-[var(--color-bg-primary)] p-6 border-b border-[var(--color-border)] flex justify-between items-center">
                        <Typography variant="h3">
                            Editar {editingBlock?.block_type}
                        </Typography>
                        <Button
                            variant="ghost"
                            size="none"
                            onClick={() => setEditingBlock(null)}
                            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors p-1"
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {editingBlock && Object.keys(data.payload_json).map((key) => {
                            const val = data.payload_json[key];
                            const isComplex = typeof val === 'object' && val !== null;

                            return (
                                <div key={`field-${editingBlock.id}-${key}`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <InputLabel value={key.replace(/_/g, ' ').toUpperCase()} />
                                        {isComplex && (
                                            <Typography variant="small" className="text-[10px] text-[var(--color-primary)] font-bold flex items-center gap-1">
                                                <Braces className="w-3 h-3" /> JSON EDITOR
                                            </Typography>
                                        )}
                                    </div>

                                    {isComplex ? (
                                        <CodeMirror
                                            key={`editor-${editingBlock.id}-${key}`}
                                            value={jsonBuffer[key] || JSON.stringify(val, null, 2)}
                                            height="200px"
                                            theme="dark"
                                            extensions={[json()]}
                                            className="border border-[var(--color-border)] rounded-xl overflow-hidden mt-1 shadow-inner"
                                            onChange={(value) => {
                                                setJsonBuffer(prev => ({ ...prev, [key]: value }));
                                            }}
                                        />
                                    ) : (
                                        <>
                                            {typeof val === 'string' && val.length > 50 ? (
                                                <TextAreaCustom
                                                    className="mt-1 block w-full"
                                                    value={val}
                                                    onChange={(e) => setData('payload_json', { ...data.payload_json, [key]: e.target.value })}
                                                    rows={3}
                                                />
                                            ) : (
                                                <TextInput
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={val}
                                                    onChange={(e) => setData('payload_json', { ...data.payload_json, [key]: e.target.value })}
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer - Sticky */}
                    <div className="sticky bottom-0 z-10 bg-[var(--color-bg-primary)] p-6 border-t border-[var(--color-border)] flex justify-end gap-3">
                        <SecondaryButton onClick={() => setEditingBlock(null)}>
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            <Save className="w-4 h-4 mr-2" /> Guardar Cambios
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Selector de Nuevo Bloque */}
            <Modal show={isSelectingBlock} onClose={() => setIsSelectingBlock(false)} maxWidth="lg">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border)] pb-4">
                        <Typography variant="h3">Seleccionar Tipo de Bloque</Typography>
                        <Button variant="ghost" size="none" onClick={() => setIsSelectingBlock(false)}>
                            <X className="w-6 h-6" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <Surface
                            variant="secondary"
                            className="p-4 cursor-pointer hover:border-[var(--color-primary)] border-2 border-transparent transition-all group"
                            onClick={() => {
                                setIsSelectingBlock(false);
                                router.post(route('admin.landing-page.store', page.id), {
                                    module_namespace: 'Core',
                                    block_type: 'Hero'
                                });
                            }}
                        >
                            <Typography variant="h4" className="group-hover:text-[var(--color-primary)]">🚀 Hero Section</Typography>
                            <Typography variant="small" className="text-[var(--color-text-muted)]">Bloque de cabecera con título, subtítulo y llamadas a la acción.</Typography>
                        </Surface>

                        <Surface
                            variant="secondary"
                            className="p-4 cursor-pointer hover:border-[var(--color-primary)] border-2 border-transparent transition-all group"
                            onClick={() => {
                                setIsSelectingBlock(false);
                                router.post(route('admin.landing-page.store', page.id), {
                                    module_namespace: 'Core',
                                    block_type: 'InteractiveHero'
                                });
                            }}
                        >
                            <Typography variant="h4" className="group-hover:text-[var(--color-primary)] font-black uppercase text-sm tracking-widest flex items-center">
                                <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-1 rounded mr-2 text-[10px]">PREMIUM</span>
                                🎞️ Interactive Hero
                            </Typography>
                            <Typography variant="small" className="text-[var(--color-text-muted)]">Bloque inmersivo con soporte para Videos, Carruseles y efectos Parallax.</Typography>
                        </Surface>

                        <Surface
                            variant="secondary"
                            className="p-4 cursor-pointer hover:border-[var(--color-primary)] border-2 border-transparent transition-all group"
                            onClick={() => {
                                setIsSelectingBlock(false);
                                router.post(route('admin.landing-page.store', page.id), {
                                    module_namespace: 'Core',
                                    block_type: 'Features',
                                    payload_json: {
                                        title: 'Nuestras Ventajas',
                                        subtitle: 'Descubre por qué somos la mejor opción para tus necesidades técnicas.',
                                        features: [
                                            { title: 'Soporte 24/7', description: 'Atención personalizada en cualquier momento.', icon: 'Zap' },
                                            { title: 'Garantía Total', description: 'Todos nuestros trabajos están garantizados.', icon: 'ShieldCheck' },
                                            { title: 'Expertos Reales', description: 'Profesionales verificados con años de experiencia.', icon: 'Users' }
                                        ]
                                    }
                                });
                            }}
                        >
                            <Typography variant="h4" className="group-hover:text-[var(--color-primary)]">✨ Características (Grid)</Typography>
                            <Typography variant="small" className="text-[var(--color-text-muted)]">Cuadrícula de beneficios con iconos personalizables.</Typography>
                        </Surface>

                        <Surface
                            variant="secondary"
                            className="p-4 cursor-pointer hover:border-[var(--color-primary)] border-2 border-transparent transition-all group"
                            onClick={() => {
                                setIsSelectingBlock(false);
                                router.post(route('admin.landing-page.store', page.id), {
                                    module_namespace: 'Core',
                                    block_type: 'Footer',
                                    payload_json: {
                                        company_name: 'Linz Shell',
                                        description: 'La plataforma definitiva para profesionales.',
                                        columns: [
                                            { title: 'Producto', links: [{ label: 'Precios', url: '#' }, { label: 'FAQ', url: '#' }] },
                                            { title: 'Legales', links: [{ label: 'Privacidad', url: '#' }, { label: 'Términos', url: '#' }] }
                                        ],
                                        copyright: '© 2026 Linz Shell. Todos los derechos reservados.'
                                    }
                                });
                            }}
                        >
                            <Typography variant="h4" className="group-hover:text-[var(--color-primary)]">🧱 Pie de Página (Footer)</Typography>
                            <Typography variant="small" className="text-[var(--color-text-muted)]">Bloque final con enlaces, copyright e información de marca.</Typography>
                        </Surface>

                        <Surface
                            variant="secondary"
                            className="p-4 cursor-pointer hover:border-[var(--color-primary)] border-2 border-transparent transition-all group"
                            onClick={() => {
                                setIsSelectingBlock(false);
                                router.post(route('admin.landing-page.store', page.id), {
                                    module_namespace: 'Ecommerce',
                                    block_type: 'ProductGrid'
                                });
                            }}
                        >
                            <Typography variant="h4" className="group-hover:text-[var(--color-primary)]">🛒 Catálogo de Tienda</Typography>
                            <Typography variant="small" className="text-[var(--color-text-muted)]">Cuadrícula dinámica que muestra productos destacados del catálogo.</Typography>
                        </Surface>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <SecondaryButton onClick={() => setIsSelectingBlock(false)}>Cancelar</SecondaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
