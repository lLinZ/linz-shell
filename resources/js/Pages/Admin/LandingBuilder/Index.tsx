import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import TextAreaCustom from '@/Components/TextAreaCustom';
import { ChevronUp, ChevronDown, Edit3, Trash2, Layout, Save, X, Braces, Plus, Sparkles, Wand2, Package, PanelsTopLeft, Footprints, ShoppingBag, Send, Eye, MousePointer2, Settings2, Image as ImageIcon, Check } from 'lucide-react';
import MediaBrowser from '@/Components/MediaBrowser';
import IconBrowser from '@/Components/IconBrowser';
import * as LucideIcons from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from '@/Stores/useToastStore';

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
    approvedReviews?: { id: number; author_name: string; rating: number }[];
    categories?: string[];
}

export default function Index({ page, blocks, approvedReviews = [], categories = [] }: Props) {
    const [editingBlock, setEditingBlock] = useState<PageBlock | null>(null);
    const [isSelectingBlock, setIsSelectingBlock] = useState(false);
    const [jsonBuffer, setJsonBuffer] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const { data, setData, patch, processing, reset, transform } = useForm({
        payload_json: {} as any
    });

    const { modules } = usePage<any>().props;

    const isModuleEnabled = (slug: string) => {
        return modules?.find((m: any) => m.slug === slug)?.is_enabled ?? true;
    };

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
        setActiveTab('visual'); // Default to visual
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

    const updateField = (key: string, value: any) => {
        setData('payload_json', {
            ...data.payload_json,
            [key]: value
        });

        // Sync buffer for complex objects to prevent overwriting on save
        if (typeof value === 'object' && value !== null) {
            setJsonBuffer(prev => ({
                ...prev,
                [key]: JSON.stringify(value, null, 2)
            }));
        }
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBlock) return;

        // 1. Prepare final payload by merging visual data with JSON buffer
        const mergedPayload = { ...data.payload_json };
        let hasError = false;

        Object.keys(jsonBuffer).forEach(key => {
            try {
                mergedPayload[key] = JSON.parse(jsonBuffer[key]);
            } catch (err) {
                toast.error(`Error de sintaxis`, `Revisa el JSON en el campo "${key}".`);
                hasError = true;
            }
        });

        if (hasError) return;

        // 2. Use transform to inject the correctly merged payload into the request
        transform((data) => ({
            ...data,
            payload_json: mergedPayload
        }));

        // 3. Perform the patch request using useForm's handler
        patch(route('admin.landing-page.block.update', editingBlock.id), {
            onSuccess: () => {
                setEditingBlock(null);
                setJsonBuffer({});
                toast.success('¡Bloque actualizado!', 'Los cambios se han guardado exitosamente.');
            },
            onError: (errs) => {
                console.error("Save failed", errs);
                toast.error('Error al guardar', Object.values(errs).join(', '));
            },
            preserveState: false, // Force a clean slate
            preserveScroll: true
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este bloque?')) {
            router.delete(route('admin.landing-page.block.destroy', id));
        }
    };

    // Media Browser State
    const [mediaBrowserOpen, setMediaBrowserOpen] = useState(false);
    const [mediaTarget, setMediaTarget] = useState<{ key: string; index?: number; subKey?: string } | null>(null);

    const openMediaBrowser = (key: string, index?: number, subKey?: string) => {
        setMediaTarget({ key, index, subKey });
        setMediaBrowserOpen(true);
    };

    const handleMediaSelect = (url: string) => {
        if (!mediaTarget) return;

        const newPayload = { ...data.payload_json };

        if (mediaTarget.index !== undefined && mediaTarget.subKey) {
            // It's an array element (e.g., slides)
            const currentArray = [...(newPayload[mediaTarget.key] || [])];
            if (currentArray[mediaTarget.index]) {
                // Immutable update for the object inside the array
                currentArray[mediaTarget.index] = {
                    ...currentArray[mediaTarget.index],
                    [mediaTarget.subKey]: url
                };
            }
            newPayload[mediaTarget.key] = currentArray;
        } else {
            // Normal top-level key
            newPayload[mediaTarget.key] = url;
        }

        // Update both the form state and the JSON buffer
        setData('payload_json', newPayload);

        // If it's a complex item updated visually, sync its JSON buffer
        const updatedVal = newPayload[mediaTarget.key];
        if (typeof updatedVal === 'object' && updatedVal !== null) {
            setJsonBuffer(prev => ({
                ...prev,
                [mediaTarget.key]: JSON.stringify(updatedVal, null, 2)
            }));
        }

        setMediaBrowserOpen(false);
    };

    // Icon Browser State
    const [iconBrowserOpen, setIconBrowserOpen] = useState(false);
    const [iconTarget, setIconTarget] = useState<{ key: string; index?: number; subKey?: string } | null>(null);

    const openIconBrowser = (key: string, index?: number, subKey?: string) => {
        setIconTarget({ key, index, subKey });
        setIconBrowserOpen(true);
    };

    const handleIconSelect = (iconName: string) => {
        if (!iconTarget) return;

        const newPayload = { ...data.payload_json };

        if (iconTarget.index !== undefined && iconTarget.subKey) {
            const currentArray = [...(newPayload[iconTarget.key] || [])];
            if (currentArray[iconTarget.index]) {
                currentArray[iconTarget.index] = {
                    ...currentArray[iconTarget.index],
                    [iconTarget.subKey]: iconName
                };
            }
            newPayload[iconTarget.key] = currentArray;
        } else {
            newPayload[iconTarget.key] = iconName;
        }

        setData('payload_json', newPayload);

        const updatedVal = newPayload[iconTarget.key];
        if (typeof updatedVal === 'object' && updatedVal !== null) {
            setJsonBuffer(prev => ({
                ...prev,
                [iconTarget.key]: JSON.stringify(updatedVal, null, 2)
            }));
        }

        setIconBrowserOpen(false);
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Builder: ${page.title}`} />

            <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* --- Page Header --- */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-[var(--color-primary)]/10 rounded-2xl text-[var(--color-primary)]">
                                <Layout className="w-8 h-8" />
                            </div>
                            <div>
                                <Typography variant="gradient" className="text-3xl leading-tight">
                                    Visual Builder
                                </Typography>
                                <Typography variant="muted" className="text-sm font-bold flex items-center gap-2">
                                    Construyendo: <span className="text-[var(--color-text-primary)]">/{page.slug}</span>
                                </Typography>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="rounded-2xl h-12 px-6 border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]"
                            onClick={() => window.open(route('page.show', page.slug === '/' ? '' : page.slug), '_blank')}
                        >
                            <Layout className="w-4 h-4 mr-2" /> Previsualizar
                        </Button>
                        <Button variant="premium" className="h-12 px-8 rounded-2xl" onClick={() => setIsSelectingBlock(true)}>
                            <Plus className="w-5 h-5 mr-2" />
                            Añadir Bloque
                        </Button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-12">
                    {/* --- Structure Section --- */}
                    <Surface variant="premium" rounding="3xl" shadow="2xl" className="p-8" glow>
                        <div className="flex items-center justify-between mb-8">
                            <Typography variant="h3" className="font-black flex items-center gap-2">
                                <PanelsTopLeft className="w-5 h-5 text-[var(--color-primary)]" />
                                Estructura de la Página
                            </Typography>
                            <div className="px-4 py-1.5 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                                {blocks.length} Bloques Activos
                            </div>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {blocks.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]"
                                    >
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <Wand2 className="w-16 h-16" />
                                            <Typography variant="h3" className="font-black">Página en blanco</Typography>
                                            <Typography variant="p">Comienza añadiendo tu primer bloque visual.</Typography>
                                        </div>
                                    </motion.div>
                                )}

                                {blocks.map((block, index) => (
                                    <motion.div
                                        key={block.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    >
                                        <Surface
                                            variant="tertiary"
                                            rounding="2xl"
                                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 transition-all group gap-4"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col gap-1 bg-black/20 p-1 rounded-xl">
                                                    <button
                                                        className="p-1 hover:text-[var(--color-primary)] disabled:opacity-20 transition-colors"
                                                        onClick={() => moveBlock(index, 'up')}
                                                        disabled={index === 0}
                                                    >
                                                        <ChevronUp className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        className="p-1 hover:text-[var(--color-primary)] disabled:opacity-20 transition-colors"
                                                        onClick={() => moveBlock(index, 'down')}
                                                        disabled={index === blocks.length - 1}
                                                    >
                                                        <ChevronDown className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Typography variant="small" className="text-[var(--color-primary)] font-black uppercase text-[10px] tracking-widest px-2 py-0.5 bg-[var(--color-primary)]/10 rounded-md">
                                                            {block.module_namespace}
                                                        </Typography>
                                                        <div className="h-px w-4 bg-[var(--color-border)]" />
                                                        <Typography variant="small" className="text-[var(--color-text-muted)] font-bold text-[10px]">ORDEN #{block.order}</Typography>
                                                    </div>
                                                    <Typography variant="h4" className="text-xl font-black group-hover:text-[var(--color-primary)] transition-colors">
                                                        {block.block_type}
                                                    </Typography>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 w-full sm:w-auto justify-end lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 lg:translate-x-4 lg:group-hover:translate-x-0">
                                                <Button
                                                    variant="premium"
                                                    className="h-10 px-4 rounded-xl text-xs flex-1 sm:flex-none"
                                                    onClick={() => handleEdit(block)}
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 mr-2" /> Configurar
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="h-10 w-10 rounded-xl"
                                                    onClick={() => handleDelete(block.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </Surface>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </Surface>
                </div>
            </div>

            {/* Panel de Edición - Premium Modal Refactorizado */}
            <Modal
                show={!!editingBlock}
                onClose={() => {
                    if (!mediaBrowserOpen) setEditingBlock(null);
                }}
                maxWidth="3xl"
                className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] shadow-2xl overflow-hidden rounded-[2.5rem]"
            >
                <form
                    onSubmit={handleUpdate}
                    className={cn(
                        "flex flex-col h-full max-h-[90vh] transition-all duration-300",
                        mediaBrowserOpen && "pointer-events-none blur-sm grayscale-[0.5] opacity-50 scale-[0.98]"
                    )}
                >
                    {/* Header Limpio (Variables CSS) */}
                    <div className="p-8 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-secondary)]">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-2xl text-[var(--color-primary)] shadow-sm">
                                <Wand2 className="w-6 h-6" />
                            </div>
                            <div>
                                <Typography variant="h3" className="font-black">Configuración</Typography>
                                <Typography variant="muted" className="text-xs font-bold uppercase tracking-widest">{editingBlock?.block_type} • Modificando Contenido</Typography>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setEditingBlock(null)}
                            className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-xl transition-colors"
                        >
                            <X className="w-6 h-6 text-[var(--color-text-muted)]" />
                        </button>
                    </div>

                    <div className="flex border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] pb-px">
                        <button
                            type="button"
                            onClick={() => setActiveTab('visual')}
                            className={cn(
                                "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2",
                                activeTab === 'visual' ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-bg-primary)]" : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                            )}
                        >
                            Visual Editor
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('json')}
                            className={cn(
                                "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2",
                                activeTab === 'json' ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-bg-primary)]" : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                            )}
                        >
                            JSON Code
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-[var(--color-bg-primary)]">
                        {activeTab === 'json' ? (
                            <div className="space-y-10">
                                {editingBlock && Object.keys(data.payload_json).map((key) => {
                                    const val = data.payload_json[key];
                                    const isComplex = typeof val === 'object' && val !== null;

                                    return (
                                        <motion.div
                                            key={`field-${editingBlock.id}-${key}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-3"
                                        >
                                            <div className="flex justify-between items-center">
                                                <Typography variant="small" className="font-black uppercase tracking-widest text-[var(--color-text-muted)] text-[10px]">
                                                    {key.replace(/_/g, ' ')}
                                                </Typography>
                                                {isComplex && (
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 rounded-lg">
                                                        <Braces className="w-3 h-3 text-amber-500" />
                                                        <Typography variant="small" className="text-[9px] text-amber-500 font-black uppercase tracking-widest">JSON Structured</Typography>
                                                    </div>
                                                )}
                                            </div>

                                            {isComplex ? (
                                                <Surface variant="tertiary" rounding="xl" size="none" className="overflow-hidden border border-[var(--color-border)] shadow-inner">
                                                    <CodeMirror
                                                        key={`editor-${editingBlock.id}-${key}`}
                                                        value={jsonBuffer[key] || JSON.stringify(val, null, 2)}
                                                        height="300px"
                                                        theme="dark"
                                                        extensions={[json()]}
                                                        className="codemirror-premium"
                                                        onChange={(value) => {
                                                            setJsonBuffer(prev => ({ ...prev, [key]: value }));
                                                        }}
                                                    />
                                                </Surface>
                                            ) : (
                                                <TextInput
                                                    type="text"
                                                    className="w-full h-14 bg-[var(--color-bg-secondary)] border-[var(--color-border)] focus:border-[var(--color-primary)]/50 rounded-2xl px-6 font-medium"
                                                    value={val}
                                                    onChange={(e) => updateField(key, e.target.value)}
                                                />
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {/* Visual Editor Dinámico y Completo */}
                                {editingBlock && Object.keys(data.payload_json).map((key) => {
                                    const val = data.payload_json[key];
                                    const isImageField = key.toLowerCase().includes('image') || key.toLowerCase().includes('bg') || key.toLowerCase().includes('url');

                                    // Renderizar Arrays (como slides o features o lista de IDs)
                                    if (Array.isArray(val)) {
                                        return (
                                            <div key={key} className="space-y-6 bg-[var(--color-bg-tertiary)]/30 p-8 rounded-[2rem] border border-[var(--color-border)]">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Layout className="w-5 h-5 text-[var(--color-primary)]" />
                                                    <Typography variant="h4" className="text-xl font-black capitalize">{key.replace(/_/g, ' ')}</Typography>
                                                </div>
                                                <div className="space-y-4">
                                                    {val.map((item, idx) => (
                                                        <Surface key={idx} variant="tertiary" rounding="2xl" className="p-6 border border-[var(--color-border)]">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <Typography variant="small" className="font-black opacity-40 uppercase tracking-widest text-[9px]">Elemento #{idx + 1}</Typography>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="none"
                                                                    className="text-rose-500 p-2 rounded-lg hover:bg-rose-500/10"
                                                                    onClick={() => {
                                                                        const newVal = [...val];
                                                                        newVal.splice(idx, 1);
                                                                        updateField(key, newVal);
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>

                                                            {typeof item !== 'object' || item === null ? (
                                                                <div className="space-y-2">
                                                                    {editingBlock.block_type === 'ReviewsCarousel' && key === 'selected_ids' ? (
                                                                        <select
                                                                            className="w-full h-12 bg-[var(--color-bg-secondary)] border-[var(--color-border)] rounded-xl px-4 text-sm"
                                                                            value={item || ''}
                                                                            onChange={(e) => {
                                                                                const newVal = [...val];
                                                                                newVal[idx] = e.target.value;
                                                                                updateField(key, newVal);
                                                                            }}
                                                                        >
                                                                            <option value="">Seleccionar reseña...</option>
                                                                            {approvedReviews.map(r => (
                                                                                <option key={r.id} value={r.id}>
                                                                                    {r.author_name} ({r.rating}★) - ID: {r.id}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    ) : (
                                                                        <TextInput
                                                                            className="w-full h-12 bg-[var(--color-bg-secondary)] border-[var(--color-border)] rounded-xl px-4 text-sm"
                                                                            value={item || ''}
                                                                            onChange={(e) => {
                                                                                const newVal = [...val];
                                                                                newVal[idx] = e.target.value;
                                                                                updateField(key, newVal);
                                                                            }}
                                                                            placeholder="Valor..."
                                                                        />
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {Object.keys(item).map((subKey) => {
                                                                        const subVal = item[subKey];
                                                                        const isSubImage = subKey.toLowerCase().includes('image') || subKey.toLowerCase().includes('url');

                                                                        if (isSubImage) {
                                                                            return (
                                                                                <div key={subKey} className="space-y-2">
                                                                                    <InputLabel className="text-[10px] uppercase font-bold tracking-wider">{subKey}</InputLabel>
                                                                                    <div className="flex items-center gap-4">
                                                                                        {subVal && <img src={subVal} className="w-16 h-16 rounded-xl object-cover border border-[var(--color-border)] shadow-sm" />}
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="premium"
                                                                                            size="sm"
                                                                                            className="rounded-xl flex-1 h-12"
                                                                                            onClick={() => openMediaBrowser(key, idx, subKey)}
                                                                                        >
                                                                                            <Plus className="w-4 h-4 mr-2" /> Seleccionar Imagen
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        }

                                                                        const isIconField = subKey.toLowerCase().includes('icon');
                                                                        if (isIconField) {
                                                                            const IconComponent = subVal ? (LucideIcons as any)[subVal] : null;
                                                                            return (
                                                                                <div key={subKey} className="space-y-2">
                                                                                    <InputLabel className="text-[10px] uppercase font-bold tracking-wider">{subKey}</InputLabel>
                                                                                    <div className="flex items-center gap-4">
                                                                                        <div className="w-12 h-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-center">
                                                                                            {IconComponent ? <IconComponent className="w-6 h-6 text-[var(--color-primary)]" /> : <Settings2 className="w-6 h-6 text-[var(--color-text-muted)] opacity-50" />}
                                                                                        </div>
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="outline"
                                                                                            size="sm"
                                                                                            className="rounded-xl flex-1 h-12 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                                                                                            onClick={() => openIconBrowser(key, idx, subKey)}
                                                                                        >
                                                                                            {subVal ? 'Cambiar Icono' : 'Seleccionar Icono'}
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        }

                                                                        const isColorField = subKey.toLowerCase().includes('color');

                                                                        if (isColorField) {
                                                                            return (
                                                                                <div key={subKey} className="space-y-2">
                                                                                    <InputLabel className="text-[10px] uppercase font-bold tracking-wider">{subKey}</InputLabel>
                                                                                    <div className="flex items-center gap-4">
                                                                                        <div
                                                                                            className="w-12 h-12 rounded-xl border border-[var(--color-border)] shadow-sm"
                                                                                            style={{ backgroundColor: subVal || '#000' }}
                                                                                        />
                                                                                        <TextInput
                                                                                            type="color"
                                                                                            className="h-12 w-12 p-1 bg-[var(--color-bg-secondary)] border-[var(--color-border)] rounded-xl cursor-pointer"
                                                                                            value={subVal || '#000000'}
                                                                                            onChange={(e) => {
                                                                                                const newVal = [...val];
                                                                                                newVal[idx] = { ...newVal[idx], [subKey]: e.target.value };
                                                                                                updateField(key, newVal);
                                                                                            }}
                                                                                        />
                                                                                        <TextInput
                                                                                            className="h-12 flex-1 text-sm font-mono uppercase"
                                                                                            value={subVal || ''}
                                                                                            onChange={(e) => {
                                                                                                const newVal = [...val];
                                                                                                newVal[idx] = { ...newVal[idx], [subKey]: e.target.value };
                                                                                                updateField(key, newVal);
                                                                                            }}
                                                                                            placeholder="#000000"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        }

                                                                        return (
                                                                            <div key={subKey} className="space-y-2">
                                                                                <InputLabel className="text-[10px] uppercase font-bold tracking-wider">{subKey}</InputLabel>
                                                                                <TextInput
                                                                                    className="h-10 text-sm"
                                                                                    value={subVal || ''}
                                                                                    onChange={(e) => {
                                                                                        const newVal = [...val];
                                                                                        newVal[idx] = { ...newVal[idx], [subKey]: e.target.value };
                                                                                        updateField(key, newVal);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </Surface>
                                                    ))}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="w-full rounded-xl border-dashed h-12"
                                                        onClick={() => {
                                                            let newItem = "";
                                                            if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
                                                                newItem = { ...val[0] } as any;
                                                                Object.keys(newItem).forEach(k => (newItem as any)[k] = "");
                                                            }
                                                            updateField(key, [...val, newItem]);
                                                        }}
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" /> Agregar Item a {key}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Renderizar Objetos Simples (como primary_cta)
                                    if (typeof val === 'object' && val !== null) {
                                        return (
                                            <div key={key} className="space-y-4 p-8 bg-[var(--color-bg-secondary)] rounded-[2rem] border border-[var(--color-border)]">
                                                <Typography variant="h4" className="text-lg font-black capitalize mb-2">{key.replace(/_/g, ' ')}</Typography>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {Object.keys(val).map((subKey) => (
                                                        <div key={subKey} className="space-y-2">
                                                            <InputLabel className="text-[10px] uppercase font-bold tracking-wider">{subKey}</InputLabel>
                                                            <TextInput
                                                                className="h-12"
                                                                value={val[subKey] || ''}
                                                                onChange={(e) => {
                                                                    updateField(key, { ...val, [subKey]: e.target.value });
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Renderizar Campos de Imagen
                                    if (isImageField) {
                                        return (
                                            <div key={key} className="space-y-2">
                                                <InputLabel className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">{key.replace(/_/g, ' ')}</InputLabel>
                                                <div className="flex items-center gap-6 p-6 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[2rem] group hover:border-[var(--color-primary)]/30 transition-all">
                                                    <Surface variant="tertiary" rounding="2xl" className="w-32 h-32 overflow-hidden border border-[var(--color-border)] shadow-inner">
                                                        {val ? <img src={val} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-8 opacity-10" />}
                                                    </Surface>
                                                    <div className="flex-1 space-y-4">
                                                        <Typography variant="small" className="text-xs font-medium opacity-60">Se recomienda una resolución óptima para {key}.</Typography>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="premium"
                                                                className="flex-1 rounded-2xl h-14"
                                                                onClick={() => openMediaBrowser(key)}
                                                            >
                                                                <ImageIcon className="w-4 h-4 mr-2" /> Seleccionar Imagen
                                                            </Button>
                                                            {val && (
                                                                <Button type="button" variant="ghost" className="rounded-2xl h-14" onClick={() => updateField(key, "")}>
                                                                    <Trash2 className="w-4 h-4 text-rose-500" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Renderizar Textos normales
                                    return (
                                        <div key={key} className="space-y-2">
                                            <InputLabel className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">{key.replace(/_/g, ' ')}</InputLabel>
                                            {typeof val === 'string' && val.length > 60 ? (
                                                <TextAreaCustom
                                                    value={val || ''}
                                                    onChange={(e) => updateField(key, e.target.value)}
                                                    onFocus={() => setFocusedField(key)}
                                                    onBlur={() => setFocusedField(null)}
                                                    isFocused={focusedField === key}
                                                    rows={4}
                                                    className="w-full rounded-[1.5rem] bg-[var(--color-bg-secondary)] border-[var(--color-border)] p-6"
                                                />
                                            ) : (
                                                editingBlock.block_type === 'ProductGrid' && key === 'category' ? (
                                                    <select
                                                        className="w-full h-14 bg-[var(--color-bg-secondary)] border-[var(--color-border)] rounded-2xl px-6 font-medium focus:bg-[var(--color-bg-primary)] transition-all"
                                                        value={val || 'all'}
                                                        onChange={(e) => updateField(key, e.target.value)}
                                                    >
                                                        <option value="all">Todas las categorías</option>
                                                        {categories.map(c => (
                                                            <option key={c} value={c}>{c}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <TextInput
                                                        className="w-full h-14 bg-[var(--color-bg-secondary)] border-[var(--color-border)] rounded-2xl px-6 font-medium focus:bg-[var(--color-bg-primary)] transition-all"
                                                        value={val || ''}
                                                        onChange={(e) => updateField(key, e.target.value)}
                                                        onFocus={() => setFocusedField(key)}
                                                        onBlur={() => setFocusedField(null)}
                                                        isFocused={focusedField === key}
                                                    />
                                                )
                                            )}
                                        </div>
                                    );
                                })}

                                {(!data.payload_json || Object.keys(data.payload_json).length === 0) && (
                                    <div className="py-20 text-center border-2 border-dashed border-[var(--color-border)] rounded-[3rem] opacity-20">
                                        <Sparkles className="w-12 h-12 mx-auto mb-4" />
                                        <Typography variant="p">Este bloque no tiene configuración visual disponible.</Typography>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-8 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex justify-end gap-3 rounded-b-[2.5rem]">
                        <Button
                            variant="ghost"
                            className="rounded-2xl h-12 px-8 font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                            onClick={() => setEditingBlock(null)}
                        >
                            Cancelar
                        </Button>
                        <Button variant="premium" className="h-12 px-10 rounded-2xl shadow-xl shadow-[var(--color-primary)]/10" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            Sincronizar Cambios
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Selector de Nuevo Bloque - Premium Grid */}
            <Modal show={isSelectingBlock} onClose={() => setIsSelectingBlock(false)} maxWidth="2xl" className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] shadow-2xl rounded-[3rem]">
                <div className="p-10 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    <div className="mb-10 text-center">
                        <Typography variant="h2" className="text-4xl leading-tight mb-2">Componentes Disponibles</Typography>
                        <Typography variant="muted" className="text-sm font-bold opacity-60">Selecciona una estructura para inyectar en tu landing page.</Typography>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { id: 'Hero', ns: 'Core', title: 'Hero', desc: 'Portada de alto impacto con CTAs principales.', icon: Sparkles, color: 'text-amber-400' },
                            { id: 'InteractiveHero', ns: 'Core', title: 'Interactive Hero', desc: 'Soporte de video y efectos cinemáticos.', icon: Wand2, color: 'text-blue-400', premium: true },
                            { id: 'Features', ns: 'Core', title: 'Features', desc: 'Cuadrícula de ventajas competitivas.', icon: Package, color: 'text-purple-400' },
                            { id: 'ReviewsCarousel', ns: 'Core', title: 'Reviews', desc: 'Carrusel dinámico de reseñas aprobadas.', icon: Sparkles, color: 'text-amber-500' },
                            { id: 'DynamicForm', ns: 'Core', title: 'Dynamic Form', desc: 'Formulario dinámico para captación de clientes.', icon: Send, color: 'text-cyan-400' },
                            { id: 'ProductGrid', ns: 'Ecommerce', title: 'Catalog', desc: 'Muestra de productos en tiempo real.', icon: ShoppingBag, color: 'text-emerald-400', module: 'shopping-cart' },
                            { id: 'Footer', ns: 'Core', title: 'Footer', desc: 'Estructura legal y navegación inferior.', icon: Footprints, color: 'text-rose-400' }
                        ].filter(item => !item.module || isModuleEnabled(item.module)).map((item) => (
                            <Surface
                                key={item.id}
                                variant="tertiary"
                                rounding="2xl"
                                className="p-6 cursor-pointer hover:border-[var(--color-primary)] border border-white/5 transition-all group relative overflow-hidden h-full"
                                onClick={() => {
                                    setIsSelectingBlock(false);
                                    router.post(route('admin.landing-page.store', page.id), {
                                        module_namespace: item.ns,
                                        block_type: item.id
                                    });
                                }}
                            >
                                {item.premium && (
                                    <div className="absolute top-0 right-0 py-1 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[8px] font-black tracking-[0.2em] uppercase rounded-bl-xl shadow-lg">
                                        Premium
                                    </div>
                                )}
                                <div className={cn("mb-4 p-3 rounded-xl bg-white/5 w-fit group-hover:scale-110 group-hover:bg-white/10 transition-all", item.color)}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <Typography variant="h4" className="mb-2 group-hover:text-[var(--color-primary)] transition-colors">{item.title}</Typography>
                                <Typography variant="small" className="leading-relaxed font-medium">{item.desc}</Typography>
                            </Surface>
                        ))}
                    </div>

                    <div className="mt-10 flex justify-center">
                        <button
                            onClick={() => setIsSelectingBlock(false)}
                            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] font-black uppercase text-[10px] tracking-widest transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" /> Cancelar operación
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Media Browser Integration */}
            <MediaBrowser
                show={mediaBrowserOpen}
                onClose={() => setMediaBrowserOpen(false)}
                onSelect={handleMediaSelect}
            />

            {/* Icon Browser Integration */}
            <IconBrowser
                show={iconBrowserOpen}
                onClose={() => setIconBrowserOpen(false)}
                onSelect={handleIconSelect}
            />
        </AuthenticatedLayout>
    );
}
