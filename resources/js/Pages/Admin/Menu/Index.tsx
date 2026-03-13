import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { ChevronLeft, Plus, Edit3, Trash2, Menu as MenuIcon, ListTree, Layers, Shield, Settings2, X, Save } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import TextInput from '@/Components/TextInput';
import { cn } from '@/lib/utils';

interface MenuItem {
    id: number;
    label: string;
    route?: string;
    url?: string;
    icon?: string;
    roles?: string[];
    module_slug?: string;
    order: number;
    parent_id?: number | null;
    children?: MenuItem[];
}

export default function Index({ auth, menuItems }: PageProps<{ menuItems: MenuItem[] }>) {
    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        id: 0,
        label: '',
        route: '',
        url: '',
        icon: '',
        roles: [] as string[],
        module_slug: '',
        order: 0,
        parent_id: '' as string | number,
    });

    const [editing, setEditing] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const payload: any = { ...data };
        if (!payload.parent_id) delete payload.parent_id;
        if (!payload.route) delete payload.route;
        if (!payload.url) delete payload.url;
        if (!payload.module_slug) delete payload.module_slug;

        if (editing) {
            put(route('admin.menus.update', data.id), {
                onSuccess: () => {
                    reset();
                    setEditing(false);
                }
            });
        } else {
            post(route('admin.menus.store'), {
                onSuccess: () => reset()
            });
        }
    };

    const editItem = (item: MenuItem) => {
        setEditing(true);
        setData({
            id: item.id,
            label: item.label,
            route: item.route || '',
            url: item.url || '',
            icon: item.icon || '',
            roles: item.roles || [],
            module_slug: item.module_slug || '',
            order: item.order,
            parent_id: item.parent_id || '',
        });
    };

    const cancelEdit = () => {
        setEditing(false);
        reset();
    };

    const deleteItem = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este elemento del menú?')) {
            destroy(route('admin.menus.destroy', id));
        }
    };

    const flattenItems = (items: MenuItem[]): MenuItem[] => {
        let flat: MenuItem[] = [];
        items.forEach(item => {
            flat.push(item);
            if (item.children) {
                flat = [...flat, ...flattenItems(item.children)];
            }
        });
        return flat;
    };
    const allItems = flattenItems(menuItems);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0 }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master: Menú & Estructura" />

            <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* --- Page Header --- */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
                >
                    <div className="space-y-3">
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors mb-4 group"
                        >
                            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Administración Master
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-[var(--color-primary)]/10 rounded-2xl text-[var(--color-primary)]">
                                <MenuIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <Typography variant="gradient">
                                    Gestión de Menús
                                </Typography>
                                <Typography variant="muted" className="text-lg font-medium opacity-60">
                                    Define la jerarquía de navegación y permisos de acceso.
                                </Typography>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden lg:flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] backdrop-blur-sm">
                            <ListTree className="w-5 h-5 text-[var(--color-primary)]" />
                            <span className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">Estructura Dinámica</span>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* --- Form Section --- */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4"
                    >
                        <Surface variant="premium" rounding="3xl" shadow="2xl" className="p-8 sticky top-24 " glow>
                            <div className="flex items-center gap-4 mb-8">
                                <div className={cn(
                                    "p-3 rounded-xl transition-colors",
                                    editing ? "bg-amber-500/10 text-amber-500" : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                )}>
                                    {editing ? <Settings2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                </div>
                                <div>
                                    <Typography variant="h3" className="font-black">
                                        {editing ? 'Modificar Item' : 'Nuevo Elemento'}
                                    </Typography>
                                    <Typography variant="small" className="font-bold opacity-40 uppercase tracking-widest text-[10px]">
                                        {editing ? 'Guardando cambios...' : 'Inyectar a la base'}
                                    </Typography>
                                </div>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                <div className="space-y-2">
                                    <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 text-[9px] ml-1">ETIQUETA VISUAL</Typography>
                                    <TextInput
                                        className="w-full h-12 bg-[var(--color-bg-primary)] border-[var(--color-border)] focus:border-[var(--color-primary)]/50 rounded-xl px-4 font-bold"
                                        value={data.label}
                                        onChange={(e) => setData('label', e.target.value)}
                                        placeholder="Ej: Dashboard"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 text-[9px] ml-1">RUTA INTERNA</Typography>
                                        <TextInput
                                            className="w-full h-12 bg-[var(--color-bg-primary)] border-[var(--color-border)] focus:border-[var(--color-primary)]/50 rounded-xl px-4 text-sm"
                                            value={data.route}
                                            onChange={(e) => setData('route', e.target.value)}
                                            placeholder="dashboard"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 text-[9px] ml-1">ORDEN</Typography>
                                        <TextInput
                                            type="number"
                                            className="w-full h-12 bg-[var(--color-bg-primary)] border-[var(--color-border)] focus:border-[var(--color-primary)]/50 rounded-xl px-4 text-sm"
                                            value={data.order}
                                            onChange={(e) => setData('order', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 text-[9px] ml-1">ROLES PERMITIDOS</Typography>
                                    <div className="flex flex-wrap gap-2">
                                        {['admin', 'user', 'master'].map(role => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => {
                                                    const newRoles = data.roles.includes(role)
                                                        ? data.roles.filter(r => r !== role)
                                                        : [...data.roles, role];
                                                    setData('roles', newRoles);
                                                }}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                    data.roles.includes(role)
                                                        ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)] border-[var(--color-primary)]/30"
                                                        : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] border-[var(--color-border)]"
                                                )}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 text-[9px] ml-1">ELEMENTO PADRE</Typography>
                                    <select
                                        value={data.parent_id}
                                        onChange={(e) => setData('parent_id', e.target.value)}
                                        className="w-full h-12 bg-[var(--color-bg-primary)] border-[var(--color-border)] focus:border-[var(--color-primary)]/50 rounded-xl px-4 text-sm text-[var(--color-text-primary)] appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-[var(--color-bg-secondary)]">Ninguno (Nivel Superior)</option>
                                        {allItems.filter(i => i.id !== data.id).map(item => (
                                            <option key={item.id} value={item.id} className="bg-[var(--color-bg-secondary)]">{item.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-3">
                                    {editing && (
                                        <Button
                                            variant="ghost"
                                            onClick={cancelEdit}
                                            className="h-12 px-6 rounded-xl text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                                        >
                                            <X className="w-4 h-4 mr-2" /> Cancelar
                                        </Button>
                                    )}
                                    <Button
                                        variant="premium"
                                        disabled={processing}
                                        className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-xs"
                                    >
                                        {editing ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                        {editing ? 'Actualizar' : 'Crear Item'}
                                    </Button>
                                </div>
                            </form>
                        </Surface>
                    </motion.div>

                    {/* --- List Section --- */}
                    <div className="lg:col-span-8">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                        >
                            {menuItems.map(item => (
                                <motion.div key={item.id} variants={itemVariants}>
                                    <Surface variant="premium" rounding="2xl" className="p-0 overflow-hidden" glow={false}>
                                        <div className="p-5 flex items-center justify-between bg-[var(--color-bg-tertiary)]/50 border-b border-[var(--color-border)] group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center border border-[var(--color-primary)]/20">
                                                    <Layers className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-0.5">
                                                        <Typography className="font-black text-lg">{item.label}</Typography>
                                                        <div className="px-2 py-0.5 rounded-md bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[8px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">ORDEN #{item.order}</div>
                                                    </div>
                                                    <Typography variant="small" className="text-[var(--color-text-muted)] font-mono text-[10px]">{item.route || item.url || 'Sin Ruta'}</Typography>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <Button size="icon" variant="ghost" className="h-9 w-9 bg-[var(--color-bg-secondary)] rounded-lg hover:bg-amber-500/20 hover:text-amber-500 border border-[var(--color-border)]" onClick={() => editItem(item)}>
                                                    <Edit3 className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-9 w-9 bg-[var(--color-bg-secondary)] rounded-lg hover:bg-red-500/20 hover:text-red-500 border border-[var(--color-border)]" onClick={() => deleteItem(item.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Sub-items (Glassmorphic look) */}
                                        <AnimatePresence>
                                            {item.children && item.children.length > 0 && (
                                                <div className="p-4 bg-[var(--color-bg-tertiary)]/50 space-y-2">
                                                    {item.children.map(child => (
                                                        <motion.div
                                                            key={child.id}
                                                            initial={{ opacity: 0, x: 10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/20 transition-all group/child"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]/40 group-hover/child:bg-[var(--color-primary)] transition-colors" />
                                                                <div>
                                                                    <Typography className="font-bold text-sm text-[var(--color-text-primary)] opacity-80 group-hover/child:opacity-100 transition-colors">{child.label}</Typography>
                                                                    <Typography variant="small" className="text-[10px] text-[var(--color-text-muted)] font-mono italic">{child.route || child.url}</Typography>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1.5 opacity-0 group-hover/child:opacity-100 transition-all">
                                                                <button onClick={() => editItem(child)} className="p-1.5 text-[var(--color-text-muted)] hover:text-amber-500 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                                                                <button onClick={() => deleteItem(child.id)} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </Surface>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
