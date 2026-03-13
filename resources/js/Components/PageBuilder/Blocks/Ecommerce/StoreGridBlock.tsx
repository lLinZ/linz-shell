import React from 'react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { blockRegistry, BlockProps } from '../../BlockRegistry';
import { ShoppingCart, Eye, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/Stores/useCartStore';
import { Link } from '@inertiajs/react';

/**
 * StoreGridBlock component - High-End Catalog Edition
 * Renders a grid of products with a premium, boutique-style aesthetic.
 */
const StoreGridBlock: React.FC<BlockProps> = ({ payload }) => {
    const products = payload.products || [];
    const addItem = useCartStore((state: any) => state.addItem);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    } as any;

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    } as any;

    const formatPrice = (price: string | number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Number(price));
    };

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg-primary)] overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                {payload.title && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="mb-20 text-center"
                    >
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-[10px] font-black uppercase tracking-[0.2em]">
                            <Sparkles className="w-3 h-3" />
                            Exclusividad Linz
                        </div>
                        <Typography variant="h2" className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-6">
                            {payload.title}
                        </Typography>
                        <div className="h-1.5 w-24 bg-gradient-to-r from-[var(--color-primary)] to-transparent mx-auto rounded-full" />
                    </motion.div>
                )}

                {products.length === 0 ? (
                    <Surface variant="secondary" className="p-20 text-center rounded-[3rem] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/30 backdrop-blur-sm">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-muted)] opacity-20" />
                        <Typography variant="h4" className="text-xl font-bold opacity-40">
                            Preparando la nueva colección...
                        </Typography>
                    </Surface>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12"
                    >
                        {products.map((product: any) => (
                            <motion.div key={product.id} variants={cardVariants}>
                                <Surface
                                    variant="secondary"
                                    className="group relative h-full flex flex-col rounded-[2.5rem] overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-[var(--color-primary)]/5"
                                >
                                    {/* Product Visual Area */}
                                    <div className="aspect-[4/5] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 relative">
                                        <Link href={route('shop.product', product.slug)}>
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                            />
                                        </Link>

                                        {/* Badge Logic */}
                                        <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
                                            {product.stock <= 5 && product.stock > 0 && (
                                                <div className="px-3 py-1.5 glass bg-orange-500/80 backdrop-blur-md rounded-xl text-white text-[9px] font-black uppercase tracking-wider shadow-lg animate-pulse">
                                                    Escaso
                                                </div>
                                            )}
                                            {product.stock <= 0 && (
                                                <div className="px-3 py-1.5 glass bg-zinc-800/90 backdrop-blur-md rounded-xl text-white text-[9px] font-black uppercase tracking-wider shadow-lg">
                                                    Fuera de Stock
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                            <Link
                                                href={route('shop.product', product.slug)}
                                                className="rounded-full h-12 w-12 bg-white text-black hover:bg-[var(--color-primary)] hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75 flex items-center justify-center shadow-lg"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </Link>
                                            <Button
                                                onClick={() => addItem(product)}
                                                disabled={product.stock <= 0}
                                                className="rounded-full h-12 w-12 bg-[var(--color-primary)] text-white hover:bg-black transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                                            >
                                                <ShoppingCart className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div className="p-7 flex-1 flex flex-col bg-gradient-to-b from-transparent to-[var(--color-bg-secondary)]/50">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <Link href={route('shop.product', product.slug)}>
                                                    <Typography variant="h4" className="text-xl font-black tracking-tight leading-tight group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                                                        {product.name}
                                                    </Typography>
                                                </Link>
                                            </div>
                                            <Typography variant="small" className="text-[var(--color-text-muted)] line-clamp-2 mb-6 font-medium leading-relaxed italic opacity-80 uppercase text-[9px] tracking-widest">
                                                {product.description}
                                            </Typography>
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-[var(--color-border)]/50">
                                            <div className="flex justify-between items-end">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Precio Unitario</span>
                                                    <Typography className="text-3xl font-black tracking-tighter text-[var(--color-text-primary)]">
                                                        {formatPrice(product.price)}
                                                    </Typography>
                                                </div>

                                                <Button
                                                    variant="premium"
                                                    size="sm"
                                                    className="rounded-2xl px-6 h-10 font-bold active:scale-95 transition-all shadow-xl shadow-[var(--color-primary)]/10"
                                                    disabled={product.stock <= 0}
                                                    onClick={() => addItem(product)}
                                                >
                                                    Comprar
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Surface>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
};

// Register the block in the 'Ecommerce' namespace
blockRegistry.register('Ecommerce', 'ProductGrid', StoreGridBlock);

export default StoreGridBlock;
