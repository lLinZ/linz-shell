import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    HeartPulse, Database, HardDrive, Server, CheckCircle2,
    XCircle, AlertTriangle, Cpu, Clock, RefreshCcw, Layers,
    Table2, Globe, Zap, Activity, Package, FileWarning,
    ShieldCheck, Info,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DbStats {
    driver: string;
    status: 'ok' | 'error';
    latency_ms: number | null;
    size: string | null;
    connection: string;
    error?: string;
}

interface StorageStats {
    storage_path: string;
    storage_writable: boolean;
    logs_size: string;
    cache_size: string;
    sessions_size: string;
    public_writable: boolean;
    disk_free: string;
    disk_total: string;
    disk_used_percent: number;
}

interface SessionStats {
    total: number;
    active: number;
    today: number;
    status: 'ok' | 'error';
}

interface AppInfo {
    php_version: string;
    laravel_version: string;
    environment: string;
    debug_mode: boolean;
    timezone: string;
    url: string;
    cache_driver: string;
    session_driver: string;
    queue_driver: string;
    mail_mailer: string;
}

interface Props {
    dbStats: DbStats;
    storageStats: StorageStats;
    sessionStats: SessionStats;
    appInfo: AppInfo;
    tableCounts: Record<string, number | null>;
    failedJobs: number;
    cacheHealth: { status: 'ok' | 'error'; driver: string; error?: string };
    pendingMigrations: number;
    generatedAt: string;
}

// ─── Status Pill ─────────────────────────────────────────────────────────────
function StatusPill({ ok, label }: { ok: boolean; label?: string }) {
    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black border',
            ok
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/25',
        )}>
            {ok ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
            {label ?? (ok ? 'OK' : 'ERROR')}
        </span>
    );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, accent }: {
    icon: React.ElementType; title: string; subtitle?: string; accent: string;
}) {
    return (
        <div className={cn('flex items-center gap-3 px-6 py-5 border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/30')}>
            <div className={cn('p-2 rounded-xl', accent)}>
                <Icon size={16} className="opacity-80" />
            </div>
            <div>
                <Typography variant="h4" className="font-black text-base leading-none">{title}</Typography>
                {subtitle && <Typography variant="muted" className="text-xs opacity-50 mt-0.5">{subtitle}</Typography>}
            </div>
        </div>
    );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div className="flex items-center justify-between py-3 px-6 border-b border-[var(--color-border)]/30 last:border-0 hover:bg-[var(--color-bg-tertiary)]/20 transition-colors">
            <span className="text-xs font-black uppercase tracking-widest opacity-40">{label}</span>
            <span className={cn('text-sm font-bold', mono && 'font-mono text-[var(--color-primary)] text-xs')}>{value}</span>
        </div>
    );
}

// ─── Disk Usage Bar ───────────────────────────────────────────────────────────
function DiskBar({ percent }: { percent: number }) {
    const color = percent > 85 ? 'bg-rose-500' : percent > 65 ? 'bg-amber-500' : 'bg-[var(--color-primary)]';
    return (
        <div className="px-6 py-4">
            <div className="flex justify-between text-xs font-bold mb-2">
                <span className="opacity-40">Uso de disco</span>
                <span className={cn(
                    'font-black',
                    percent > 85 ? 'text-rose-400' : percent > 65 ? 'text-amber-400' : 'text-emerald-400'
                )}>{percent}%</span>
            </div>
            <div className="h-2.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                <motion.div
                    className={cn('h-full rounded-full', color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                />
            </div>
        </div>
    );
}

// ─── Latency Meter ────────────────────────────────────────────────────────────
function LatencyMeter({ ms }: { ms: number | null }) {
    if (ms === null) return <span className="text-rose-400 font-black text-xs">Error</span>;
    const color = ms < 20 ? 'text-emerald-400' : ms < 100 ? 'text-amber-400' : 'text-rose-400';
    return <span className={cn('font-black text-sm font-mono', color)}>{ms} ms</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Index({
    dbStats, storageStats, sessionStats, appInfo, tableCounts,
    failedJobs, cacheHealth, pendingMigrations, generatedAt,
}: Props) {

    const overallOk =
        dbStats.status === 'ok' &&
        cacheHealth.status === 'ok' &&
        pendingMigrations === 0 &&
        failedJobs === 0 &&
        storageStats.storage_writable &&
        !appInfo.debug_mode;

    const tableOrder = ['users', 'orders', 'products', 'messages', 'reviews', 'media', 'sessions'];

    return (
        <AuthenticatedLayout>
            <Head title="Salud del Sistema" />

            <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-8">

                {/* ── Header ── */}
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={cn('p-2 rounded-xl', overallOk ? 'bg-emerald-500/20' : 'bg-amber-500/20')}>
                                <HeartPulse size={20} className={overallOk ? 'text-emerald-400' : 'text-amber-400'} />
                            </div>
                            <Typography variant="muted" className="text-xs font-black uppercase tracking-widest opacity-50">Diagnóstico Técnico</Typography>
                        </div>
                        <Typography variant="h1" className="text-4xl md:text-5xl font-black tracking-tight">Salud del Sistema</Typography>
                        <Typography variant="muted" className="mt-1 opacity-50">
                            Estado de infraestructura · actualizado {new Date(generatedAt).toLocaleTimeString('es')}
                        </Typography>
                    </div>

                    {/* Global status badge */}
                    <div className={cn(
                        'flex items-center gap-3 px-5 py-3 rounded-2xl border self-start sm:self-auto',
                        overallOk
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                    )}>
                        {overallOk ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
                        <span className="font-black text-sm">{overallOk ? 'Sistema Saludable' : 'Requiere Atención'}</span>
                    </div>
                </motion.div>

                {/* ── Warning Banners ── */}
                <div className="space-y-3">
                    {appInfo.debug_mode && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/8 border border-rose-500/30 text-rose-400">
                            <AlertTriangle size={16} className="flex-shrink-0" />
                            <div>
                                <span className="font-black text-sm">Modo Debug Activo</span>
                                <span className="text-xs opacity-70 ml-2">Desactívalo en producción para mayor seguridad.</span>
                            </div>
                        </motion.div>
                    )}
                    {pendingMigrations > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/8 border border-amber-500/30 text-amber-400">
                            <FileWarning size={16} className="flex-shrink-0" />
                            <div>
                                <span className="font-black text-sm">{pendingMigrations} Migración(es) Pendiente(s)</span>
                                <span className="text-xs opacity-70 ml-2">Ejecuta <code className="font-mono bg-amber-500/10 px-1 rounded">php artisan migrate</code></span>
                            </div>
                        </motion.div>
                    )}
                    {failedJobs > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/8 border border-rose-500/30 text-rose-400">
                            <XCircle size={16} className="flex-shrink-0" />
                            <div>
                                <span className="font-black text-sm">{failedJobs} Job(s) Fallido(s) en Cola</span>
                                <span className="text-xs opacity-70 ml-2">Ejecuta <code className="font-mono bg-rose-500/10 px-1 rounded">php artisan queue:retry all</code></span>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Database */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Surface variant="secondary" className="rounded-3xl border border-[var(--color-border)] overflow-hidden p-0">
                            <SectionHeader icon={Database} title="Base de Datos" subtitle="Conexión y rendimiento" accent="bg-[var(--color-primary)]/15 text-[var(--color-primary)]" />
                            <InfoRow label="Estado" value={<StatusPill ok={dbStats.status === 'ok'} label={dbStats.status.toUpperCase()} />} />
                            <InfoRow label="Motor" value={<span className="font-mono text-sm uppercase font-black">{dbStats.driver}</span>} />
                            <InfoRow label="Base de datos" value={dbStats.connection} mono />
                            <InfoRow label="Latencia" value={<LatencyMeter ms={dbStats.latency_ms} />} />
                            {dbStats.size && <InfoRow label="Tamaño" value={dbStats.size} />}
                            {dbStats.error && (
                                <div className="px-6 py-3 text-xs text-rose-400 font-mono bg-rose-500/5 border-t border-rose-500/20">
                                    {dbStats.error}
                                </div>
                            )}
                        </Surface>
                    </motion.div>

                    {/* Storage */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <Surface variant="secondary" className="rounded-3xl border border-[var(--color-border)] overflow-hidden p-0">
                            <SectionHeader icon={HardDrive} title="Almacenamiento" subtitle="Disco y directorios" accent="bg-amber-500/15 text-amber-400" />
                            <InfoRow label="Escritura Storage" value={<StatusPill ok={storageStats.storage_writable} label={storageStats.storage_writable ? 'WRITABLE' : 'READ ONLY'} />} />
                            <InfoRow label="Escritura Public" value={<StatusPill ok={storageStats.public_writable} />} />
                            <InfoRow label="Size logs/" value={storageStats.logs_size} />
                            <InfoRow label="Size cache/" value={storageStats.cache_size} />
                            <InfoRow label="Espacio libre" value={storageStats.disk_free} />
                            <InfoRow label="Espacio total" value={storageStats.disk_total} />
                            <DiskBar percent={storageStats.disk_used_percent} />
                        </Surface>
                    </motion.div>

                    {/* App Info */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Surface variant="secondary" className="rounded-3xl border border-[var(--color-border)] overflow-hidden p-0">
                            <SectionHeader icon={Server} title="Entorno de Aplicación" subtitle="PHP · Laravel · Config" accent="bg-violet-500/15 text-violet-400" />
                            <InfoRow label="PHP" value={appInfo.php_version} mono />
                            <InfoRow label="Laravel" value={appInfo.laravel_version} mono />
                            <InfoRow label="Entorno" value={
                                <span className={cn(
                                    'px-2 py-0.5 rounded-lg text-xs font-black',
                                    appInfo.environment === 'production'
                                        ? 'bg-emerald-500/15 text-emerald-400'
                                        : 'bg-amber-500/15 text-amber-400'
                                )}>
                                    {appInfo.environment}
                                </span>
                            } />
                            <InfoRow label="Debug Mode" value={
                                <StatusPill ok={!appInfo.debug_mode} label={appInfo.debug_mode ? 'ACTIVO ⚠️' : 'DESACTIVADO'} />
                            } />
                            <InfoRow label="Timezone" value={appInfo.timezone} mono />
                            <InfoRow label="Cache Driver" value={appInfo.cache_driver} mono />
                            <InfoRow label="Session Driver" value={appInfo.session_driver} mono />
                            <InfoRow label="Queue Driver" value={appInfo.queue_driver} mono />
                            <InfoRow label="Mail" value={appInfo.mail_mailer} mono />
                        </Surface>
                    </motion.div>

                    {/* Services */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                        <Surface variant="secondary" className="rounded-3xl border border-[var(--color-border)] overflow-hidden p-0">
                            <SectionHeader icon={Activity} title="Servicios" subtitle="Cache · Sessions · Jobs" accent="bg-cyan-500/15 text-cyan-400" />

                            {/* Cache */}
                            <div className="px-6 py-4 border-b border-[var(--color-border)]/30">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black uppercase tracking-widest opacity-40">Cache</span>
                                    <StatusPill ok={cacheHealth.status === 'ok'} />
                                </div>
                                <div className="text-sm font-mono text-[var(--color-primary)] font-bold">{cacheHealth.driver}</div>
                                {cacheHealth.error && <div className="text-xs text-rose-400 mt-1">{cacheHealth.error}</div>}
                            </div>

                            {/* Sessions */}
                            <div className="px-6 py-4 border-b border-[var(--color-border)]/30">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-black uppercase tracking-widest opacity-40">Sesiones</span>
                                    <StatusPill ok={sessionStats.status === 'ok'} />
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    {[
                                        { label: 'Total', value: sessionStats.total },
                                        { label: 'Activas', value: sessionStats.active },
                                        { label: 'Hoy', value: sessionStats.today },
                                    ].map(s => (
                                        <div key={s.label} className="bg-[var(--color-bg-primary)] rounded-xl p-3 border border-[var(--color-border)]/50">
                                            <div className="text-xl font-black">{s.value}</div>
                                            <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-0.5">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Failed Jobs */}
                            <div className="px-6 py-4 border-b border-[var(--color-border)]/30">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest opacity-40">Failed Jobs</span>
                                    <div className="flex items-center gap-2">
                                        <span className={cn('text-2xl font-black', failedJobs > 0 ? 'text-rose-400' : 'text-emerald-400')}>
                                            {failedJobs}
                                        </span>
                                        <StatusPill ok={failedJobs === 0} label={failedJobs === 0 ? 'LIMPIO' : 'FALLIDOS'} />
                                    </div>
                                </div>
                            </div>

                            {/* Migrations */}
                            <div className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest opacity-40">Migraciones Pendientes</span>
                                    <div className="flex items-center gap-2">
                                        <span className={cn('text-2xl font-black', pendingMigrations > 0 ? 'text-amber-400' : 'text-emerald-400')}>
                                            {pendingMigrations < 0 ? '?' : pendingMigrations}
                                        </span>
                                        <StatusPill ok={pendingMigrations === 0} label={pendingMigrations === 0 ? 'AL DÍA' : 'PENDIENTE'} />
                                    </div>
                                </div>
                            </div>
                        </Surface>
                    </motion.div>
                </div>

                {/* ── Table Counts ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                    <Surface variant="secondary" className="rounded-3xl border border-[var(--color-border)] overflow-hidden p-0">
                        <SectionHeader icon={Table2} title="Conteo de Registros" subtitle="Volumen de datos por tabla" accent="bg-fuchsia-500/15 text-fuchsia-400" />

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 divide-x divide-y md:divide-y-0 divide-[var(--color-border)]/30">
                            {tableOrder.map((table, i) => {
                                const count = tableCounts[table];
                                return (
                                    <motion.div
                                        key={table}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 + i * 0.05 }}
                                        className="flex flex-col items-center justify-center p-5 hover:bg-[var(--color-bg-tertiary)]/30 transition-colors"
                                    >
                                        <div className={cn(
                                            'text-3xl font-black',
                                            count === null ? 'text-rose-400' : 'text-[var(--color-text-primary)]'
                                        )}>
                                            {count === null ? '—' : count.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest opacity-35 mt-1">{table}</div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </Surface>
                </motion.div>

            </div>
        </AuthenticatedLayout>
    );
}
