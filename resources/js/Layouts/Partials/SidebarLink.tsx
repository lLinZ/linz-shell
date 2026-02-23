import { Link, usePage } from '@inertiajs/react';
import * as OutlineIcons from '@heroicons/react/24/outline';
import { PageProps } from '@/types';

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
    // @ts-ignore
    const Icon = OutlineIcons[name] || OutlineIcons.QuestionMarkCircleIcon;
    return <Icon className={className} />;
};

interface SidebarLinkProps {
    item: any;
    isChild?: boolean;
}

export const SidebarLink = ({ item, isChild = false }: SidebarLinkProps) => {
    const isActive = item.route && route().current(item.route);

    if (isChild) {
        return (
            <Link
                href={item.route ? route(item.route) : item.url || '#'}
                className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${isActive
                        ? 'text-[var(--color-primary)] font-bold bg-[var(--color-primary)]/10'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-tertiary)]'
                    }`}
            >
                {item.label}
            </Link>
        );
    }

    return (
        <div className="group/item">
            <Link
                href={item.route ? route(item.route) : item.url || '#'}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                        ? 'bg-[var(--color-primary)] text-white font-bold shadow-lg shadow-[var(--color-primary)]/20 scale-[1.02]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                    }`}
            >
                {item.icon && (
                    <DynamicIcon
                        name={item.icon}
                        className={`h-5 w-5 mr-3 transition-colors duration-300 ${isActive ? 'text-white' : 'text-[var(--color-text-muted)] group-hover/item:text-[var(--color-primary)]'
                            }`}
                    />
                )}
                <span>{item.label}</span>
            </Link>

            {item.children && item.children.length > 0 && (
                <div className="ml-4 mt-1 space-y-1 border-l border-[var(--color-border)] pl-2">
                    {item.children.map((child: any) => (
                        <SidebarLink key={child.id} item={child} isChild={true} />
                    ))}
                </div>
            )}
        </div>
    );
};
