import { PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import BlockRenderer from '@/Components/PageBuilder/BlockRenderer';
import CartDrawer from '@/Components/Ecommerce/CartDrawer';
import Navbar from '@/Components/Navbar';

import BrandingHeader from '@/Components/BrandingHeader';
import FloatingChat from '@/Components/Chat/FloatingChat';

import PublicLayout from '@/Layouts/PublicLayout';

export default function Welcome({
    blocks,
    page,
}: PageProps<{ blocks: any[], page: any }>) {
    return (
        <PublicLayout>
            <Head title={page?.title || "Bienvenido"} />

            <main className="flex-1">
                <BlockRenderer blocks={blocks} />
            </main>
        </PublicLayout>
    );
}
