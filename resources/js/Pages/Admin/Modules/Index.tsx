import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { Power, Cpu, ChevronLeft, ShieldCheck, Info, Sparkles } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Module {
    id: number;
    name: string;
    slug: string;
    description: string;
    is_enabled: boolean;
}

export default function Index({ auth, modules }: PageProps<{ modules: Module[] }>) {
    const toggleModule = (module: Module) => {
        router.patch(route('admin.modules.update', module.id), {
            is_enabled: !module.is_enabled,
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
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master: Ecosistema de Módulos" />

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
                                <Cpu className="w-8 h-8" />
                            </div>
                            <div>
                                <Typography variant="gradient">
                                    Ecosistema de Módulos
                                </Typography>
                                <Typography variant="muted" className="text-lg font-medium opacity-60">
                                    Activa o desactiva capacidades funcionales bajo demanda.
                                </Typography>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] backdrop-blur-sm">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">Module Registry Safe</span>
                    </div>
                </motion.div>

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
                                        <th className="p-6"><Typography variant="small" className="font-black uppercase tracking-widest opacity-40">MÓDULO</Typography></th>
                                        <th className="p-6"><Typography variant="small" className="font-black uppercase tracking-widest opacity-40">DESCRIPCIÓN</Typography></th>
                                        <th className="p-6"><Typography variant="small" className="font-black uppercase tracking-widest opacity-40">ESTADO</Typography></th>
                                        <th className="p-6 text-right"><Typography variant="small" className="font-black uppercase tracking-widest opacity-40">INTERRUPTOR</Typography></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-border)]">
                                    {modules.map((module) => (
                                        <motion.tr
                                            key={module.id}
                                            variants={itemVariants}
                                            className="hover:bg-[var(--color-bg-tertiary)]/50 transition-all duration-300 group"
                                        >
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                                                        module.is_enabled
                                                            ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)]"
                                                            : "bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                                                    )}>
                                                        <Cpu className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <Typography className="font-black text-lg group-hover:text-[var(--color-primary)] transition-colors">
                                                            {module.name}
                                                        </Typography>
                                                        <Typography variant="small" className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] opacity-60 uppercase tracking-widest">
                                                            {module.slug}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <Typography variant="small" className="text-[var(--color-text-secondary)] opacity-70 max-w-md leading-relaxed font-medium">
                                                    {module.description || 'Sin descripción disponible para este módulo.'}
                                                </Typography>
                                            </td>
                                            <td className="p-6">
                                                <div className={cn(
                                                    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border transition-all",
                                                    module.is_enabled
                                                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20"
                                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                                )}>
                                                    <div className={cn("w-1 h-1 rounded-full", module.is_enabled ? "bg-[var(--color-primary)] animate-pulse" : "bg-red-500")} />
                                                    {module.is_enabled ? 'Instanciado' : 'Suspendido'}
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <Button
                                                    variant={module.is_enabled ? "ghost" : "premium"}
                                                    size="sm"
                                                    onClick={() => toggleModule(module)}
                                                    className={cn(
                                                        "rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[9px] transition-all",
                                                        module.is_enabled ? "hover:bg-red-500/10 hover:text-red-500 text-[var(--color-text-muted)]" : ""
                                                    )}
                                                >
                                                    <Power className="w-3.5 h-3.5 mr-2" />
                                                    {module.is_enabled ? 'Desactivar' : 'Activar'}
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 bg-[var(--color-bg-tertiary)]/30 border-t border-[var(--color-border)] flex items-center justify-center gap-3">
                            <Info className="w-4 h-4 text-blue-500" />
                            <Typography variant="small" className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
                                Los cambios en los módulos pueden requerir una recarga de la aplicación para surtir efecto global.
                            </Typography>
                            <Sparkles className="w-4 h-4 text-amber-500/40" />
                        </div>
                    </Surface>
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}
