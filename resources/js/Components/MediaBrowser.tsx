import React, { useState, useEffect, useRef } from 'react';
import Modal from '@/Components/Modal';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { Surface } from '@/Components/ui/Surface';
import { X, Image as ImageIcon, Upload, Search, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { toast } from '@/Stores/useToastStore';

interface MediaItem {
    id: number;
    url: string;
    name: string;
    mime_type: string;
    size: number;
}

interface MediaBrowserProps {
    show: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
}

export default function MediaBrowser({ show, onClose, onSelect }: MediaBrowserProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [tab, setTab] = useState<'library' | 'upload'>('library');
    const [mediaList, setMediaList] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (show) {
            fetchMedia();
        }
    }, [show]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/media');
            setMediaList(response.data);
        } catch (error) {
            console.error('Error fetching media:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const response = await axios.post('/admin/media', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const newMedia = response.data;
            setMediaList([newMedia, ...mediaList]);
            setSelected(newMedia.url);
            setTab('library');
            toast.success('¡Archivo subido!', 'La imagen se guardó correctamente en tu galería.');
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Error de subida', 'Revisa el formato y tamaño del archivo (Máximo 5MB).');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteMedia = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!confirm('¿Estás seguro de eliminar este archivo?')) return;

        try {
            await axios.delete(`/admin/media/${id}`);
            setMediaList(mediaList.filter(item => item.id !== id));
            toast.info('Archivo eliminado', 'La imagen ha sido borrada de forma permanente.');
            if (selected && mediaList.find(m => m.id === id)?.url === selected) {
                setSelected(null);
            }
        } catch (error) {
            console.error('Error deleting media:', error);
            toast.error('Error al eliminar', 'Tuvimos problemas al procesar tu solicitud.');
        }
    };

    const handleConfirm = () => {
        if (selected) {
            onSelect(selected);
            onClose();
        }
    };

    const filteredMedia = mediaList.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Modal show={show} onClose={onClose} maxWidth="4xl" zIndex={60}>
            <div className="flex flex-col h-[85vh] bg-[var(--color-bg-primary)] overflow-hidden rounded-[2.5rem] border border-[var(--color-border)] shadow-2xl">
                {/* Header */}
                <div className="p-8 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-secondary)]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--color-primary)]/10 rounded-2xl text-[var(--color-primary)]">
                            <ImageIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <Typography variant="h3" className="font-black">Biblioteca de Medios</Typography>
                            <Typography variant="muted" className="text-xs font-bold uppercase tracking-widest opacity-60">Gestiona tus activos visuales</Typography>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-xl transition-colors">
                        <X className="w-6 h-6 text-[var(--color-text-muted)]" />
                    </button>
                </div>

                {/* Tabs & Search */}
                <div className="px-8 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-tertiary)]/20">
                    <div className="flex gap-2">
                        <Button
                            variant={tab === 'library' ? 'premium' : 'ghost'}
                            size="sm"
                            className="rounded-xl"
                            onClick={() => setTab('library')}
                        >
                            Explorar
                        </Button>
                        <Button
                            variant={tab === 'upload' ? 'premium' : 'ghost'}
                            size="sm"
                            className="rounded-xl"
                            onClick={() => setTab('upload')}
                        >
                            Subir Nuevo
                        </Button>
                    </div>
                    <div className="relative w-64 hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Buscar imagen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-[var(--color-primary)]/50 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[var(--color-bg-tertiary)]/5">
                    {tab === 'library' ? (
                        <>
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
                                </div>
                            ) : filteredMedia.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    {filteredMedia.map((item, idx) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="relative group cursor-pointer"
                                            onClick={() => setSelected(item.url)}
                                        >
                                            <Surface
                                                variant="tertiary"
                                                rounding="2xl"
                                                size="none"
                                                className={cn(
                                                    "aspect-square overflow-hidden border-2 transition-all duration-300 relative",
                                                    selected === item.url ? "border-[var(--color-primary)] shadow-lg scale-95" : "border-transparent group-hover:border-[var(--color-primary)]/30"
                                                )}
                                            >
                                                <img src={item.url} className="w-full h-full object-cover" alt={item.name} />

                                                {/* Selection Overlay */}
                                                <div className={cn(
                                                    "absolute inset-0 bg-[var(--color-primary)]/10 flex items-center justify-center transition-opacity duration-300",
                                                    selected === item.url ? "opacity-100" : "opacity-0"
                                                )}>
                                                    <CheckCircle2 className="w-8 h-8 text-[var(--color-primary)] bg-white rounded-full p-0.5 shadow-xl" />
                                                </div>

                                                {/* Actions Overlay */}
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => handleDeleteMedia(e, item.id)}
                                                        className="p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 shadow-lg"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </Surface>
                                            <div className="mt-2 text-center">
                                                <Typography variant="small" className="text-[9px] font-bold uppercase tracking-tight truncate block opacity-40 px-1">
                                                    {item.name}
                                                </Typography>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-30">
                                    <ImageIcon className="w-16 h-16 mb-4" />
                                    <Typography variant="h4">No se encontraron archivos</Typography>
                                    <Typography variant="p">Sube tu primera imagen para comenzar</Typography>
                                </div>
                            )}
                        </>
                    ) : (
                        <div
                            className={cn(
                                "h-full flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-border)] rounded-[2.5rem] bg-[var(--color-bg-tertiary)]/10 transition-colors",
                                uploading && "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                            )}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                accept="image/*"
                            />

                            {uploading ? (
                                <div className="flex flex-col items-center">
                                    <Loader2 className="w-16 h-16 text-[var(--color-primary)] animate-spin mb-4" />
                                    <Typography variant="h4" className="font-black">Subiendo activo...</Typography>
                                    <Typography variant="muted">Esto tomará solo un momento</Typography>
                                </div>
                            ) : (
                                <>
                                    <div className="p-6 bg-[var(--color-primary)]/10 rounded-full mb-6 relative">
                                        <Upload className="w-12 h-12 text-[var(--color-primary)]" />
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="absolute -inset-2 bg-[var(--color-primary)]/10 rounded-full"
                                        />
                                    </div>
                                    <Typography variant="h4" className="mb-2 font-black">Suelta tus archivos aquí</Typography>
                                    <Typography variant="muted" className="mb-8 font-medium">Soportamos JPG, PNG, WebP y SVG de hasta 5MB</Typography>
                                    <Button
                                        variant="premium"
                                        className="rounded-2xl px-12 h-16 text-lg shadow-xl shadow-[var(--color-primary)]/20"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Seleccionar Archivo
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex justify-between items-center">
                    <div>
                        {selected && (
                            <Typography variant="small" className="text-[var(--color-primary)] font-black text-[10px] uppercase tracking-widest">
                                Activo Seleccionado ✓
                            </Typography>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose} className="rounded-2xl h-12 px-8">Cancelar</Button>
                        <Button
                            variant="premium"
                            disabled={!selected || uploading}
                            onClick={handleConfirm}
                            className="rounded-2xl h-12 px-10 shadow-xl shadow-[var(--color-primary)]/20"
                        >
                            {selected ? 'Confirmar Selección' : 'Seleccionar un Activo'}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
