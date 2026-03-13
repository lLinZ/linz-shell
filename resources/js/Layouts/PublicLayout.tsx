import React, { ReactNode } from 'react';
import Navbar from '@/Components/Navbar';
import CartDrawer from '@/Components/Ecommerce/CartDrawer';
import FloatingChat from '@/Components/Chat/FloatingChat';
import BrandingHeader from '@/Components/BrandingHeader';
import { usePage } from '@inertiajs/react';

interface PublicLayoutProps {
    children: ReactNode;
    title?: string;
}

import ThemeManager from '@/Components/ThemeManager';

/**
 * PublicLayout for customer-facing pages.
 * Provides a clean, focused shopping experience without the admin sidebar.
 */
export default function PublicLayout({ children, title }: PublicLayoutProps) {
    const { props } = usePage<any>();
    const pageTitle = title || props.page?.title || "Linz Premium";
    const modules = props.modules || [];

    const isEcommerceEnabled = modules.find((m: any) => m.slug === 'shopping-cart')?.is_enabled === true;
    const isChatEnabled = modules.find((m: any) => m.slug === 'chat')?.is_enabled === true;

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] transition-colors duration-300 flex flex-col relative overflow-x-hidden">
            <ThemeManager />
            {/* SEO & Branding */}
            <BrandingHeader title={pageTitle} />

            {/* Global E-commerce Elements */}
            {isEcommerceEnabled && <CartDrawer />}

            {/* Navigation */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1 relative">
                {children}
            </main>

            {/* Customer Support */}
            {isChatEnabled && <FloatingChat />}

            {/* Footer Placeholder (Optional) */}
            <footer className="py-12 border-t border-[var(--color-border)]/50 bg-[var(--color-bg-secondary)]/30 backdrop-blur-md mt-auto">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-widest opacity-40">
                        © {new Date().getFullYear()} Linz Shell Premium. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}
