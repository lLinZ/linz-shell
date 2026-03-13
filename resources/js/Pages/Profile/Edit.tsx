import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { motion } from 'framer-motion';
import { Typography } from '@/Components/ui/Typography';
import { Surface } from '@/Components/ui/Surface';
import { Settings, Sparkles, UserCircle, Key, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    } as any;

    return (
        <AuthenticatedLayout>
            <Head title="Perfil Master - Premium Strategy" />

            <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                {/* --- Page Header --- */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-[var(--color-primary)]/10 rounded-2xl text-[var(--color-primary)]">
                                <Settings className="w-8 h-8 animate-[spin_8s_linear_infinite]" />
                            </div>
                            <div>
                                <Typography variant="gradient" className="text-4xl md:text-5xl font-black leading-none">
                                    Perfil Master
                                </Typography>
                                <Typography variant="muted" className="text-lg font-medium opacity-60">
                                    Configura tu identidad y credenciales de acceso.
                                </Typography>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] backdrop-blur-sm shadow-xl shadow-[var(--color-primary)]/5">
                        <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">Master Authority</span>
                    </div>
                </motion.div>

                {/* --- Configuration Sections --- */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-10"
                >
                    <motion.div variants={itemVariants}>
                        <Surface variant="premium" rounding="3xl" shadow="2xl" className="p-4 sm:p-8 lg:p-12" glow>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                    <UserCircle className="w-6 h-6" />
                                </div>
                                <Typography variant="h3" className="font-black">Información de Identidad</Typography>
                            </div>
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                        </Surface>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Surface variant="premium" rounding="3xl" shadow="2xl" className="p-4 sm:p-8 lg:p-12" glow>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                                    <Key className="w-6 h-6" />
                                </div>
                                <Typography variant="h3" className="font-black">Seguridad & Acceso</Typography>
                            </div>
                            <UpdatePasswordForm />
                        </Surface>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Surface variant="premium" rounding="3xl" shadow="2xl" className="p-4 sm:p-8 lg:p-12 border-red-500/20" glow>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <Typography variant="h3" className="font-black text-red-500">Zona de Riesgo</Typography>
                            </div>
                            <DeleteUserForm />
                        </Surface>
                    </motion.div>
                </motion.div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}} />
        </AuthenticatedLayout>
    );
}
