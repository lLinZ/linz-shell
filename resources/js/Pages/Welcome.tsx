import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import BlockRenderer from '@/Components/PageBuilder/BlockRenderer';
import '@/Components/PageBuilder/RegistryLoader'; // Initialize block registrations

export default function Welcome({
    blocks,
}: PageProps<{ blocks: any[] }>) {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] transition-colors duration-300">
            <Head title="Bienvenido" />
            <main>
                <BlockRenderer blocks={blocks} />
            </main>
        </div>
    );
}
