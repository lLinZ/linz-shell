import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Activity, AlertTriangle, AlertCircle, Info, Bell,
    Users, UserCheck, Eye, ShoppingCart, Loader2, Globe,
    Wifi, Clock, ArrowRight, X, RefreshCcw, Monitor,
    Radio, UserX, Shield, Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ActiveSession {
    id: number;
    name: string;
    email: string;
    role: string;
    ip_address: string;
    user_agent: string;
    last_activity: number;
    last_activity_at: string;
}

interface ConnectedClient {
    id: number;
    name: string;
    email: string;
    ip_address: string;
    last_seen: string;
}

interface Alert {
    id: string;
    type: 'warning' | 'info' | 'danger' | 'success';
    title: string;
    message: string;
    count: number;
    action: string;
    icon: string;
}

interface Activity {
    type: string;
    id: number;
    message: string;
    status: string;
    created_at: string;
    timestamp: string;
}

interface Stats {
    activeAdmins: number;
    activeClients: number;
    guestVisitors: number;
    totalActive: number;
    alertCount: number;
    recentOrderCount: number;
}

interface Props {
    activeSessions: ActiveSession[];
    connectedClients: ConnectedClient[];
    guestVisitors: number;
    recentActivity: Activity[];
    alerts: Alert[];
    stats: Stats;
}

// ─── Alert Icon Map ───────────────────────────────────────────────────────────
const ALERT_ICONS: Record<string, React.ElementType> = {
    ShoppingCart, Loader2, UserX, AlertTriangle, AlertCircle, Info,
};

const ALERT_STYLES: Record<string, string> = {
    warning: 'border-amber-500/30 bg-amber-500/8 text-amber-400',
    danger: 'border-rose-500/30 bg-rose-500/8 text-rose-400',
    info: 'border-cyan-500/30 bg-cyan-500/8 text-cyan-400',
    success: 'border-emerald-500/30 bg-emerald-500/8 text-emerald-400',
};

const ALERT_ICON_BG: Record<string, string> = {
    warning: 'bg-amber-500/15',
    danger: 'bg-rose-500/15',
    info: 'bg-cyan-500/15',
    success: 'bg-emerald-500/15',
};

// ─── Role Dot ─────────────────────────────────────────────────────────────────
const ROLE_COLOR: Record<string, string> = {
    master: 'bg-amber-400',
    admin: 'bg-violet-400',
    client: 'bg-cyan-400',
};

const ROLE_LABEL: Record<string, string> = {
    master: 'Master',
    admin: 'Admin',
    client: 'Cliente',
};

function AvatarCircle({ name, role }: { name: string; role: string }) {
    const gradient: Record<string, string> = {
        master: 'from-amber-400 to-orange-500',
        admin: 'from-violet-500 to-purple-600',
        client: 'from-cyan-400 to-blue-500',
    };
    return (
        <div className={cn(
            'w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0',
            gradient[role] ?? 'from-slate-400 to-slate-600',
        )}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, delay, pulse = false }: {
    icon: React.ElementType; label: string; value: number | string; color: string; delay: number; pulse?: boolean;
}) {
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
            <Surface variant="secondary" className="p-5 rounded-2xl border border-[var(--color-border)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
                <div className={cn('absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity', color)} />
                <div className="flex items-center gap-3 relative">
                    <div className={cn('p-2.5 rounded-xl relative', color + '/15')}>
                        <Icon size={18} className={cn(color, 'opacity-90')} />
                        {pulse && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[var(--color-bg-secondary)] animate-ping" />}
                    </div>
                    <div>
                        <div className="text-2xl font-black">{value}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40">{label}</div>
                    </div>
                </div>
            </Surface>
        </motion.div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Index({ activeSessions, connectedClients, guestVisitors, recentActivity, alerts, stats }: Props) {
    const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

    const visibleAlerts = alerts.filter(a => !dismissedAlerts.includes(a.id));

    return (
        <AuthenticatedLayout>
            <Head title="Centro de Monitoreo" />

            <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-8">

                {/* ── Header ── */}
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-emerald-500/20 relative">
                                <Radio size={18} className="text-emerald-400" />
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            </div>
                            <Typography variant="muted" className="text-xs font-black uppercase tracking-widest opacity-50">En tiempo real</Typography>
                        </div>
                        <Typography variant="h1" className="text-4xl md:text-5xl font-black tracking-tight">Centro de Monitoreo</Typography>
                        <Typography variant="muted" className="mt-1 opacity-50">
                            Alertas del sistema, usuarios activos y actividad de clientes.
                        </Typography>
                    </div>
                    <a
                        href={window.location.href}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-bg-tertiary)]/40 text-sm font-black transition-all self-start sm:self-auto"
                    >
                        <RefreshCcw size={14} />
                        Refrescar datos
                    </a>
                </motion.div>

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <StatCard icon={Activity} label="Total Activos" value={stats.totalActive} color="text-[var(--color-primary)]" delay={0} pulse />
                    <StatCard icon={Shield} label="Admins Online" value={stats.activeAdmins} color="text-violet-400" delay={0.05} />
                    <StatCard icon={UserCheck} label="Clientes Online" value={stats.activeClients} color="text-cyan-400" delay={0.1} pulse />
                    <StatCard icon={Eye} label="Visitantes" value={guestVisitors} color="text-amber-400" delay={0.15} />
                    <StatCard icon={Bell} label="Alertas" value={stats.alertCount} color="text-rose-400" delay={0.2} pulse={stats.alertCount > 0} />
                    <StatCard icon={ShoppingCart} label="Órdenes Hoy" value={stats.recentOrderCount} color="text-emerald-400" delay={0.25} />
                </div>

                {/* ── Alerts ── */}
                <AnimatePresence>
                    {visibleAlerts.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            className="space-y-3"
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center gap-2">
                                <Bell size={15} className="text-[var(--color-primary)]" />
                                <Typography variant="muted" className="text-xs font-black uppercase tracking-widest opacity-50">
                                    Alertas y Notificaciones ({visibleAlerts.length})
                                </Typography>
                            </div>

                            {visibleAlerts.map((alert, i) => {
                                const IconComp = ALERT_ICONS[alert.icon] ?? AlertCircle;
                                return (
                                    <motion.div
                                        key={alert.id}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 12 }}
                                        transition={{ delay: i * 0.06 }}
                                    >
                                        <div className={cn(
                                            'flex items-center gap-4 p-4 rounded-2xl border transition-all',
                                            ALERT_STYLES[alert.type] ?? ALERT_STYLES.info,
                                        )}>
                                            <div className={cn('p-2.5 rounded-xl flex-shrink-0', ALERT_ICON_BG[alert.type])}>
                                                <IconComp size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-black text-sm">{alert.title}</div>
                                                <div className="text-xs opacity-70 mt-0.5">{alert.message}</div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Link
                                                    href={alert.action}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-current/10 text-xs font-black hover:bg-current/20 transition-all"
                                                >
                                                    Ver <ArrowRight size={11} />
                                                </Link>
                                                <button
                                                    onClick={() => setDismissedAlerts(prev => [...prev, alert.id])}
                                                    className="p-1.5 rounded-lg opacity-40 hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {visibleAlerts.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                        >
                            <div className="p-2 rounded-xl bg-emerald-500/15">
                                <Zap size={16} />
                            </div>
                            <div>
                                <div className="font-black text-sm">Todo en orden</div>
                                <div className="text-xs opacity-60">No hay alertas activas en este momento.</div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Active admin sessions */}
                    <motion.div
                        className="lg:col-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <Surface variant="secondary" className="rounded-3xl border border-[var(--color-border)] overflow-hidden p-0">
                            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-lg bg-violet-500/15">
                                        <Monitor size={15} className="text-violet-400" />
                                    </div>
                                    <Typography variant="h4" className="font-black text-base">Sesiones Activas</Typography>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 font-black border border-violet-500/20">
                                        {activeSessions.length} online
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs opacity-40 font-bold">
                                    <Wifi size={12} className="animate-pulse" />
                                    últimos 15 min
                                </div>
                            </div>

                            <div className="divide-y divide-[var(--color-border)]/30">
                                {activeSessions.length === 0 ? (
                                    <div className="py-12 text-center opacity-30 font-bold italic text-sm">No hay sesiones activas</div>
                                ) : activeSessions.map((session, i) => (
                                    <motion.div
                                        key={session.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 + i * 0.04 }}
                                        className="flex items-center gap-4 px-6 py-3.5 hover:bg-[var(--color-bg-tertiary)]/30 transition-colors"
                                    >
                                        <div className="relative">
                                            <AvatarCircle name={session.name} role={session.role} />
                                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[var(--color-bg-secondary)] animate-pulse" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-black text-sm truncate">{session.name}</div>
                                            <div className="text-xs opacity-40 truncate">{session.email}</div>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-1.5 text-xs opacity-40 font-bold">
                                            <Globe size={11} />
                                            {session.ip_address || '—'}
                                        </div>
                                        <div>
                                            <span className={cn(
                                                'px-2.5 py-1 rounded-xl text-[10px] font-black border',
                                                ROLE_COLOR[session.role]
                                                    ? `bg-${ROLE_COLOR[session.role].replace('bg-', '')}/15 text-${ROLE_COLOR[session.role].replace('bg-', '')} border-${ROLE_COLOR[session.role].replace('bg-', '')}/20`
                                                    : 'bg-slate-500/15 text-slate-400 border-slate-500/20',
                                            )}>
                                                {ROLE_LABEL[session.role] ?? session.role}
                                            </span>
                                        </div>
                                        <div className="text-xs opacity-40 font-bold flex items-center gap-1 hidden md:flex">
                                            <Clock size={11} />
                                            {session.last_activity_at}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </Surface>
                    </motion.div>

                    {/* Connected clients */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Surface variant="secondary" className="rounded-3xl border border-[var(--color-border)] overflow-hidden p-0 h-full">
                            <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/30">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-cyan-500/15">
                                        <Users size={15} className="text-cyan-400" />
                                    </div>
                                    <Typography variant="h4" className="font-black text-base">Clientes Conectados</Typography>
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-black border border-cyan-500/20">
                                    {connectedClients.length}
                                </span>
                            </div>

                            <div className="divide-y divide-[var(--color-border)]/25">
                                {connectedClients.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <Globe size={32} className="mx-auto mb-3 opacity-20" />
                                        <div className="text-sm font-bold opacity-30">Sin clientes conectados</div>
                                        <div className="text-xs opacity-20 mt-1">últimos 30 min</div>
                                    </div>
                                ) : connectedClients.map((client, i) => (
                                    <motion.div
                                        key={client.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.45 + i * 0.04 }}
                                        className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--color-bg-tertiary)]/30 transition-colors"
                                    >
                                        <div className="relative">
                                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                                {client.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[var(--color-bg-secondary)]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm truncate">{client.name}</div>
                                            <div className="text-[10px] opacity-40 truncate">{client.last_seen}</div>
                                        </div>
                                        <div className="text-[10px] opacity-30 font-mono hidden sm:block">{client.ip_address}</div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Guest visitors row */}
                            <div className="px-5 py-3 border-t border-[var(--color-border)]/30 bg-[var(--color-bg-tertiary)]/20">
                                <div className="flex items-center gap-2 text-xs font-bold opacity-50">
                                    <Eye size={12} />
                                    <span>{guestVisitors} visitante(s) anónimo(s) activos (30 min)</span>
                                </div>
                            </div>
                        </Surface>
                    </motion.div>
                </div>

                {/* ── Recent Activity ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Surface variant="secondary" className="rounded-3xl border border-[var(--color-border)] overflow-hidden p-0">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/30">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-[var(--color-primary)]/15">
                                    <Activity size={15} className="text-[var(--color-primary)]" />
                                </div>
                                <Typography variant="h4" className="font-black text-base">Actividad Reciente</Typography>
                            </div>
                            <Link
                                href={route('admin.orders.index')}
                                className="text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-[var(--color-primary)] transition-all flex items-center gap-1"
                            >
                                Ver órdenes <ArrowRight size={11} />
                            </Link>
                        </div>

                        <div className="divide-y divide-[var(--color-border)]/25 max-h-80 overflow-y-auto custom-scrollbar">
                            {recentActivity.length === 0 ? (
                                <div className="py-10 text-center opacity-30 font-bold italic text-sm">Sin actividad reciente</div>
                            ) : recentActivity.map((item, i) => (
                                <motion.div
                                    key={`${item.type}-${item.id}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.55 + i * 0.02 }}
                                    className="flex items-center gap-4 px-6 py-3 hover:bg-[var(--color-bg-tertiary)]/25 transition-colors"
                                >
                                    <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] flex-shrink-0 opacity-70" />
                                    <div className="flex-1 text-sm font-medium truncate">{item.message}</div>
                                    <div className="text-xs opacity-40 font-bold flex-shrink-0">{item.created_at}</div>
                                </motion.div>
                            ))}
                        </div>
                    </Surface>
                </motion.div>

            </div>
        </AuthenticatedLayout>
    );
}
