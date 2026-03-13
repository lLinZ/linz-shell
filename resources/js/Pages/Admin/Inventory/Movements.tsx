import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { motion } from 'framer-motion';
import {
    Box,
    ArrowRightLeft,
    TrendingUp,
    TrendingDown,
    RefreshCcw,
    ShoppingCart,
    Undo2,
    ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Product {
    id: number;
    name: string;
    image_url?: string;
}

interface User {
    id: number;
    name: string;
}

interface Movement {
    id: number;
    product: Product;
    user: User | null;
    type: 'addition' | 'subtraction' | 'adjustment' | 'sale' | 'return';
    quantity: number;
    previous_stock: number;
    current_stock: number;
    reference: string | null;
    notes: string | null;
    created_at: string;
}

interface PaginationData {
    data: Movement[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export default function Movements({ auth, movements }: PageProps<{ movements: PaginationData }>) {
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

    const getMovementConfig = (type: string, qty: number) => {
        switch (type) {
            case 'addition':
                return {
                    icon: TrendingUp,
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    label: 'Entrada'
                };
            case 'subtraction':
                return {
                    icon: TrendingDown,
                    color: 'text-red-500',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    label: 'Salida'
                };
            case 'sale':
                return {
                    icon: ShoppingCart,
                    color: 'text-blue-500',
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/20',
                    label: 'Venta'
                };
            case 'return':
                return {
                    icon: Undo2,
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    label: 'Devolución'
                };
            case 'adjustment':
            default:
                return {
                    icon: RefreshCcw,
                    color: qty > 0 ? 'text-emerald-500' : (qty < 0 ? 'text-red-500' : 'text-amber-500'),
                    bg: qty > 0 ? 'bg-emerald-500/10' : (qty < 0 ? 'bg-red-500/10' : 'bg-amber-500/10'),
                    border: qty > 0 ? 'border-emerald-500/20' : (qty < 0 ? 'border-red-500/20' : 'border-amber-500/20'),
                    label: 'Ajuste Manual'
                };
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Historial de Movimientos - Inventario" />

            <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* --- Page Header --- */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
                >
                    <div className="space-y-3">
                        <Link
                            href={route('admin.inventory.index')}
                            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors mb-4 group"
                        >
                            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Volver al Control de Inventario
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-[var(--color-primary)]/10 rounded-2xl text-[var(--color-primary)]">
                                <ArrowRightLeft className="w-8 h-8" />
                            </div>
                            <div>
                                <Typography variant="gradient">
                                    Historial de Movimientos
                                </Typography>
                                <Typography variant="muted" className="text-lg font-medium opacity-60">
                                    Registro de auditoría de todas las modificaciones de stock.
                                </Typography>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* --- Main Table --- */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Surface variant="premium" rounding="3xl" shadow="2xl" className="p-0 overflow-hidden border-[var(--color-border)]" glow>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/50 backdrop-blur-md">
                                        <th className="p-6"><Typography variant="small" className="font-black uppercase tracking-widest opacity-40">FECHA</Typography></th>
                                        <th className="p-6"><Typography variant="small" className="font-black uppercase tracking-widest opacity-40">PRODUCTO</Typography></th>
                                        <th className="p-6"><Typography variant="small" className="font-black uppercase tracking-widest opacity-40">TIPO</Typography></th>
                                        <th className="p-6 text-center"><Typography variant="small" className="font-black uppercase tracking-widest opacity-40">CANTIDAD</Typography></th>
                                        <th className="p-6 text-center"><Typography variant="small" className="font-black uppercase tracking-widest opacity-40">STOCK FINAL</Typography></th>
                                        <th className="p-6"><Typography variant="small" className="font-black uppercase tracking-widest opacity-40">DETALLES</Typography></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-border)]">
                                    {movements.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-16 text-center">
                                                <Typography variant="muted" className="font-black opacity-40">No hay movimientos registrados.</Typography>
                                            </td>
                                        </tr>
                                    ) : (
                                        movements.data.map((movement) => {
                                            const config = getMovementConfig(movement.type, movement.quantity);
                                            const Icon = config.icon;

                                            return (
                                                <motion.tr
                                                    key={movement.id}
                                                    variants={itemVariants}
                                                    className="hover:bg-[var(--color-bg-tertiary)]/30 transition-all duration-300 group"
                                                >
                                                    <td className="p-6">
                                                        <Typography className="font-bold text-sm">
                                                            {format(new Date(movement.created_at), "dd MMM yyyy", { locale: es })}
                                                        </Typography>
                                                        <Typography variant="muted" className="text-xs uppercase tracking-widest">
                                                            {format(new Date(movement.created_at), "HH:mm")}
                                                        </Typography>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-primary)] flex items-center justify-center border border-[var(--color-border)] overflow-hidden">
                                                                {movement.product.image_url ? (
                                                                    <img src={movement.product.image_url} alt={movement.product.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Box className="w-5 h-5 opacity-40" />
                                                                )}
                                                            </div>
                                                            <Typography className="font-black text-sm">
                                                                {movement.product.name}
                                                            </Typography>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className={cn(
                                                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                                                            config.bg, config.color, config.border
                                                        )}>
                                                            <Icon className="w-3.5 h-3.5" />
                                                            {config.label}
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-center">
                                                        <Typography className={cn(
                                                            "font-black text-lg",
                                                            movement.quantity > 0 ? "text-emerald-500" : (movement.quantity < 0 ? "text-red-500" : "text-amber-500")
                                                        )}>
                                                            {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                                                        </Typography>
                                                        <Typography variant="muted" className="text-[10px] uppercase font-black">
                                                            De {movement.previous_stock}
                                                        </Typography>
                                                    </td>
                                                    <td className="p-6 text-center">
                                                        <Typography className="font-black text-lg">
                                                            {movement.current_stock}
                                                        </Typography>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="space-y-1">
                                                            <Typography variant="small" className="font-black text-xs line-clamp-1">
                                                                {movement.reference || 'Sin referencia'}
                                                            </Typography>
                                                            {movement.notes && (
                                                                <Typography variant="muted" className="text-[10px] line-clamp-1">
                                                                    {movement.notes}
                                                                </Typography>
                                                            )}
                                                            <Typography variant="muted" className="text-[10px] opacity-50">
                                                                Por: {movement.user ? movement.user.name : 'Sistema'}
                                                            </Typography>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {movements.last_page > 1 && (
                            <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/20 flex items-center justify-between">
                                <Typography variant="muted" className="text-xs font-black uppercase tracking-widest">
                                    Mostrando {movements.from} a {movements.to} de {movements.total}
                                </Typography>

                                <div className="flex items-center gap-1">
                                    {movements.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={cn(
                                                "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black transition-all",
                                                link.active
                                                    ? "bg-[var(--color-primary)] text-[var(--color-bg-primary)] shadow-[var(--color-primary)]/20 shadow-lg"
                                                    : "hover:bg-[var(--color-bg-tertiary)] hover:border-[var(--color-border)] text-[var(--color-text-muted)]",
                                                !link.url && "opacity-30 cursor-not-allowed hidden md:flex"
                                            )}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            preserveScroll
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </Surface>
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}
