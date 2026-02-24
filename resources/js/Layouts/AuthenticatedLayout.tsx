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

    // Apply dark mode class and color palette reactively
    useEffect(() => {
        if (user.dark_mode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        const palette = generateColorPalette(user.avatar_color || '#3B82F6', user.dark_mode);
        applyPaletteToCSSVariables(palette);
    }, [user.avatar_color, user.dark_mode]);

    return (
        <div className={cn(
            "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] flex flex-col font-sans relative",
            !isClient && "md:flex-row overflow-hidden",
            fullWidth ? "h-screen" : "min-h-screen"
        )}>
            <BrandingHeader />

            {/* Conditional Navigation: Dashboard Sidebar vs Public Navbar */}
            {!isClient ? (
                <DesktopSidebar user={user} menu={menu} />
            ) : (
                <Navbar />
            )}

            {/* Main Content Area */}
            <div className={cn(
                "flex-1 flex flex-col bg-[var(--color-bg-primary)]",
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

                {/* Page Header (Only if provided) */}
                {header && (
                    <header className="bg-[var(--color-bg-primary)] py-8 px-4 sm:px-6 lg:px-8 border-b border-[var(--color-border)]/50 flex-shrink-0">
                        <div className="max-w-7xl mx-auto">
                            {header}
                        </div>
                    </header>
                )}

                {/* Page Content */}
                <main className={cn(
                    "flex-1",
                    fullWidth ? "overflow-hidden" : "p-4 sm:p-6 lg:p-8"
                )}>
                    <div className={cn(
                        !fullWidth && "max-w-7xl mx-auto",
                        fullWidth && "h-full w-full"
                    )}>
                        {children}
                    </div>
                </main>
            </div>
            <FloatingChat />
        </div>
    );
}
