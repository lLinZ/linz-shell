import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { Trash2, Send, Eye, Calendar, Clock, X, ChevronLeft, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/Components/Modal';

interface Submission {
    id: number;
    form_name: string;
    data: Record<string, any>;
    created_at: string;
}

interface PaginatedSubmissions {
    data: Submission[];
    links: any[];
    current_page: number;
    total: number;
}

interface Props {
    formName: string;
    submissions: PaginatedSubmissions;
    headers: string[];
    [key: string]: unknown;
}

export default function Show({ formName, submissions, headers }: PageProps<Props>) {
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    useEffect(() => {
        const channel = window.Echo.private('admin.leads')
            .listen('FormSubmitted', (e: any) => {
                // Only reload if the new lead belongs to THIS form
                if (e.form_name === formName) {
                    console.log('New Lead for this form:', e);
                    router.reload({ only: ['submissions'] });
                }
            });

        return () => {
            channel.stopListening('FormSubmitted');
        };
    }, [formName]);

    const deleteSubmission = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este registro?')) {
            router.delete(route('admin.submissions.destroy', id), {
                preserveScroll: true
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${formName} - Leads Linz Shell`} />

            <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-full">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8"
                >
                    <div className="space-y-6">
                        <Link
                            href={route('admin.submissions.index')}
                            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-[var(--color-primary)] transition-all group"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Volver al Directorio
                        </Link>

                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-[var(--color-primary)] rounded-[1.5rem] text-white shadow-2xl shadow-[var(--color-primary)]/20">
                                <Send className="w-8 h-8" />
                            </div>
                            <div>
                                <Typography variant="gradient" className="text-5xl">
                                    {formName}
                                </Typography>
                                <Typography variant="muted" className="text-sm font-bold opacity-60 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    {submissions.total} registros capturados
                                </Typography>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/5 bg-white/5 backdrop-blur-md font-bold">
                            <Download className="w-4 h-4 mr-2" /> Exportar CSV
                        </Button>
                    </div>
                </motion.div>

                {/* Dynamic Datatable */}
                <Surface variant="premium" rounding="3xl" shadow="2xl" className="p-0 overflow-hidden border border-white/5" glow>
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02] backdrop-blur-md">
                                    <th className="p-6 sticky left-0 bg-[var(--color-bg-secondary)]/90 z-10 w-20">
                                        <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 text-[9px]">ID</Typography>
                                    </th>

                                    {/* DYNAMIC HEADERS */}
                                    {headers.map(header => (
                                        <th key={header} className="p-6">
                                            <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 text-[9px]">
                                                {header.replace(/_/g, ' ')}
                                            </Typography>
                                        </th>
                                    ))}

                                    <th className="p-6">
                                        <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 text-[9px]">Fecha</Typography>
                                    </th>
                                    <th className="p-6 text-right sticky right-0 bg-[var(--color-bg-secondary)]/90 z-10 w-32">
                                        <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 text-[9px]">Acciones</Typography>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {submissions.data.map((sub, idx) => (
                                    <motion.tr
                                        key={sub.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="hover:bg-white/5 transition-all group"
                                    >
                                        <td className="p-6 sticky left-0 bg-[var(--color-bg-secondary)]/50 backdrop-blur-sm z-10">
                                            <Typography variant="small" className="font-bold opacity-30">#{sub.id}</Typography>
                                        </td>

                                        {/* DYNAMIC DATA CELLS */}
                                        {headers.map(header => (
                                            <td key={`${sub.id}-${header}`} className="p-6">
                                                <Typography variant="p" className="text-sm font-medium line-clamp-2 max-w-[200px]">
                                                    {sub.data[header] || <span className="opacity-20">-</span>}
                                                </Typography>
                                            </td>
                                        ))}

                                        <td className="p-6">
                                            <Typography variant="p" className="text-xs font-bold opacity-60 whitespace-nowrap">
                                                {formatDate(sub.created_at)}
                                            </Typography>
                                        </td>

                                        <td className="p-6 text-right sticky right-0 bg-[var(--color-bg-secondary)]/50 backdrop-blur-sm z-10">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 rounded-xl hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => setSelectedSubmission(sub)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="h-10 w-10 rounded-xl bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white border-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => deleteSubmission(sub.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Simple Pagination Footer */}
                    {submissions.links.length > 3 && (
                        <div className="p-8 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                            <Typography variant="small" className="font-bold opacity-30 uppercase tracking-widest text-[9px]">
                                Mostrando {submissions.data.length} de {submissions.total} resultados
                            </Typography>
                            <div className="flex gap-2">
                                {submissions.links.map((link: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => link.url && router.get(link.url)}
                                        disabled={!link.url || link.active}
                                        className={cn(
                                            "h-10 min-w-10 px-3 rounded-xl text-xs font-black transition-all",
                                            link.active
                                                ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20"
                                                : "hover:bg-white/5 text-white/40"
                                        )}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </Surface>
            </div>

            {/* Details Modal (Reuse the same from Index but updated) */}
            <Modal show={!!selectedSubmission} onClose={() => setSelectedSubmission(null)} maxWidth="2xl">
                {selectedSubmission && (
                    <div className="bg-surface-primary/95 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden">
                        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-gradient-to-br from-white/5 to-transparent">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-[var(--color-primary)] rounded-3xl text-white shadow-2xl">
                                    <Send className="w-8 h-8" />
                                </div>
                                <div>
                                    <Typography variant="h2" className="text-3xl font-black mb-1">Inspección de Lead</Typography>
                                    <Typography variant="small" className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                                        ID #{selectedSubmission.id.toString().padStart(6, '0')} • {formatDate(selectedSubmission.created_at)}
                                    </Typography>
                                </div>
                            </div>
                            <button onClick={() => setSelectedSubmission(null)} className="p-3 hover:bg-white/5 rounded-2xl transition-all">
                                <X className="w-8 h-8 opacity-20 hover:opacity-100" />
                            </button>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-1 gap-6">
                                {Object.entries(selectedSubmission.data).map(([key, value]) => (
                                    <div key={key} className="space-y-3">
                                        <Typography variant="small" className="font-black uppercase tracking-[0.2em] opacity-40 text-[9px] px-2">
                                            {key.replace(/_/g, ' ')}
                                        </Typography>
                                        <Surface variant="secondary" rounding="2xl" className="p-6 border border-white/5 bg-black/40">
                                            <Typography variant="p" className="font-medium text-lg leading-relaxed">
                                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : value?.toString() || '-'}
                                            </Typography>
                                        </Surface>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-10 bg-white/5 border-t border-white/5 flex justify-end">
                            <Button variant="premium" className="h-14 px-12 rounded-2xl font-black" onClick={() => setSelectedSubmission(null)}>
                                Finalizar Lectura
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
