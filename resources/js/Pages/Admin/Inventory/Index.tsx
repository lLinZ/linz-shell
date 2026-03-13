import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useRealtime } from '@/Hooks/useRealtime';
import { useState } from 'react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { motion } from 'framer-motion';
import { Box, Sparkles, TrendingUp, AlertCircle, Minus, Plus, ChevronLeft, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

interface Product {
    id: number;
    name: string;
    stock: number;
    price: number;
}

export default function Index({ auth, products: initialProducts }: PageProps<{ products: Product[] }>) {
    // Listen for real-time updates to 'Product' model
    const { data: products } = useRealtime<Product>('Product', initialProducts);

    const updateStock = (product: Product, newStock: number) => {
        if (newStock < 0) return;

        router.patch(route('admin.inventory.update', product.id), {
            stock: newStock
        }, {
            preserveScroll: true,
        });
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
            <Head title="Inventario - Premium Strategy" />

            <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
                            Panel Principal
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-[var(--color-primary)]/10 rounded-2xl text-[var(--color-primary)]">
                                <Box className="w-8 h-8" />
                            </div>
                            <div>
                                <Typography variant="gradient">
                                    Control de Inventario
                                </Typography>
                                <Typography variant="muted" className="text-lg font-medium opacity-60">
                                    Monitorea y actualiza existencias en tiempo real.
                                </Typography>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-4">
                        <Link
                            href={route('admin.inventory.movements')}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] backdrop-blur-sm hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-bg-primary)] transition-all group"
                        >
                            <ArrowRightLeft className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                            <span className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors">Historial de Movimientos</span>
                        </Link>
                        <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] backdrop-blur-sm">
                            <TrendingUp className="w-5 h-5 text-[var(--color-primary)]" />
                            <span className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">Stock Live</span>
                        </div>
                    </div>
                </motion.div>

                {/* --- Statistics Preview --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <Surface variant="premium" rounding="2xl" shadow="lg" className="p-6 flex items-center gap-4">
                        <div className="p-4 bg-[var(--color-primary)]/10 rounded-xl text-[var(--color-primary)]">
                            <Box className="w-6 h-6" />
                        </div>
                        <div>
                            <Typography variant="muted" className="text-xs font-black uppercase tracking-widest opacity-40">Total Productos</Typography>
                            <Typography className="text-2xl font-black">{products.length}</Typography>
                        </div>
                    </Surface>

                    <Surface variant="premium" rounding="2xl" shadow="lg" className="p-6 flex items-center gap-4">
                        <div className="p-4 bg-amber-500/10 rounded-xl text-amber-500 text-amber-500">
                            <AlertCircle className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <Typography variant="muted" className="text-xs font-black uppercase tracking-widest opacity-40">Stock Crítico</Typography>
                            <Typography className="text-2xl font-black text-amber-500">
                                {products.filter(p => p.stock < 10).length}
                            </Typography>
                        </div>
                    </Surface>

                    <Surface variant="premium" rounding="2xl" shadow="lg" className="p-6 flex items-center gap-4">
                        <div className="p-4 bg-blue-500/10 rounded-xl text-blue-500">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <Typography variant="muted" className="text-xs font-black uppercase tracking-widest opacity-40">Existencia Total</Typography>
                            <Typography className="text-2xl font-black">
                                {products.reduce((acc, p) => acc + p.stock, 0)} <span className="text-xs font-medium opacity-40">unidades</span>
                            </Typography>
                        </div>
                    </Surface>
                </div>

                {/* --- Main Inventory Table --- */}
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
                                        <th className="p-6"><Typography variant="small" className="font-black uppercase tracking-widest text-[var(--color-text-muted)]">PRODUCTO</Typography></th>
                                        <th className="p-6"><Typography variant="small" className="font-black uppercase tracking-widest text-[var(--color-text-muted)]">ESTADO DE STOCK</Typography></th>
                                        <th className="p-6 text-right"><Typography variant="small" className="font-black uppercase tracking-widest text-[var(--color-text-muted)]">GESTIÓN DE UNIDADES</Typography></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-border)]">
                                    {products.map((product) => (
                                        <motion.tr
                                            key={product.id}
                                            variants={itemVariants}
                                            className="hover:bg-[var(--color-bg-tertiary)]/50 transition-all duration-300 group"
                                        >
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-primary)] flex items-center justify-center border border-[var(--color-border)] group-hover:border-[var(--color-primary)]/30 transition-colors">
                                                        <Box className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:text-[var(--color-primary)] transition-all" />
                                                    </div>
                                                    <div>
                                                        <Typography className="font-black text-lg group-hover:text-[var(--color-primary)] transition-colors">
                                                            {product.name}
                                                        </Typography>
                                                        <Typography variant="muted" className="text-xs font-mono font-bold">
                                                            USD ${Number(product.price).toFixed(2)}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className={cn(
                                                    "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                                                    product.stock < 10
                                                        ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20 shadow-[var(--color-danger)]/5"
                                                        : "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20 shadow-[var(--color-primary)]/5"
                                                )}>
                                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", product.stock < 10 ? "bg-[var(--color-danger)]" : "bg-[var(--color-primary)]")} />
                                                    {product.stock < 10 ? 'Stock Crítico' : 'Stock Saludable'}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center justify-end gap-3">
                                                    <div className="flex items-center bg-[var(--color-bg-tertiary)] rounded-2xl border border-[var(--color-border)] p-1 group/control hover:border-[var(--color-primary)]/30 transition-colors">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => updateStock(product, product.stock - 1)}
                                                            className="h-8 w-8 rounded-xl hover:bg-[var(--color-bg-primary)]"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </Button>
                                                        <input
                                                            type="number"
                                                            className="w-16 bg-transparent border-none text-center font-black text-lg focus:ring-0 text-[var(--color-text-primary)]"
                                                            value={product.stock}
                                                            onChange={(e) => updateStock(product, parseInt(e.target.value) || 0)}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => updateStock(product, product.stock + 1)}
                                                            className="h-8 w-8 rounded-xl hover:bg-[var(--color-bg-primary)] text-[var(--color-primary)]"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </Button>
                                                    </div>
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
        </AuthenticatedLayout>
    );
}
