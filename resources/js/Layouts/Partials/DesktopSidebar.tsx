import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { PageProps, User } from '@/types';
import { SidebarLink } from './SidebarLink';

interface DesktopSidebarProps {
    user: User;
    menu: any[];
}

export const DesktopSidebar = ({ user, menu }: DesktopSidebarProps) => {
    const appName = usePage<PageProps>().props.settings?.app_name || 'Linz Shell';

    return (
        <aside className="w-64 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] hidden md:flex flex-col fixed h-full z-10 transition-all duration-300">
            {/* Header */}
            <div className="h-16 flex items-center px-6 space-x-3 flex-shrink-0">
                <Link href="/" className="flex items-center space-x-3">
                    <ApplicationLogo className="block h-9 w-auto fill-current text-[var(--color-primary)]" />
                    <span className="text-[var(--color-text-primary)] font-bold text-lg truncate">
                        {appName}
                    </span>
                </Link>
            </div>

            {/* Navigation Scrollable Area */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 min-h-0 custom-scrollbar">
                {menu && menu.map((item: any) => (
                    <SidebarLink key={item.id} item={item} />
                ))}
            </div>

            {/* Profile Footer */}
            <div className="p-4 border-t border-[var(--color-border)] flex-shrink-0">
                <Dropdown>
                    <Dropdown.Trigger>
                        <button className="flex items-center w-full px-3 py-2 rounded-xl hover:bg-[var(--color-bg-tertiary)] transition-all duration-200 text-left group">
                            <div className="w-9 h-9 rounded-full bg-[var(--color-bg-primary)] flex items-center justify-center text-[var(--color-text-primary)] font-bold ring-2 ring-transparent group-hover:ring-[var(--color-primary)]/50 transition-all border border-[var(--color-border)] uppercase">
                                {user.name.charAt(0)}
                            </div>
                            <div className="ml-3 truncate">
                                <div className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                                    {user.name}
                                </div>
                                <div className="text-xs text-[var(--color-text-muted)] truncate">
                                    {user.email}
                                </div>
                            </div>
                        </button>
                    </Dropdown.Trigger>
                    {/* Direction="up" specifically requested by the user */}
                    <Dropdown.Content
                        direction="up"
                        align="right"
                        contentClasses="bg-[var(--color-bg-secondary)] border-[var(--color-border)] shadow-2xl rounded-xl mb-2"
                    >
                        <div className="px-4 py-2 border-b border-[var(--color-border)] mb-1">
                            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Cuenta</p>
                        </div>
                        <Dropdown.Link href={route('profile.edit')} className="hover:bg-[var(--color-primary)]/10 text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors px-4 py-2 text-sm flex items-center">
                            Mi Perfil
                        </Dropdown.Link>
                        <Dropdown.Link href={route('logout')} method="post" as="button" className="w-full text-left hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors px-4 py-2 text-sm flex items-center">
                            Cerrar Sesión
                        </Dropdown.Link>
                    </Dropdown.Content>
                </Dropdown>
            </div>
        </aside>
    );
};
