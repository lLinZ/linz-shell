import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import BrandingHeader from '@/Components/BrandingHeader';
import FloatingChat from '@/Components/Chat/FloatingChat';
import { motion } from 'framer-motion';
import { Typography } from '@/Components/ui/Typography';
import ThemeManager from '@/Components/ThemeManager';

export default function Guest({ children }: PropsWithChildren) {
    const { branding } = usePage<any>().props;

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 overflow-x-hidden bg-[var(--color-bg-primary)] font-sans selection:bg-[var(--color-primary)] selection:text-white">
            <ThemeManager />
            <BrandingHeader />

            {/* --- IMMERSIVE BACKGROUND LAYER --- */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Primary Animated Orbs - Adjusted for mobile performance/visibility */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 45, 0],
                        x: [0, 40, 0],
                        y: [0, 20, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -left-[10%] w-[80%] sm:w-[50%] h-[80%] sm:h-[50%] rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-accent)]/10 blur-[80px] sm:blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [0, -30, 0],
                        x: [0, -50, 0],
                        y: [0, -30, 0]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[10%] -right-[10%] w-[70%] sm:w-[40%] h-[70%] sm:h-[40%] rounded-full bg-gradient-to-tr from-[var(--color-accent)]/20 to-[var(--color-primary)]/10 blur-[70px] sm:blur-[100px]"
                />

                {/* Textural Layers */}
                <div className="absolute inset-0 opacity-[0.3] sm:opacity-[0.4] dark:opacity-[0.1] sm:dark:opacity-[0.2] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                <div className="absolute inset-0 opacity-[0.03] sm:opacity-[0.05]"
                    style={{ backgroundImage: 'radial-gradient(var(--color-text-primary) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                />
            </div>

            {/* --- MAIN INTERFACE LAYER --- */}
            <div className="relative z-10 w-full max-w-[480px] flex flex-col items-center">

                {/* Elevating Logo - Smaller on mobile */}
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="mb-6 sm:mb-8 md:mb-10"
                >
                    <Link href="/" className="group relative">
                        <div className="absolute inset-0 bg-[var(--color-primary)] blur-2xl opacity-10 group-hover:opacity-30 transition-opacity duration-700" />

                        <div className="relative p-3 sm:p-4 md:p-5 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] bg-[var(--color-bg-secondary)] shadow-xl border border-white/20 group-hover:scale-105 transition-all duration-700 backdrop-blur-3xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                            {branding?.site_logo ? (
                                <img src={branding.site_logo} alt={branding.site_name} className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain drop-shadow-sm" />
                            ) : (
                                <div className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 flex items-center justify-center bg-[var(--color-primary)]/5 rounded-xl sm:rounded-2xl">
                                    <span className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--color-primary)] italic tracking-tighter">L</span>
                                </div>
                            )}
                        </div>
                    </Link>
                </motion.div>

                {/* Premium Card Container - Responsive padding and rounding */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full relative"
                >
                    <div className="w-full bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-secondary)]/70 backdrop-blur-[40px] border border-[var(--color-border)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-2xl rounded-[2rem] sm:rounded-[3rem] md:rounded-[3.5rem] overflow-hidden">
                        <div className="relative p-6 sm:p-10 md:p-14">
                            {children}
                        </div>
                    </div>
                </motion.div>

                {/* Footer Details */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 sm:mt-10 md:mt-12 flex flex-col items-center gap-4 sm:gap-6"
                >
                    <div className="flex gap-6 sm:gap-10 text-xs sm:text-sm font-medium tracking-wide uppercase text-[var(--color-text-muted)]">
                        <Link href="/privacy" className="hover:text-[var(--color-primary)] transition-all">Privacidad</Link>
                        <Link href="/terms" className="hover:text-[var(--color-primary)] transition-all">Términos</Link>
                    </div>
                    <Typography variant="muted" className="text-[10px] sm:text-xs opacity-50 text-center">
                        &copy; {new Date().getFullYear()} {branding?.site_name || 'Linz Shell'}. <span className="hidden sm:inline">Built for Excellence.</span>
                    </Typography>
                </motion.div>
            </div>

            {usePage<any>().props.modules?.find((m: any) => m.slug === 'chat')?.is_enabled === true && <FloatingChat />}
        </div>
    );
}
