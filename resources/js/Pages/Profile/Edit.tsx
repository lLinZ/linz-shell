import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { motion } from 'framer-motion';
import { Typography } from '@/Components/ui/Typography';
import { Settings, UserCircle, Key, ShieldAlert, Sparkles, Layout } from 'lucide-react';
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
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    } as any;

    const sectionVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    } as any;

    return (
        <AuthenticatedLayout>
            <Head title="Mi Perfil - Configuración" />

            <div className="py-10 sm:py-16 overflow-x-hidden">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

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
                                    <Typography variant="h1" className="text-4xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-br from-[var(--color-text-primary)] via-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
                                        Configuración
                                    </Typography>
                                    <Typography variant="muted" className="text-lg font-medium opacity-60">
                                        Gestiona tu cuenta y preferencias personales.
                                    </Typography>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--color-bg-tertiary)]/30 border border-white/5 backdrop-blur-sm">
                            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                            <span className="text-sm font-black uppercase tracking-widest text-[var(--color-text-muted)]">Premium Experience</span>
                        </div>
                    </motion.div>

                    {/* --- Main Configuration Grid --- */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-12"
                    >
                        {/* Section 1: Profile Information */}
                        <motion.section variants={sectionVariants} className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-accent)]/20 rounded-[3rem] blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-[var(--color-bg-secondary)]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden shadow-[var(--color-primary)]/5">
                                <div className="p-8 sm:p-12 md:p-16">
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                    />
                                </div>
                            </div>
                        </motion.section>

                        {/* Section 2: Security & Password */}
                        <motion.section variants={sectionVariants} className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-[var(--color-primary)]/20 rounded-[3rem] blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-[var(--color-bg-secondary)]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden shadow-orange-500/5">
                                <div className="p-8 sm:p-12 md:p-16">
                                    <UpdatePasswordForm />
                                </div>
                            </div>
                        </motion.section>

                        {/* Section 3: Danger Zone */}
                        <motion.section variants={sectionVariants} className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-[3rem] blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-[var(--color-bg-secondary)]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden shadow-red-500/5">
                                <div className="p-8 sm:p-12 md:p-16">
                                    <DeleteUserForm />
                                </div>
                            </div>
                        </motion.section>
                    </motion.div>

                    {/* --- Footer Branding --- */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="mt-20 pb-10 text-center space-y-4"
                    >
                        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent opacity-50" />
                        <Typography variant="muted" className="text-xs font-black uppercase tracking-[0.3em] opacity-40">
                            Linz Identity Management System &bull; Secured By JobApp
                        </Typography>
                    </motion.div>

                </div>
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
