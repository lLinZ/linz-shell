import { Link, usePage } from '@inertiajs/react';
import * as OutlineIcons from '@heroicons/react/24/outline';
import { PageProps } from '@/types';
import { Typography } from '@/Components/ui/Typography';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
    // @ts-ignore
    const Icon = OutlineIcons[name] || OutlineIcons.QuestionMarkCircleIcon;
    return <Icon className={className} />;
};

interface SidebarLinkProps {
    item: any;
    isChild?: boolean;
    onClick?: () => void;
}

export const SidebarLink = ({ item, isChild = false, onClick }: SidebarLinkProps) => {
    const isActive = item.route && route().current(item.route);

    if (isChild) {
        return (
            <Link
                href={item.route ? route(item.route) : item.url || '#'}
                onClick={onClick}
                className={cn(
                    "group relative flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                    isActive
                        ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 shadow-lg shadow-[var(--color-primary)]/5"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] border border-transparent"
                )}
            >
                {isActive && (
                    <motion.div
                        layoutId="activeIndicatorChild"
                        className="absolute left-1 w-1 h-3 rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]"
                    />
                )}
                <Typography variant="small" className="truncate font-black uppercase tracking-widest text-[10px]">
                    {item.label}
                </Typography>
            </Link>
        );
    }

    return (
        <div className="group/item space-y-1">
            <Link
                href={item.route ? route(item.route) : item.url || '#'}
                onClick={onClick}
                className={cn(
                    "relative flex items-center px-4 py-3 rounded-2xl text-sm transition-all duration-500 overflow-hidden border",
                    isActive
                        ? "bg-gradient-to-r from-[var(--color-primary)]/20 to-transparent border-[var(--color-primary)]/30 text-[var(--color-text-primary)] shadow-2xl shadow-[var(--color-primary)]/10"
                        : "bg-transparent border-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
                )}
            >
                {/* Active Glow Effect */}
                {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-transparent opacity-10 blur-xl translate-x-[-50%]" />
                )}

                {/* Active Indicator Line */}
                {isActive && (
                    <motion.div
                        layoutId="activeIndicatorMain"
                        className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full bg-[var(--color-primary)] shadow-[0_0_15px_var(--color-primary)]"
                    />
                )}

                {item.icon && (
                    <div className={cn(
                        "p-2 rounded-xl mr-3 transition-colors duration-300",
                        isActive ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]" : "bg-[var(--color-bg-tertiary)]/50 text-[var(--color-text-muted)]/50 group-hover/item:text-[var(--color-text-primary)] group-hover/item:bg-[var(--color-bg-tertiary)]"
                    )}>
                        <DynamicIcon
                            name={item.icon}
                            className="h-4 w-4"
                        />
                    </div>
                )}

                <Typography variant="small" className={cn(
                    "font-black uppercase tracking-[0.15em] text-[11px] transition-all",
                    isActive ? "translate-x-1" : "group-hover/item:translate-x-1"
                )}>
                    {item.label}
                </Typography>
            </Link>

            {item.children && item.children.length > 0 && (
                <div className="ml-6 flex flex-col gap-1 relative">
                    <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-border)] to-transparent" />
                    {item.children.map((child: any) => (
                        <SidebarLink key={child.id} item={child} isChild={true} onClick={onClick} />
                    ))}
                </div>
            )}
        </div>
    );
};
