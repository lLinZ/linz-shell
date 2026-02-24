import React from 'react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { blockRegistry, BlockProps } from '../../BlockRegistry';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

/**
 * FooterBlock component for the 'Core' namespace.
 * Renders a dynamic footer based on payload data.
 */
const FooterBlock: React.FC<BlockProps> = ({ payload }) => {
    const columns = payload.columns || [];

    return (
        <footer className="bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] py-16 px-6 md:px-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Brand Info */}
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <ApplicationLogo className="w-8 h-8 text-[var(--color-primary)]" />
                        <Typography variant="h4" className="text-xl font-bold">
                            {payload.company_name || 'Linz Shell'}
                        </Typography>
                    </div>
                    <Typography variant="p" className="text-[var(--color-text-secondary)] max-w-sm leading-relaxed text-sm">
                        {payload.description || 'La plataforma definitiva para conectar profesionales del soporte técnico con clientes.'}
                    </Typography>
                </div>

                {/* Dynamic Columns */}
                {columns.map((column: any, idx: number) => (
                    <div key={idx}>
                        <Typography variant="h4" className="font-bold mb-6 text-sm uppercase tracking-wider">
                            {column.title}
                        </Typography>
                        <ul className="space-y-4">
                            {column.links.map((link: any, lIdx: number) => (
                                <li key={lIdx}>
                                    <Link
                                        href={link.url}
                                        className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-4">
                <Typography variant="small" className="text-[var(--color-text-muted)]">
                    {payload.copyright || `© ${new Date().getFullYear()} ${payload.company_name || 'Linz Shell'}. Todos los derechos reservados.`}
                </Typography>
                <div className="flex gap-6">
                    {payload.bottom_links?.map((link: any, idx: number) => (
                        <Link
                            key={idx}
                            href={link.url}
                            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
};

// Register the block in the 'Core' namespace
blockRegistry.register('Core', 'Footer', FooterBlock);

export default FooterBlock;
