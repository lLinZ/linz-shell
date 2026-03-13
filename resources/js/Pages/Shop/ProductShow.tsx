import React, { useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RefreshCcw, Star, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/Stores/useCartStore';
import { cn } from '@/lib/utils';
import { Tag, Hash } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: string | number;
    image_url: string;
    images?: string[] | null;
    stock: number;
    category?: string | null;
    tags?: string[] | null;
}

interface Props {
    product: Product;
    relatedProducts: Product[];
}

export default function ProductShow({ product, relatedProducts }: Props) {
    const addItem = useCartStore((state: any) => state.addItem);
    const allImages = [product.image_url, ...(product.images || [])];
    const [currentImageIdx, setCurrentImageIdx] = useState(0);

    const formatPrice = (price: string | number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Number(price));
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    } as any;

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    } as any;

    const nextImage = () => {
        setCurrentImageIdx((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        setCurrentImageIdx((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    return (
        <PublicLayout title={`${product.name} - Linz Premium Store`}>
            <Head title={`${product.name} - Linz Premium Store`} />

            <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <Link
                    href={route('shop.index')}
                    className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all mb-12 group/back"
                    aria-label="Volver al catálogo de productos"
                >
                    <ArrowLeft className="w-4 h-4 group-hover/back:-translate-x-1 transition-transform" />
                    <Typography variant="small" className="font-bold uppercase tracking-widest text-inherit">
                        Volver al Catálogo
                    </Typography>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Left: Product Image Gallery */}
                    <div className="space-y-6" role="region" aria-label="Galería de imágenes del producto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="relative group"
                        >
                            <Surface
                                variant="premium"
                                rounding="3xl"
                                className="overflow-hidden border-white/5 shadow-2xl relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5]"
                            >
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={currentImageIdx}
                                        src={allImages[currentImageIdx]}
                                        alt={`${product.name} - Imagen ${currentImageIdx + 1}`}
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </AnimatePresence>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                                {/* Navigation Arrows */}
                                {allImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/50 z-20"
                                            aria-label="Imagen anterior"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/50 z-20"
                                            aria-label="Siguiente imagen"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </>
                                )}

                                {/* Premium floating badge */}
                                <div className="absolute top-8 right-8 z-10">
                                    <Surface variant="tertiary" className="bg-black/20 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center">
                                        <Sparkles className="w-6 h-6 text-amber-500 mb-1" />
                                        <Typography variant="small" className="text-[10px] font-black uppercase tracking-widest text-white text-center leading-none">
                                            Edición<br />Limitada
                                        </Typography>
                                    </Surface>
                                </div>
                            </Surface>
                        </motion.div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex flex-wrap gap-4" role="list">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIdx(idx)}
                                        role="listitem"
                                        aria-label={`Ver imagen ${idx + 1}`}
                                        aria-current={currentImageIdx === idx}
                                        className={cn(
                                            "w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all",
                                            currentImageIdx === idx ? "border-[var(--color-primary)] scale-110 shadow-lg" : "border-white/5 opacity-40 hover:opacity-100"
                                        )}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt="" aria-hidden="true" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Details */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-10"
                    >
                        <motion.div variants={itemVariants} className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 shadow-sm">
                                    <Typography variant="small" className="text-[var(--color-primary)] text-[10px] font-black uppercase tracking-widest leading-none">
                                        Nuevo Ingreso
                                    </Typography>
                                </div>
                                {product.category && (
                                    <div className="px-3 py-1 rounded-full bg-zinc-500/10 border border-zinc-500/20 shadow-sm flex items-center gap-1.5 transition-colors hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/20 group/cat">
                                        <Tag className="w-3 h-3 text-[var(--color-text-muted)] group-hover/cat:text-[var(--color-primary)]" />
                                        <Typography variant="small" className="text-[var(--color-text-muted)] group-hover/cat:text-[var(--color-primary)] text-[10px] font-black uppercase tracking-widest leading-none">
                                            {product.category}
                                        </Typography>
                                    </div>
                                )}
                                <div className="flex items-center gap-1" aria-label="Calificación de 5 estrellas">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                                    ))}
                                    <Typography variant="small" className="ml-2 text-[var(--color-text-muted)] text-xs font-bold">
                                        (24 reseñas)
                                    </Typography>
                                </div>
                            </div>
                            <Typography variant="h1" className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                                {product.name}
                            </Typography>
                            <div className="flex items-end gap-4" aria-label={`Precio: ${formatPrice(product.price)}`}>
                                <Typography className="text-5xl font-black text-[var(--color-text-primary)] tracking-tighter">
                                    {formatPrice(product.price)}
                                </Typography>
                                <Typography variant="muted" className="text-xl line-through mb-1.5 opacity-50" aria-label="Precio original">
                                    {formatPrice(Number(product.price) * 1.2)}
                                </Typography>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Typography variant="p" className="text-lg leading-relaxed text-[var(--color-text-muted)] max-w-xl font-medium">
                                {product.description || 'Una pieza maestra diseñada para aquellos que buscan la excelencia en cada detalle. Fabricado con materiales de la más alta calidad y un acabado artesanal único.'}
                            </Typography>
                        </motion.div>

                        <motion.div variants={itemVariants} className="pt-6 border-t border-[var(--color-border)]/50 space-y-8">
                            {/* Tags Section */}
                            {product.tags && product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {product.tags.map((tag) => (
                                        <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-[9px] font-black uppercase tracking-widest hover:border-[var(--color-primary)]/30 transition-all cursor-default">
                                            <Hash className="w-2.5 h-2.5 text-[var(--color-primary)]/40" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Features Mini-Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="complementary" aria-label="Características de servicio">
                                <Surface variant="tertiary" className="flex flex-col gap-2 p-4 rounded-2xl bg-[var(--color-bg-tertiary)]/50 border border-[var(--color-border)]/30 transition-colors">
                                    <Truck className="w-5 h-5 text-[var(--color-primary)]" aria-hidden="true" />
                                    <Typography variant="small" className="text-[10px] font-black uppercase tracking-tight text-[var(--color-text-primary)]">
                                        Envío Express<br />Gratis
                                    </Typography>
                                </Surface>
                                <Surface variant="tertiary" className="flex flex-col gap-2 p-4 rounded-2xl bg-[var(--color-bg-tertiary)]/50 border border-[var(--color-border)]/30 transition-colors">
                                    <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" aria-hidden="true" />
                                    <Typography variant="small" className="text-[10px] font-black uppercase tracking-tight text-[var(--color-text-primary)]">
                                        Garantía de<br />Por Vida
                                    </Typography>
                                </Surface>
                                <Surface variant="tertiary" className="flex flex-col gap-2 p-4 rounded-2xl bg-[var(--color-bg-tertiary)]/50 border border-[var(--color-border)]/30 transition-colors">
                                    <RefreshCcw className="w-5 h-5 text-[var(--color-primary)]" aria-hidden="true" />
                                    <Typography variant="small" className="text-[10px] font-black uppercase tracking-tight text-[var(--color-text-primary)]">
                                        Cambios<br />Sencillos
                                    </Typography>
                                </Surface>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 items-center">
                                <Button
                                    className="w-full sm:w-auto h-16 px-12 rounded-[1.25rem] text-lg font-black bg-[var(--color-primary)] text-white hover:bg-black transition-all active:scale-95 shadow-xl shadow-[var(--color-primary)]/20"
                                    onClick={() => addItem(product)}
                                    disabled={product.stock <= 0}
                                    aria-label={`Añadir ${product.name} al carrito`}
                                >
                                    <ShoppingCart className="w-6 h-6 mr-3" aria-hidden="true" />
                                    Añadir al Carrito
                                </Button>

                                <div className="flex flex-col sm:items-start items-center">
                                    <Typography variant="small" className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
                                        Stock Disponible
                                    </Typography>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                "w-2 h-2 rounded-full",
                                                product.stock > 0 ? "bg-green-500 animate-pulse" : "bg-red-500"
                                            )}
                                            aria-hidden="true"
                                        />
                                        <Typography className="text-sm font-bold">
                                            {product.stock > 0 ? `${product.stock} unidades listas para envío` : 'Agotado Temporalmente'}
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Related Products Section */}
                <motion.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-32 pt-20 border-t border-[var(--color-border)]"
                    aria-labelledby="related-products-title"
                >
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <Typography variant="h2" id="related-products-title" className="text-4xl font-black mb-2">
                                También te podría gustar
                            </Typography>
                            <Typography variant="muted" className="text-sm font-bold uppercase tracking-[0.2em]">
                                Sugerencias de la Colección
                            </Typography>
                        </div>
                        <Link
                            href={route('shop.index')}
                            className="hidden sm:inline-flex"
                        >
                            <Typography
                                variant="small"
                                className="text-[var(--color-primary)] font-black uppercase text-[10px] tracking-widest hover:underline decoration-2 underline-offset-4"
                            >
                                Ver Todo
                            </Typography>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedProducts.map((p) => (
                            <Link key={p.id} href={route('shop.product', p.slug)} className="group outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-[2rem]">
                                <Surface variant="secondary" className="rounded-[2rem] overflow-hidden border border-[var(--color-border)] group-hover:border-[var(--color-primary)]/30 transition-all shadow-sm hover:shadow-xl">
                                    <div className="aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-b border-[var(--color-border)]/50">
                                        <img
                                            src={p.image_url}
                                            alt=""
                                            aria-hidden="true"
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <Typography className="font-black text-lg group-hover:text-[var(--color-primary)] transition-colors mb-1 truncate">
                                            {p.name}
                                        </Typography>
                                        <Typography className="font-black text-[var(--color-text-muted)]">
                                            {formatPrice(p.price)}
                                        </Typography>
                                    </div>
                                </Surface>
                            </Link>
                        ))}
                    </div>
                </motion.section>
            </div>
        </PublicLayout>
    );
}
