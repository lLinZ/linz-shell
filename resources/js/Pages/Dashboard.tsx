import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { motion } from 'framer-motion';
import {
    ShoppingCart,
    Package,
    Users,
    TrendingUp,
    Clock,
    CheckCircle2,
    Loader2,
    AlertCircle,
    ArrowRight,
    User,
    Mail,
    Phone,
    BarChart3,
    Star,
    Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
    total: number;
    new: number;
    processing: number;
    completed: number;
    revenue: number;
    today: number;
}

interface RecentOrder {
    id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    status: string;
    total: string;
    created_at: string;
    items: { id: number; quantity: number; product?: { name: string } }[];
}

interface DailyOrder { date: string; count: number; }
interface StatusBreakdown { status: string; count: number; }

interface Props {
    stats: Stats;
    recentOrders: RecentOrder[];
    dailyOrders: DailyOrder[];
    statusBreakdown: StatusBreakdown[];
    productCount: number;
    clientCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
    'Nuevo': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    'En Proceso': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    'Enviado': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    'Completado': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    'Cancelado': 'bg-rose-500/15 text-rose-400 border-rose-500/20',
};

const STATUS_DOT: Record<string, string> = {
    'Nuevo': 'bg-blue-500',
    'En Proceso': 'bg-yellow-500',
    'Enviado': 'bg-purple-500',
    'Completado': 'bg-emerald-500',
    'Cancelado': 'bg-rose-500',
};

function fmt(n: number) {
    return new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({
    icon: Icon,
    label,
    value,
    accent,
    delay = 0,
    suffix = '',
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    accent: string;
    delay?: number;
    suffix?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
        >
            <Surface
                variant="secondary"
                className="p-6 rounded-3xl border border-[var(--color-border)] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative"
            >
                {/* Glow blob */}
                <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl ${accent} group-hover:opacity-20 transition-opacity`} />

                <div className={`inline-flex p-3 rounded-2xl ${accent} bg-opacity-15 mb-4`}>
                    <Icon size={22} className="text-[var(--color-text-primary)] opacity-80" />
                </div>
                <div className="space-y-1">
                    <Typography variant="muted" className="text-xs font-black uppercase tracking-widest opacity-50">
                        {label}
                    </Typography>
                    <div className="text-3xl font-black tracking-tight">
                        {suffix}{typeof value === 'number' && value >= 1000 ? fmt(value) : value}
                    </div>
                </div>
            </Surface>
        </motion.div>
    );
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function MiniBarChart({ data }: { data: DailyOrder[] }) {
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="flex items-end gap-2 h-24">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                        className="w-full rounded-t-lg bg-[var(--color-primary)] opacity-70 hover:opacity-100 transition-opacity relative group"
                        style={{ height: `${Math.max((d.count / max) * 80, 4)}px` }}
                        initial={{ scaleY: 0, originY: 1 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: i * 0.07, duration: 0.4 }}
                    >
                        {d.count > 0 && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded px-1.5 py-0.5 whitespace-nowrap pointer-events-none">
                                {d.count}
                            </div>
                        )}
                    </motion.div>
                    <span className="text-[10px] font-bold opacity-40">{d.date}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Quick Action ─────────────────────────────────────────────────────────────
function QuickAction({
    href,
    icon: Icon,
    label,
    description,
    accent,
    delay,
}: {
    href: string;
    icon: React.ElementType;
    label: string;
    description: string;
    accent: string;
    delay: number;
}) {
    return (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}>
            <Link
                href={href}
                className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-bg-tertiary)]/40 transition-all duration-200 group"
            >
                <div className={`p-2.5 rounded-xl ${accent} flex-shrink-0`}>
                    <Icon size={18} className="opacity-80" />
                </div>
                <div className="min-w-0">
                    <div className="font-black text-sm">{label}</div>
                    <div className="text-xs opacity-50 truncate">{description}</div>
                </div>
                <ArrowRight size={14} className="ml-auto opacity-30 group-hover:opacity-80 group-hover:translate-x-1 transition-all" />
            </Link>
        </motion.div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Dashboard({
    stats,
    recentOrders,
    dailyOrders,
    statusBreakdown,
    productCount,
    clientCount,
}: Props) {
    const maxStatus = Math.max(...statusBreakdown.map(s => s.count), 1);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-10">

                {/* ── Header ── */}
                <motion.div
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-[var(--color-primary)]/20">
                                <Zap size={20} className="text-[var(--color-primary)]" />
                            </div>
                            <Typography variant="muted" className="text-xs font-black uppercase tracking-widest opacity-50">
                                Centro de Control
                            </Typography>
                        </div>
                        <Typography variant="h1" className="text-4xl md:text-5xl font-black tracking-tight">
                            Dashboard
                        </Typography>
                        <Typography variant="muted" className="mt-1 opacity-50">
                            Vista general del sistema en tiempo real.
                        </Typography>
                    </div>

                    <Link
                        href={route('admin.orders.index')}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--color-primary)] text-black font-black text-sm shadow-lg shadow-[var(--color-primary)]/30 hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
                    >
                        <ShoppingCart size={16} />
                        Ir al CRM de Órdenes
                        <ArrowRight size={14} />
                    </Link>
                </motion.div>

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={ShoppingCart} label="Órdenes Hoy" value={stats.today} accent="bg-[var(--color-primary)]" delay={0} />
                    <StatCard icon={AlertCircle} label="Nuevas" value={stats.new} accent="bg-blue-500" delay={0.05} />
                    <StatCard icon={Loader2} label="En Proceso" value={stats.processing} accent="bg-yellow-500" delay={0.1} />
                    <StatCard icon={CheckCircle2} label="Completadas" value={stats.completed} accent="bg-emerald-500" delay={0.15} />
                    <StatCard icon={TrendingUp} label="Ingresos" value={fmt(stats.revenue)} accent="bg-violet-500" delay={0.2} suffix="$" />
                    <StatCard icon={ShoppingCart} label="Total Órdenes" value={stats.total} accent="bg-fuchsia-500" delay={0.25} />
                    <StatCard icon={Package} label="Productos" value={productCount} accent="bg-orange-500" delay={0.3} />
                    <StatCard icon={Users} label="Clientes" value={clientCount} accent="bg-cyan-500" delay={0.35} />
                </div>

                {/* ── Middle Row: Chart + Status Donut + Quick Actions ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Orders last 7 days */}
                    <motion.div
                        className="lg:col-span-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Surface variant="secondary" className="p-6 rounded-3xl border border-[var(--color-border)] shadow-lg h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <BarChart3 size={18} className="text-[var(--color-primary)]" />
                                <Typography variant="h4" className="font-black text-base">Últimos 7 días</Typography>
                            </div>
                            <MiniBarChart data={dailyOrders} />
                        </Surface>
                    </motion.div>

                    {/* Status breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                    >
                        <Surface variant="secondary" className="p-6 rounded-3xl border border-[var(--color-border)] shadow-lg h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <Star size={18} className="text-[var(--color-primary)]" />
                                <Typography variant="h4" className="font-black text-base">Por Estado</Typography>
                            </div>
                            <div className="space-y-3">
                                {statusBreakdown.map((s, i) => (
                                    <div key={s.status} className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${STATUS_DOT[s.status] ?? 'bg-gray-500'}`} />
                                                <span>{s.status}</span>
                                            </div>
                                            <span className="opacity-50">{s.count}</span>
                                        </div>
                                        <div className="h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full rounded-full ${STATUS_DOT[s.status] ?? 'bg-gray-500'}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(s.count / maxStatus) * 100}%` }}
                                                transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Surface>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Surface variant="secondary" className="p-6 rounded-3xl border border-[var(--color-border)] shadow-lg h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <Zap size={18} className="text-[var(--color-primary)]" />
                                <Typography variant="h4" className="font-black text-base">Accesos Rápidos</Typography>
                            </div>
                            <div className="space-y-3">
                                <QuickAction href={route('admin.orders.index')} icon={ShoppingCart} accent="bg-[var(--color-primary)]/15 text-[var(--color-primary)]" label="CRM de Órdenes" description="Gestionar y crear órdenes" delay={0.55} />
                                <QuickAction href={route('admin.products.index')} icon={Package} accent="bg-orange-500/15 text-orange-400" label="Productos" description="Catálogo de productos" delay={0.6} />
                                <QuickAction href={route('admin.inventory.index')} icon={BarChart3} accent="bg-violet-500/15 text-violet-400" label="Inventario" description="Stock y movimientos" delay={0.65} />
                                <QuickAction href={route('admin.reviews.index')} icon={Star} accent="bg-yellow-500/15 text-yellow-400" label="Reseñas" description="Gestionar feedback" delay={0.7} />
                            </div>
                        </Surface>
                    </motion.div>
                </div>

                {/* ── Recent Orders ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Surface variant="secondary" className="rounded-3xl border border-[var(--color-border)] shadow-lg overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
                            <div className="flex items-center gap-3">
                                <Clock size={18} className="text-[var(--color-primary)]" />
                                <Typography variant="h4" className="font-black text-base">Órdenes Recientes</Typography>
                            </div>
                            <Link
                                href={route('admin.orders.index')}
                                className="text-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-[var(--color-primary)] transition-all flex items-center gap-1"
                            >
                                Ver todas <ArrowRight size={12} />
                            </Link>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <div className="min-w-[640px]">
                                {recentOrders.length === 0 ? (
                                    <div className="py-16 text-center opacity-30 font-bold italic">
                                        No hay órdenes aún
                                    </div>
                                ) : recentOrders.map((order, i) => (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.65 + i * 0.04 }}
                                        className="grid grid-cols-[56px_1fr_1fr_120px_130px] gap-4 px-6 py-3.5 items-center border-b border-[var(--color-border)]/40 last:border-0 hover:bg-[var(--color-bg-tertiary)]/30 transition-colors"
                                    >
                                        <div className="text-xs font-black opacity-35 text-center">#{order.id}</div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-sm truncate flex items-center gap-1.5">
                                                <User size={12} className="opacity-40 flex-shrink-0" />
                                                {order.customer_name || '—'}
                                            </div>
                                            <div className="text-xs opacity-40 truncate">{order.customer_email}</div>
                                        </div>
                                        <div className="text-sm opacity-70 truncate">
                                            {order.items?.map(it => `${it.quantity}× ${it.product?.name ?? '?'}`).join(', ')}
                                        </div>
                                        <div className="font-black text-sm">${parseFloat(order.total).toFixed(2)}</div>
                                        <div>
                                            <span className={`px-3 py-1 rounded-xl text-xs font-black border ${STATUS_STYLES[order.status] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </Surface>
                </motion.div>

            </div>
        </AuthenticatedLayout>
    );
}
