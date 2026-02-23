import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import BlockRenderer from '@/Components/PageBuilder/BlockRenderer';
import '@/Components/PageBuilder/RegistryLoader';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Button } from '@/Components/ui/button';

export default function Welcome({
    blocks,
}: PageProps<{ blocks: any[] }>) {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] transition-colors duration-300 flex flex-col">
            <Head title="Bienvenido" />

            {/* Public Navbar */}
            <nav className="sticky top-0 z-[100] bg-[var(--color-bg-primary)]/80 backdrop-blur-md border-b border-[var(--color-border)] py-4 px-6 md:px-12 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-3">
                    <ApplicationLogo className="w-10 h-10 text-[var(--color-primary)]" />
                    <span className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">Linz Shell</span>
                </Link>

                <div className="hidden md:flex gap-8 text-sm font-medium">
                    <Link href="#features" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Características</Link>
                    <Link href="#pricing" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Precios</Link>
                    <Link href="/shop" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Tienda</Link>
                </div>

                <div className="flex gap-4 items-center">
                    <Link href={route('login')}>
                        <Button variant="ghost" size="sm">Iniciar Sesión</Button>
                    </Link>
                    <Link href={route('register')}>
                        <Button size="sm">Comenzar</Button>
                    </Link>
                </div>
            </nav>

            <main className="flex-1">
                <BlockRenderer blocks={blocks} />
            </main>

            {/* Public Footer */}
            <footer className="bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] py-16 px-6 md:px-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <ApplicationLogo className="w-8 h-8 text-[var(--color-primary)]" />
                            <span className="text-xl font-bold text-[var(--color-text-primary)]">Linz Shell</span>
                        </div>
                        <p className="text-[var(--color-text-secondary)] max-w-sm leading-relaxed">
                            La plataforma definitiva para conectar profesionales del soporte técnico con clientes que buscan calidad y rapidez.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-[var(--color-text-primary)]">Producto</h4>
                        <ul className="space-y-4 text-[var(--color-text-secondary)]">
                            <li><Link href="#" className="hover:text-[var(--color-text-primary)] transition-colors">Explorar Tecnicos</Link></li>
                            <li><Link href="#" className="hover:text-[var(--color-text-primary)] transition-colors">Como funciona</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-[var(--color-text-primary)]">Empresa</h4>
                        <ul className="space-y-4 text-[var(--color-text-secondary)]">
                            <li><Link href="#" className="hover:text-[var(--color-text-primary)] transition-colors">Sobre nosotros</Link></li>
                            <li><Link href="#" className="hover:text-[var(--color-text-primary)] transition-colors">Contacto</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--color-text-secondary)]">
                    <p>© 2026 Linz Shell. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-[var(--color-text-primary)]">Privacidad</Link>
                        <Link href="#" className="hover:text-[var(--color-text-primary)]">Términos</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
