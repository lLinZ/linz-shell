import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { PageProps, User } from '@/types';
import { SidebarLink } from './SidebarLink';
import { Typography } from '@/Components/ui/Typography';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronUp, User as UserIcon, LogOut, Settings } from 'lucide-react';

interface DesktopSidebarProps {
    user: User;
    menu: any[];
}

export const DesktopSidebar = ({ user, menu }: DesktopSidebarProps) => {
    const appName = usePage<PageProps>().props.settings?.app_name || 'Linz Shell';

    return (
        <aside className="w-64 bg-[var(--color-bg-secondary)]/80 backdrop-blur-xl border-r border-[var(--color-border)] hidden md:flex flex-col fixed h-full z-50 transition-all duration-300 shadow-2xl">
            {/* Header */}
            <div className="h-24 flex items-center px-8 flex-shrink-0">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="p-2 bg-[var(--color-primary)] rounded-xl shadow-lg shadow-[var(--color-primary)]/20 group-hover:scale-110 transition-transform">
                        <ApplicationLogo className="h-6 w-auto fill-current text-black" />
                    </div>
                    <div>
                        <Typography variant="h4" className="font-black text-xl tracking-tighter leading-none">
                            {appName}
                        </Typography>
                        <div className="flex items-center gap-1.5 pt-1">
                            <div className="w-1 h-1 rounded-full bg-[var(--color-primary)] animate-pulse" />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] opacity-40">Shell Active</span>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Navigation Scrollable Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 min-h-0 custom-scrollbar scroll-smooth">
                {menu && menu.map((item: any) => (
                    <SidebarLink key={item.id} item={item} />
                ))}
            </div>

            {/* Profile Footer */}
            <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/30 backdrop-blur-md flex-shrink-0">
                <Dropdown>
                    <Dropdown.Trigger>
                        <button className="flex items-center w-full p-2 rounded-2xl hover:bg-[var(--color-bg-tertiary)] border border-transparent hover:border-[var(--color-border)] transition-all duration-300 text-left group">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-black font-black text-lg shadow-lg group-hover:shadow-[var(--color-primary)]/20 transition-all uppercase">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-lg bg-emerald-500 border-2 border-[var(--color-bg-secondary)] flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                </div>
                            </div>
                            <div className="ml-3 truncate">
                                <Typography variant="small" className="font-black text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors truncate block">
                                    {user.name}
                                </Typography>
                                <Typography variant="muted" className="text-[10px] font-bold uppercase tracking-wider opacity-40 truncate block leading-none">
                                    {user.role} Authority
                                </Typography>
                            </div>
                            <ChevronUp className="w-4 h-4 ml-auto text-[var(--color-text-muted)]/50 group-hover:text-[var(--color-text-primary)] transition-colors" />
                        </button>
                    </Dropdown.Trigger>

                    <Dropdown.Content
                        direction="up"
                        align="right"
                        contentClasses="bg-[var(--color-bg-tertiary)]/95 backdrop-blur-2xl border border-[var(--color-border)] shadow-2xl rounded-2xl mb-4 overflow-hidden min-w-[200px]"
                    >
                        <div className="px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50">
                            <Typography variant="small" className="font-black text-[10px] text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Management</Typography>
                        </div>
                        <div className="p-1.5 space-y-1">
                            <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[var(--color-bg-primary)]/10 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all text-sm font-bold">
                                <UserIcon className="w-4 h-4 opacity-70" />
                                Cuenta Master
                            </Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-all text-sm font-bold">
                                <LogOut className="w-4 h-4 opacity-40" />
                                Desconectar
                            </Dropdown.Link>
                        </div>
                    </Dropdown.Content>
                </Dropdown>
            </div>
        </aside>
    );
};
