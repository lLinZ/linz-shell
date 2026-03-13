import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useState, useRef } from 'react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Image, Upload, Trash2, Edit3, Save, Sparkles, ShoppingBag, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Checkbox from '@/Components/Checkbox';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category?: string | null;
    tags?: string[] | null;
    is_active: boolean;
    image_url: string | null;
    images?: string[] | null;
}

export default function Index({ auth, products }: PageProps<{ products: Product[] }>) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [editing, setEditing] = useState(false);

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

    const { data, setData, post, transform, processing, reset, errors, clearErrors } = useForm({
        id: 0,
        name: '',
        description: '',
        price: '',
        is_active: true,
        category: '',
        tags: '', // Comma separated in UI
        image: null as File | null,
        images: [] as File[],
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setData('images', files);

            const newPreviews: string[] = [];
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviews.push(reader.result as string);
                    if (newPreviews.length === files.length) {
                        setGalleryPreviews(newPreviews);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (editing) {
            transform((data) => ({
                ...data,
                _method: 'PUT',
                tags: typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()).filter(t => t !== '') : data.tags,
            }));

            post(route('admin.products.update', data.id), {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setEditing(false);
                    setImagePreview(null);
                    setGalleryPreviews([]);
                }
            });
        } else {
            transform((data) => ({
                ...data,
                _method: undefined,
                tags: typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()).filter(t => t !== '') : data.tags,
            }));

            post(route('admin.products.store'), {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setImagePreview(null);
                    setGalleryPreviews([]);
                }
            });
        }
    };

    const editProduct = (product: Product) => {
        clearErrors();
        setEditing(true);
        setData({
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            is_active: !!product.is_active,
            category: product.category || '',
            tags: product.tags ? product.tags.join(', ') : '',
            image: null,
            images: [],
        });
        setImagePreview(product.image_url);
        setGalleryPreviews(product.images || []);
    };

    const cancelEdit = () => {
        setEditing(false);
        reset();
        setImagePreview(null);
        setGalleryPreviews([]);
        clearErrors();
    };

    const deleteProduct = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            router.delete(route('admin.products.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Productos - Premium Experience" />

            <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-[var(--color-primary)]/10 rounded-2xl text-[var(--color-primary)]">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <div>
                                <Typography variant="gradient">
                                    Catálogo de Productos
                                </Typography>
                                <Typography variant="muted" className="text-lg font-medium opacity-60">
                                    Gestiona tu inventario y oferta comercial con galerías extendidas.
                                </Typography>
                            </div>
                        </div>
                    </div>

                    <Surface variant="tertiary" rounding="2xl" className="hidden lg:flex items-center gap-2 px-6 py-3 border-[var(--color-border)] backdrop-blur-sm">
                        <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                        <Typography variant="small" className="font-black uppercase tracking-widest opacity-60">Multi-Media Core</Typography>
                    </Surface>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-1"
                    >
                        <Surface variant="premium" rounding="3xl" shadow="2xl" className="p-8 h-fit sticky top-24 border-[var(--color-border)] overflow-hidden" glow>
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <ShoppingBag className="w-32 h-32" />
                            </div>

                            <Typography variant="h3" className="mb-8 font-black flex items-center gap-2">
                                {editing ? <Edit3 className="w-5 h-5 text-[var(--color-primary)]" /> : <Plus className="w-5 h-5 text-[var(--color-primary)]" />}
                                {editing ? 'Editar Producto' : 'Nuevo Producto'}
                            </Typography>

                            <form onSubmit={submit} className="space-y-8 relative z-10">
                                <div className="space-y-2">
                                    <Typography variant="small" className="font-black uppercase tracking-widest opacity-40">IMAGEN PRINCIPAL</Typography>
                                    <Input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                    <Surface
                                        variant="tertiary"
                                        rounding="2xl"
                                        interactive
                                        className="mt-2 border-2 border-dashed border-[var(--color-border)] p-2 relative aspect-video"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <div className="relative h-full w-full rounded-xl overflow-hidden shadow-2xl">
                                                <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                                <div className="absolute inset-0 bg-[var(--color-bg-primary)]/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300">
                                                    <Upload className="text-[var(--color-text-primary)] w-8 h-8 mb-2 translate-y-4 group-hover:translate-y-0 transition-transform" />
                                                    <Typography variant="small" className="text-[var(--color-text-primary)] font-bold translate-y-4 group-hover:translate-y-0 transition-transform delay-75">Cambiar Imagen</Typography>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors">
                                                <div className="p-4 rounded-full bg-[var(--color-bg-primary)]/10 mb-3 group-hover:scale-110 transition-transform">
                                                    <Image className="w-8 h-8 opacity-40" />
                                                </div>
                                                <Typography variant="small" className="font-bold opacity-60">Haz clic para subir</Typography>
                                            </div>
                                        )}
                                    </Surface>
                                    {errors.image && <Typography variant="small" className="text-[var(--color-danger)] mt-2 font-bold uppercase text-[10px] tracking-widest">{errors.image}</Typography>}
                                </div>

                                <div className="space-y-2">
                                    <Typography variant="small" className="font-black uppercase tracking-widest opacity-40">GALERÍA ADICIONAL</Typography>
                                    <Input
                                        type="file"
                                        multiple
                                        ref={galleryInputRef}
                                        className="hidden"
                                        onChange={handleGalleryChange}
                                        accept="image/*"
                                    />
                                    <div
                                        className="mt-2 flex flex-wrap gap-2 p-3 border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/30 rounded-2xl cursor-pointer min-h-[100px]"
                                        onClick={() => galleryInputRef.current?.click()}
                                    >
                                        <AnimatePresence>
                                            {galleryPreviews.map((prev, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="w-16 h-16 rounded-lg overflow-hidden relative group"
                                                >
                                                    <img src={prev} className="w-full h-full object-cover" />
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        <div className="w-16 h-16 rounded-lg flex flex-col items-center justify-center border border-[var(--color-border)] opacity-40 hover:opacity-100 transition-opacity bg-[var(--color-bg-tertiary)]/50">
                                            <Plus className="w-5 h-5" />
                                            <Typography variant="small" className="text-[8px] font-black uppercase">Subir</Typography>
                                        </div>
                                    </div>
                                    <Typography variant="small" className="text-[var(--color-text-muted)] opacity-40 italic text-[10px]">
                                        * Las imágenes de galería reemplazarán a las anteriores al guardar.
                                    </Typography>
                                </div>

                                <div className="grid gap-6">
                                    <div>
                                        <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 mb-2 block">NOMBRE</Typography>
                                        <Input
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Nombre del producto..."
                                            required
                                        />
                                        {errors.name && <Typography variant="small" className="text-[var(--color-danger)] mt-1">{errors.name}</Typography>}
                                    </div>

                                    <div>
                                        <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 mb-2 block">PRECIO (USD)</Typography>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none opacity-40 font-bold">$</div>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="pl-8 font-bold"
                                                value={data.price}
                                                onChange={(e) => setData('price', e.target.value)}
                                                required
                                            />
                                        </div>
                                        {errors.price && <Typography variant="small" className="text-[var(--color-danger)] mt-1">{errors.price}</Typography>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 mb-2 block">CATEGORÍA</Typography>
                                        <Input
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value)}
                                            placeholder="Opcional: Calzado..."
                                        />
                                    </div>

                                    <div>
                                        <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 mb-2 block">TAGS</Typography>
                                        <Input
                                            value={data.tags}
                                            onChange={(e) => setData('tags', e.target.value)}
                                            placeholder="nuevo, oferta..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 mb-2 block">DESCRIPCIÓN</Typography>
                                    <Textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        placeholder="Características principales..."
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-tertiary)]/30 rounded-2xl border border-[var(--color-border)]">
                                    <Checkbox
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded-md border-[var(--color-primary)] text-[var(--color-primary)]"
                                    />
                                    <Typography variant="small" className="font-bold opacity-80 cursor-pointer" onClick={() => setData('is_active', !data.is_active)}>
                                        Producto Activo en Tienda
                                    </Typography>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    {editing && (
                                        <Button variant="outline" type="button" onClick={cancelEdit} className="flex-1" rounding="2xl">
                                            Cancelar
                                        </Button>
                                    )}
                                    <Button variant="premium" className="flex-1 h-12" rounding="2xl" disabled={processing}>
                                        <Save className="w-4 h-4 mr-2" />
                                        {editing ? 'Guardar Cambios' : 'Registrar Producto'}
                                    </Button>
                                </div>
                            </form>
                        </Surface>
                    </motion.div>

                    <div className="lg:col-span-2">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Surface variant="premium" rounding="3xl" shadow="2xl" className="p-0 overflow-hidden border-[var(--color-border)]" glow>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 backdrop-blur-md">
                                                <th className="p-6"><Typography variant="small" className="font-black uppercase tracking-widest opacity-40">PRODUCTO</Typography></th>
                                                <th className="p-6 text-right"><Typography variant="small" className="font-black uppercase tracking-widest opacity-40">PRECIO</Typography></th>
                                                <th className="p-6 text-center"><Typography variant="small" className="font-black uppercase tracking-widest opacity-40">ESTADO</Typography></th>
                                                <th className="p-6"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--color-border)]">
                                            {products.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-20 text-center">
                                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                                            <ShoppingBag className="w-16 h-16" />
                                                            <Typography variant="h3">Catálogo vacío.</Typography>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            {products.map((product) => (
                                                <motion.tr
                                                    key={product.id}
                                                    variants={itemVariants}
                                                    className="hover:bg-[var(--color-bg-tertiary)]/30 transition-all duration-300 group"
                                                >
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-5">
                                                            <Surface variant="tertiary" rounding="xl" size="none" className="w-16 h-16 overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg relative border border-[var(--color-border)]">
                                                                {product.image_url ? (
                                                                    <img src={product.image_url} className="w-full h-full object-cover" alt={product.name} />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center opacity-20">
                                                                        <Image className="w-6 h-6" />
                                                                    </div>
                                                                )}
                                                                {product.images && product.images.length > 0 && (
                                                                    <div className="absolute bottom-1 right-1 px-1 rounded-md bg-[var(--color-bg-primary)]/80 text-[8px] font-black text-[var(--color-text-primary)] backdrop-blur-sm">
                                                                        +{product.images.length}
                                                                    </div>
                                                                )}
                                                            </Surface>
                                                            <div>
                                                                <Typography variant="p" className="font-black text-lg group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">{product.name}</Typography>
                                                                <Typography variant="muted" className="text-xs font-medium line-clamp-1 opacity-60">
                                                                    {product.images && product.images.length > 0 ? `${product.images.length + 1} fotos` : '1 foto'} • {product.description || 'Sin descripción'}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <Surface variant="secondary" rounding="2xl" className="inline-block px-4 py-2 border border-[var(--color-border)]">
                                                            <Typography variant="p" className="font-black text-[var(--color-primary)]">
                                                                ${Number(product.price).toFixed(2)}
                                                            </Typography>
                                                        </Surface>
                                                    </td>
                                                    <td className="p-6 text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => router.patch(route('admin.products.update', product.id), { is_active: !product.is_active }, { preserveScroll: true })}
                                                            className={cn(
                                                                "inline-flex items-center gap-2 rounded-full px-4 h-8 text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                                                                product.is_active
                                                                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20"
                                                                    : "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20"
                                                            )}
                                                        >
                                                            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", product.is_active ? "bg-[var(--color-primary)]" : "bg-[var(--color-danger)]")} />
                                                            {product.is_active ? 'Activo' : 'Pausado'}
                                                        </Button>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex justify-end gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 md:translate-x-4 md:group-hover:translate-x-0">
                                                            <Button variant="ghost" size="icon" onClick={() => editProduct(product)} rounding="xl" className="hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                                                <Edit3 className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="destructive" size="icon" onClick={() => deleteProduct(product.id)} rounding="full">
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
