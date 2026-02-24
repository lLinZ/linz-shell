import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import BlockRenderer from '@/Components/PageBuilder/BlockRenderer';
import '@/Components/PageBuilder/RegistryLoader';
import CartDrawer from '@/Components/Ecommerce/CartDrawer';
import Navbar from '@/Components/Navbar';

import BrandingHeader from '@/Components/BrandingHeader';
import FloatingChat from '@/Components/Chat/FloatingChat';

export default function Welcome({
    blocks,
    page,
}: PageProps<{ blocks: any[], page: any }>) {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] transition-colors duration-300 flex flex-col relative">
            <BrandingHeader title={page?.title || "Bienvenido"} />
            <CartDrawer />
            <Navbar />

            <main className="flex-1">
                <BlockRenderer blocks={blocks} />
            </main>
            <FloatingChat />
        </div>
    );
}
