import { usePage } from '@inertiajs/react';
import { PageProps, User } from '@/types';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import { generateColorPalette, applyPaletteToCSSVariables } from '@/lib/colorUtils';
import { DesktopSidebar } from './Partials/DesktopSidebar';
import { MobileNav } from './Partials/AuthenticatedMobileNav';
import { cn } from '@/lib/utils';
import BrandingHeader from '@/Components/BrandingHeader';
import Navbar from '@/Components/Navbar';
import FloatingChat from '@/Components/Chat/FloatingChat';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeManager from '@/Components/ThemeManager';

export default function Authenticated({
    header,
    children,
    fullWidth = false,
}: PropsWithChildren<{ header?: ReactNode, fullWidth?: boolean }>) {
    const user = usePage().props.auth.user as User;
    const isClient = user.role === 'client';
    // @ts-ignore
    const { menu } = usePage<PageProps>().props;
    const [showingMobileMenu, setShowingMobileMenu] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    return (
        <div className={cn(
            "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] flex flex-col font-sans relative selection:bg-[var(--color-primary)]/30 transition-colors duration-500",
            !isClient && "md:flex-row overflow-hidden",
            fullWidth ? "h-screen" : "min-h-screen"
        )}>
            <ThemeManager />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--color-primary-low),transparent_50%)] pointer-events-none opacity-20" />

            <BrandingHeader />

            {/* Conditional Navigation */}
            {!isClient ? (
                <DesktopSidebar user={user} menu={menu} />
            ) : (
                <Navbar />
            )}

            {/* Main Content Area */}
            <div className={cn(
                "flex-1 flex flex-col relative z-0",
                !isClient && "md:ml-64",
                fullWidth ? "h-screen overflow-hidden" : "min-h-screen"
            )}>

                {/* Mobile Navigation (Admin only) */}
                {!isClient && (
                    <MobileNav
                        user={user}
                        menu={menu}
                        showingDropdown={showingMobileMenu}
                        setShowingDropdown={setShowingMobileMenu}
                    />
                )}

                {/* Page Header - Premium Glassmorphism on Scroll */}
                <AnimatePresence>
                    {header && (
                        <header className={cn(
                            "sticky top-0 z-40 transition-all duration-500 border-b",
                            isScrolled
                                ? "bg-[var(--color-bg-secondary)]/80 backdrop-blur-xl border-[var(--color-border)] py-4 px-4 sm:px-6 lg:px-8 shadow-2xl"
                                : "bg-transparent border-transparent py-10 px-4 sm:px-6 lg:px-8"
                        )}>
                            <div className="max-w-7xl mx-auto">
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {header}
                                </motion.div>
                            </div>
                        </header>
                    )}
                </AnimatePresence>

                {/* Page Content */}
                <main className={cn(
                    "flex-1 relative",
                    fullWidth ? "overflow-hidden" : "p-4 sm:p-6 lg:p-8"
                )}>
                    <div className={cn(
                        !fullWidth && "max-w-7xl mx-auto",
                        fullWidth && "h-full w-full"
                    )}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="h-full"
                        >
                            {children}
                        </motion.div>
                    </div>
                </main>

                <footer className="py-10 text-center opacity-20 hover:opacity-100 transition-opacity duration-700">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-text-muted)]">
                        Strategic Master Engine &bull; JOBI Core v4.2
                    </span>
                </footer>
            </div>
            {usePage<any>().props.modules?.find((m: any) => m.slug === 'chat')?.is_enabled === true && <FloatingChat />}
        </div>
    );
}
