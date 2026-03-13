import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { Send, Calendar, Users, ChevronRight, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface FormSummary {
    form_name: string;
    total_submissions: number;
    last_submission_at: string;
}

export default function Index({ forms }: PageProps<{ forms: FormSummary[] }>) {
    useEffect(() => {
        const channel = window.Echo.private('admin.leads')
            .listen('FormSubmitted', (e: any) => {
                console.log('New Lead Received:', e);
                // Trigger an Inertia partial reload for 'forms'
                router.reload({ only: ['forms'] });
            });

        return () => {
            channel.stopListening('FormSubmitted');
        };
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Formularios - Linz Shell" />

            <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-[var(--color-primary)]/10 rounded-2xl text-[var(--color-primary)]">
                                <LayoutDashboard className="w-8 h-8" />
                            </div>
                            <div>
                                <Typography variant="gradient" className="text-4xl">
                                    Directorio de Leads
                                </Typography>
                                <Typography variant="muted" className="text-sm font-bold opacity-60 uppercase tracking-[0.2em]">
                                    Selecciona un formulario para ver los contactos
                                </Typography>
                            </div>
                        </div>
                    </div>

                    <Surface variant="tertiary" rounding="2xl" className="px-6 py-3 border-[var(--color-border)] backdrop-blur-md flex items-center gap-3 text-[var(--color-primary)]">
                        <Users className="w-5 h-5" />
                        <Typography variant="small" className="font-black uppercase tracking-widest">{forms.length} Formularios Activos</Typography>
                    </Surface>
                </motion.div>

                {/* Forms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {forms.length === 0 && (
                        <div className="col-span-full py-32 text-center opacity-20">
                            <Send className="w-16 h-16 mx-auto mb-4" />
                            <Typography variant="h3">No hay captación de datos todavía.</Typography>
                        </div>
                    )}

                    {forms.map((form, index) => (
                        <motion.div
                            key={form.form_name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={route('admin.submissions.show', form.form_name)}>
                                <Surface
                                    variant="premium"
                                    rounding="3xl"
                                    interactive
                                    className="p-8 border border-white/5 hover:border-[var(--color-primary)]/40 transition-all group overflow-hidden relative"
                                    glow
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Send className="w-24 h-24 rotate-12" />
                                    </div>

                                    <div className="relative z-10 space-y-6">
                                        <div className="space-y-1">
                                            <Typography variant="small" className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Formulario</Typography>
                                            <Typography variant="h3" className="font-black group-hover:text-[var(--color-primary)] transition-colors">
                                                {form.form_name}
                                            </Typography>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="space-y-1">
                                                <Typography variant="p" className="text-2xl font-black">
                                                    {form.total_submissions}
                                                </Typography>
                                                <Typography variant="small" className="text-[9px] font-black uppercase tracking-widest opacity-40">Leads Totales</Typography>
                                            </div>

                                            <div className="text-right space-y-1">
                                                <Typography variant="p" className="text-xs font-bold flex items-center justify-end gap-2 text-white/40">
                                                    <Calendar className="w-3 h-3 opacity-40" />
                                                    {form.last_submission_at ? formatDate(form.last_submission_at) : 'Sin envíos'}
                                                </Typography>
                                                <Typography variant="small" className="text-[9px] font-black uppercase tracking-widest opacity-40">Último Envío</Typography>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <Button variant="ghost" className="w-full justify-between group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)] transition-all">
                                                Ver Todos los Leads
                                                <ChevronRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </div>
                                </Surface>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
