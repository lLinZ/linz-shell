import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Users, UserPlus, UserCheck, UserX, Search, Filter,
    Shield, ShieldCheck, Crown, Edit2, Key, Trash2,
    ToggleLeft, ToggleRight, ChevronLeft, ChevronRight,
    Mail, Clock, AlertCircle, CheckCircle2, X, Eye, EyeOff,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
    avatar_color?: string;
}

interface Stats {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    clients: number;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    users: PaginatedUsers;
    stats: Stats;
    filters: { search?: string; role?: string; status?: string };
}

// ─── Role Config ─────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    master: { label: 'Master', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/20' },
    admin: { label: 'Admin', icon: ShieldCheck, color: 'text-violet-400', bg: 'bg-violet-500/15 border-violet-500/20' },
    client: { label: 'Cliente', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/20' },
};

function RoleBadge({ role }: { role: string }) {
    const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.client;
    const Icon = cfg.icon;
    return (
        <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border', cfg.bg, cfg.color)}>
            <Icon size={11} />
            {cfg.label}
        </span>
    );
}

function StatusBadge({ active }: { active: boolean }) {
    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border',
            active
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/20',
        )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', active ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400')} />
            {active ? 'Activo' : 'Inactivo'}
        </span>
    );
}

function AvatarCircle({ name, role }: { name: string; role: string }) {
    const colors: Record<string, string> = {
        master: 'from-amber-400 to-orange-500',
        admin: 'from-violet-500 to-purple-600',
        client: 'from-cyan-400 to-blue-500',
    };
    return (
        <div className={cn(
            'w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-black text-base shadow-lg flex-shrink-0',
            colors[role] ?? 'from-slate-400 to-slate-600',
        )}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, delay }: {
    icon: React.ElementType; label: string; value: number; color: string; delay: number;
}) {
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
            <Surface variant="secondary" className="p-5 rounded-2xl border border-[var(--color-border)] flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-300">
                <div className={cn('p-3 rounded-xl', color)}>
                    <Icon size={18} className="opacity-80" />
                </div>
                <div>
                    <div className="text-2xl font-black">{value}</div>
                    <div className="text-xs font-bold uppercase tracking-widest opacity-40">{label}</div>
                </div>
            </Surface>
        </motion.div>
    );
}

// ─── Password Modal ───────────────────────────────────────────────────────────
function PasswordModal({ user, onClose }: { user: User; onClose: () => void }) {
    const [showPw, setShowPw] = useState(false);
    const { data, setData, patch, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('admin.users.password', user.id), {
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/15 rounded-xl"><Key size={18} className="text-violet-400" /></div>
                <div>
                    <Typography variant="h3" className="font-black text-lg">Cambiar Contraseña</Typography>
                    <Typography variant="muted" className="text-xs opacity-60">{user.name}</Typography>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest opacity-50">Nueva Contraseña</label>
                    <div className="relative">
                        <TextInput
                            type={showPw ? 'text' : 'password'}
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className="w-full h-12 rounded-xl pr-12"
                            placeholder="Mínimo 8 caracteres..."
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity">
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.password && <p className="text-rose-400 text-xs">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest opacity-50">Confirmar Contraseña</label>
                    <TextInput
                        type={showPw ? 'text' : 'password'}
                        value={data.password_confirmation}
                        onChange={e => setData('password_confirmation', e.target.value)}
                        className="w-full h-12 rounded-xl"
                        placeholder="Repetir contraseña..."
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 rounded-xl">Cancelar</Button>
                    <Button type="submit" variant="premium" disabled={processing} className="flex-1 h-11 rounded-xl">
                        <Key size={14} className="mr-2" /> Actualizar
                    </Button>
                </div>
            </form>
        </div>
    );
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────
function EditUserModal({ user, onClose }: { user: User; onClose: () => void }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role === 'master' ? 'admin' : user.role,
        is_active: user.is_active,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.users.update', user.id), { onSuccess: onClose });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary)]/15 rounded-xl"><Edit2 size={18} className="text-[var(--color-primary)]" /></div>
                <div>
                    <Typography variant="h3" className="font-black text-lg">Editar Usuario</Typography>
                    <Typography variant="muted" className="text-xs opacity-60">ID #{user.id}</Typography>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest opacity-50">Nombre</label>
                        <TextInput value={data.name} onChange={e => setData('name', e.target.value)} className="w-full h-12 rounded-xl" />
                        {errors.name && <p className="text-rose-400 text-xs">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest opacity-50">Email</label>
                        <TextInput type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full h-12 rounded-xl" />
                        {errors.email && <p className="text-rose-400 text-xs">{errors.email}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest opacity-50">Rol</label>
                        <select
                            value={data.role}
                            onChange={e => setData('role', e.target.value)}
                            className="w-full h-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 text-sm font-bold focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                        >
                            <option value="admin">Admin</option>
                            <option value="client">Cliente</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest opacity-50">Estado</label>
                        <button
                            type="button"
                            onClick={() => setData('is_active', !data.is_active)}
                            className={cn(
                                'w-full h-12 rounded-xl border font-black text-sm flex items-center justify-center gap-2 transition-all',
                                data.is_active
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                    : 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                            )}
                        >
                            {data.is_active ? <><ToggleRight size={18} /> Activo</> : <><ToggleLeft size={18} /> Inactivo</>}
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 rounded-xl">Cancelar</Button>
                    <Button type="submit" variant="premium" disabled={processing} className="flex-1 h-11 rounded-xl">
                        <CheckCircle2 size={14} className="mr-2" /> Guardar
                    </Button>
                </div>
            </form>
        </div>
    );
}

// ─── Create User Modal ────────────────────────────────────────────────────────
function CreateUserModal({ onClose }: { onClose: () => void }) {
    const [showPw, setShowPw] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'client',
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.store'), { onSuccess: () => { reset(); onClose(); } });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary)]/15 rounded-xl"><UserPlus size={18} className="text-[var(--color-primary)]" /></div>
                <div>
                    <Typography variant="h3" className="font-black text-lg">Nuevo Usuario</Typography>
                    <Typography variant="muted" className="text-xs opacity-60">Crear cuenta en el sistema</Typography>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest opacity-50">Nombre</label>
                        <TextInput value={data.name} onChange={e => setData('name', e.target.value)} className="w-full h-12 rounded-xl" placeholder="Nombre completo" />
                        {errors.name && <p className="text-rose-400 text-xs">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest opacity-50">Email</label>
                        <TextInput type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full h-12 rounded-xl" placeholder="correo@ejemplo.com" />
                        {errors.email && <p className="text-rose-400 text-xs">{errors.email}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest opacity-50">Contraseña</label>
                    <div className="relative">
                        <TextInput
                            type={showPw ? 'text' : 'password'}
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className="w-full h-12 rounded-xl pr-12"
                            placeholder="Mínimo 8 caracteres..."
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity">
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.password && <p className="text-rose-400 text-xs">{errors.password}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest opacity-50">Rol</label>
                        <select
                            value={data.role}
                            onChange={e => setData('role', e.target.value)}
                            className="w-full h-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 text-sm font-bold focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                        >
                            <option value="client">Cliente</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest opacity-50">Estado inicial</label>
                        <button
                            type="button"
                            onClick={() => setData('is_active', !data.is_active)}
                            className={cn(
                                'w-full h-12 rounded-xl border font-black text-sm flex items-center justify-center gap-2 transition-all',
                                data.is_active
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                    : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                            )}
                        >
                            {data.is_active ? <><ToggleRight size={18} /> Activo</> : <><ToggleLeft size={18} /> Inactivo</>}
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 rounded-xl">Cancelar</Button>
                    <Button type="submit" variant="premium" disabled={processing} className="flex-1 h-11 rounded-xl">
                        <UserPlus size={14} className="mr-2" /> Crear Usuario
                    </Button>
                </div>
            </form>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Index({ users, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters.role ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
    const [showCreate, setShowCreate] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [passwordUser, setPasswordUser] = useState<User | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { search, role: roleFilter, status: statusFilter }, { preserveState: true, replace: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        if (key === 'role') setRoleFilter(value);
        if (key === 'status') setStatusFilter(value);
        router.get(route('admin.users.index'), { search, role: key === 'role' ? value : roleFilter, status: key === 'status' ? value : statusFilter }, { preserveState: true, replace: true });
    };

    const handleToggleStatus = (user: User) => {
        router.patch(route('admin.users.toggle-status', user.id), {}, { preserveScroll: true });
    };

    const handleDelete = (user: User) => {
        router.delete(route('admin.users.destroy', user.id), {
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Usuarios" />

            <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-8">

                {/* ── Header ── */}
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-[var(--color-primary)]/20">
                                <Shield size={20} className="text-[var(--color-primary)]" />
                            </div>
                            <Typography variant="muted" className="text-xs font-black uppercase tracking-widest opacity-50">Control de Acceso</Typography>
                        </div>
                        <Typography variant="h1" className="text-4xl md:text-5xl font-black tracking-tight">Gestión de Usuarios</Typography>
                        <Typography variant="muted" className="mt-1 opacity-50">Administra roles, estados y credenciales del sistema.</Typography>
                    </div>
                    <Button
                        id="btn-create-user"
                        variant="premium"
                        onClick={() => setShowCreate(true)}
                        className="h-12 px-6 rounded-2xl shadow-lg shadow-[var(--color-primary)]/20 self-start sm:self-auto flex-shrink-0"
                        glow
                    >
                        <UserPlus size={16} className="mr-2" />
                        Nuevo Usuario
                    </Button>
                </motion.div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <StatCard icon={Users} label="Total" value={stats.total} color="bg-[var(--color-primary)]/15 text-[var(--color-primary)]" delay={0} />
                    <StatCard icon={UserCheck} label="Activos" value={stats.active} color="bg-emerald-500/15 text-emerald-400" delay={0.05} />
                    <StatCard icon={UserX} label="Inactivos" value={stats.inactive} color="bg-rose-500/15 text-rose-400" delay={0.1} />
                    <StatCard icon={ShieldCheck} label="Admins" value={stats.admins} color="bg-violet-500/15 text-violet-400" delay={0.15} />
                    <StatCard icon={Users} label="Clientes" value={stats.clients} color="bg-cyan-500/15 text-cyan-400" delay={0.2} />
                </div>

                {/* ── Filters ── */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Surface variant="secondary" className="p-4 rounded-2xl border border-[var(--color-border)]">
                        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-center">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                                <input
                                    id="user-search"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Buscar por nombre o email..."
                                    className="w-full h-10 rounded-xl pl-9 pr-4 text-sm bg-[var(--color-bg-primary)] border border-[var(--color-border)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all font-medium"
                                />
                            </div>

                            {[
                                { key: 'role', label: 'Rol', state: roleFilter, options: [['', 'Todos los roles'], ['admin', 'Admin'], ['client', 'Cliente'], ['master', 'Master']] },
                                { key: 'status', label: 'Estado', state: statusFilter, options: [['', 'Todos'], ['active', 'Activos'], ['inactive', 'Inactivos']] },
                            ].map(f => (
                                <div key={f.key} className="relative">
                                    <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
                                    <select
                                        value={f.state}
                                        onChange={e => handleFilterChange(f.key, e.target.value)}
                                        className="h-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] pl-8 pr-4 text-sm font-bold focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                                    >
                                        {f.options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                                    </select>
                                </div>
                            ))}

                            <Button type="submit" variant="premium" className="h-10 px-5 rounded-xl">
                                <Search size={14} className="mr-2" /> Buscar
                            </Button>
                        </form>
                    </Surface>
                </motion.div>

                {/* ── Table ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <Surface variant="secondary" className="rounded-3xl border border-[var(--color-border)] overflow-hidden p-0">
                        {/* Table head */}
                        <div className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 bg-[var(--color-bg-tertiary)]/40 border-b border-[var(--color-border)] text-xs font-black uppercase tracking-widest opacity-40">
                            <span>Usuario</span>
                            <span className="hidden md:block">Rol</span>
                            <span>Estado</span>
                            <span className="hidden md:block">Registro</span>
                            <span className="text-right">Acciones</span>
                        </div>

                        {users.data.length === 0 ? (
                            <div className="py-20 text-center opacity-30 font-bold italic">No se encontraron usuarios</div>
                        ) : (
                            <AnimatePresence>
                                {users.data.map((user, i) => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center border-b border-[var(--color-border)]/40 last:border-0 hover:bg-[var(--color-bg-tertiary)]/30 transition-colors"
                                    >
                                        {/* User info */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <AvatarCircle name={user.name} role={user.role} />
                                            <div className="min-w-0">
                                                <div className="font-black text-sm truncate flex items-center gap-2">
                                                    {user.name}
                                                    {user.role === 'master' && <Crown size={12} className="text-amber-400 flex-shrink-0" />}
                                                </div>
                                                <div className="text-xs opacity-40 truncate flex items-center gap-1">
                                                    <Mail size={10} />{user.email}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Role */}
                                        <div className="hidden md:block">
                                            <RoleBadge role={user.role} />
                                        </div>

                                        {/* Status */}
                                        <div><StatusBadge active={user.is_active} /></div>

                                        {/* Date */}
                                        <div className="hidden md:flex items-center gap-1.5 text-xs opacity-40 font-bold">
                                            <Clock size={11} />
                                            {new Date(user.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1.5 justify-end">
                                            {/* Toggle status */}
                                            {user.role !== 'master' && (
                                                <button
                                                    id={`toggle-user-${user.id}`}
                                                    onClick={() => handleToggleStatus(user)}
                                                    title={user.is_active ? 'Desactivar' : 'Activar'}
                                                    className={cn(
                                                        'p-2 rounded-xl transition-all hover:scale-110',
                                                        user.is_active
                                                            ? 'text-emerald-400 hover:bg-emerald-500/10'
                                                            : 'text-rose-400 hover:bg-rose-500/10'
                                                    )}
                                                >
                                                    {user.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                                </button>
                                            )}

                                            {/* Edit */}
                                            <button
                                                id={`edit-user-${user.id}`}
                                                onClick={() => setEditUser(user)}
                                                title="Editar usuario"
                                                className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all hover:scale-110"
                                            >
                                                <Edit2 size={15} />
                                            </button>

                                            {/* Change password */}
                                            <button
                                                id={`pw-user-${user.id}`}
                                                onClick={() => setPasswordUser(user)}
                                                title="Cambiar contraseña"
                                                className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-violet-400 hover:bg-violet-500/10 transition-all hover:scale-110"
                                            >
                                                <Key size={15} />
                                            </button>

                                            {/* Delete */}
                                            {user.role !== 'master' && (
                                                <button
                                                    id={`delete-user-${user.id}`}
                                                    onClick={() => setDeleteConfirm(user)}
                                                    title="Eliminar usuario"
                                                    className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-all hover:scale-110"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/20">
                                <span className="text-xs opacity-40 font-bold">
                                    {users.total} usuarios · Página {users.current_page} de {users.last_page}
                                </span>
                                <div className="flex gap-2">
                                    {users.links.map((link, i) => (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            className={cn(
                                                'px-3 py-1.5 rounded-lg text-xs font-black transition-all',
                                                link.active ? 'bg-[var(--color-primary)] text-black' : 'opacity-50 hover:opacity-100 hover:bg-[var(--color-bg-tertiary)]',
                                                !link.url && 'cursor-not-allowed opacity-20',
                                            )}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </Surface>
                </motion.div>
            </div>

            {/* ── Modals ── */}
            <Modal show={showCreate} onClose={() => setShowCreate(false)} maxWidth="lg">
                <CreateUserModal onClose={() => setShowCreate(false)} />
            </Modal>

            <Modal show={!!editUser} onClose={() => setEditUser(null)} maxWidth="lg">
                {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} />}
            </Modal>

            <Modal show={!!passwordUser} onClose={() => setPasswordUser(null)} maxWidth="md">
                {passwordUser && <PasswordModal user={passwordUser} onClose={() => setPasswordUser(null)} />}
            </Modal>

            {/* Delete Confirm */}
            <Modal show={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="sm">
                {deleteConfirm && (
                    <div className="p-6 space-y-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto">
                            <Trash2 size={28} className="text-rose-400" />
                        </div>
                        <div>
                            <Typography variant="h3" className="font-black text-xl">¿Eliminar usuario?</Typography>
                            <Typography variant="muted" className="opacity-60 mt-1">
                                Esta acción eliminará permanentemente a <strong>{deleteConfirm.name}</strong>. No se puede deshacer.
                            </Typography>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1 h-11 rounded-xl">
                                <X size={14} className="mr-2" /> Cancelar
                            </Button>
                            <Button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 h-11 rounded-xl bg-rose-500 hover:bg-rose-600 text-white border-none"
                            >
                                <Trash2 size={14} className="mr-2" /> Eliminar
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
