import { Link, router } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import * as OutlineIcons from '@heroicons/react/24/outline';
import { User } from '@/types';
import { Typography } from '@/Components/ui/Typography';
import { SidebarLink } from './SidebarLink';

interface MobileNavProps {
    user: User;
    menu: any[];
    showingDropdown: boolean;
    setShowingDropdown: (show: boolean) => void;
}

export const MobileNav = ({ user, menu, showingDropdown, setShowingDropdown }: MobileNavProps) => {
    return (
        <>
            {/* Mobile Header */}
            <header className="md:hidden h-16 flex-shrink-0 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] flex items-center justify-between px-4 z-20">
                <Link href="/">
                    <ApplicationLogo className="h-8 w-auto fill-current text-[var(--color-primary)]" />
                </Link>
                <button
                    onClick={() => setShowingDropdown(!showingDropdown)}
                    className="text-[var(--color-text-secondary)] p-2 focus:outline-none hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
                >
                    <OutlineIcons.Bars3Icon className="h-6 w-6" />
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                className={`md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${showingDropdown ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setShowingDropdown(false)}
            >
                <div
                    className={`absolute right-0 top-0 bottom-0 w-72 bg-[var(--color-bg-secondary)] p-6 transform transition-transform duration-300 shadow-2xl overflow-hidden flex flex-col ${showingDropdown ? 'translate-x-0' : 'translate-x-full'
                        }`}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-8 flex-shrink-0">
                        <Typography variant="h3" className="text-xl font-bold text-[var(--color-text-primary)]">Menú</Typography>
                        <button
                            onClick={() => setShowingDropdown(false)}
                            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                        >
                            <OutlineIcons.XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="space-y-2 overflow-y-auto flex-1 pb-24 custom-scrollbar">
                        {menu && menu.map((item: any) => (
                            <SidebarLink
                                key={item.id}
                                item={item}
                                onClick={() => setShowingDropdown(false)}
                            />
                        ))}
                    </div>

                    {/* Mobile Footer Actions */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] space-y-3">
                        <Link
                            href={route('profile.edit')}
                            className="block w-full py-3 text-center rounded-xl bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-medium"
                        >
                            Perfil
                        </Link>
                        <button
                            onClick={() => router.post(route('logout'))}
                            className="block w-full py-3 text-center rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] font-bold transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
