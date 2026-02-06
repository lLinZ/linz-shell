import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import { generateColorPalette, applyPaletteToCSSVariables } from '@/lib/colorUtils';
import * as OutlineIcons from '@heroicons/react/24/outline';

// Helper for dynamic icons
const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
    // @ts-ignore
    const Icon = OutlineIcons[name] || OutlineIcons.QuestionMarkCircleIcon;
    return <Icon className={className} />;
};

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    // @ts-ignore
    const { menu } = usePage<PageProps>().props;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    // Apply dark mode class and color palette reactively
    useEffect(() => {
        if (user.dark_mode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        const palette = generateColorPalette(user.avatar_color || '#3B82F6', user.dark_mode);
        applyPaletteToCSSVariables(palette);
    }, [user.avatar_color, user.dark_mode]);

    return (
        <div className="min-h-screen bg-app-dark text-app-text flex font-sans">
            {/* Sidebar (Desktop) */}
            <aside className="w-64 bg-app-dark border-r border-app-border hidden md:flex flex-col fixed h-full z-10 transition-all duration-300">
                <div className="h-16 flex items-center px-6">
                    <Link href="/">
                        <ApplicationLogo className="block h-9 w-auto fill-current text-white" />
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide">
                    {menu && menu.map((item: any) => (
                        <div key={item.id}>
                            <Link
                                href={item.route ? route(item.route) : item.url || '#'}
                                className={`flex items-center px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 ${(item.route && route().current(item.route))
                                    ? 'bg-app-accent text-black font-bold shadow-md'
                                    : 'text-gray-400 hover:bg-app-card hover:text-white'
                                    }`}
                            >
                                {item.icon && <DynamicIcon name={item.icon} className="h-5 w-5 mr-3" />}
                                {item.label}
                            </Link>

                            {/* Children Items */}
                            {item.children && item.children.length > 0 && (
                                <div className="ml-4 mt-1 space-y-1 border-l border-app-border pl-2">
                                    {item.children.map((child: any) => (
                                        <Link
                                            key={child.id}
                                            href={child.route ? route(child.route) : child.url || '#'}
                                            className={`block px-4 py-2 rounded-full text-sm transition-colors ${(child.route && route().current(child.route))
                                                ? 'text-app-accent font-medium'
                                                : 'text-gray-500 hover:text-gray-300'
                                                }`}
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-app-border">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-app-card transition text-left group">
                                <div className="w-8 h-8 rounded-full bg-app-card flex items-center justify-center text-white font-bold ring-2 ring-transparent group-hover:ring-app-accent transition-all border border-app-border">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="ml-3 truncate">
                                    <div className="text-sm font-medium text-white group-hover:text-app-accent transition-colors">{user.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                </div>
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content contentClasses="bg-app-card text-white border border-app-border shadow-xl rounded-lg overflow-hidden">
                            <Dropdown.Link href={route('profile.edit')} className="hover:bg-app-accent/20 text-gray-300 hover:text-white transition-colors">Profile</Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button" className="hover:bg-app-accent/20 text-gray-300 hover:text-white transition-colors">Log Out</Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 min-h-screen bg-app-dark">

                {/* Mobile Header */}
                <header className="md:hidden h-16 bg-app-dark border-b border-app-border flex items-center justify-between px-4 sticky top-0 z-20">
                    <Link href="/">
                        <ApplicationLogo className="h-8 w-auto fill-current text-white" />
                    </Link>
                    <button onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)} className="text-gray-400 p-2 focus:outline-none">
                        <OutlineIcons.Bars3Icon className="h-6 w-6" />
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                <div className={`md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${showingNavigationDropdown ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowingNavigationDropdown(false)}>
                    <div className={`absolute right-0 top-0 bottom-0 w-72 bg-app-card p-4 transform transition-transform duration-300 ${showingNavigationDropdown ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-lg font-bold text-white">Menu</span>
                            <button onClick={() => setShowingNavigationDropdown(false)} className="text-gray-400">
                                <OutlineIcons.XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-4 overflow-y-auto h-full pb-20">
                            {menu && menu.map((item: any) => (
                                <Link
                                    key={item.id}
                                    href={item.route ? route(item.route) : item.url || '#'}
                                    className="block text-gray-300 hover:text-white py-2 border-b border-app-border transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <Link href={route('profile.edit')} className="block text-gray-300 hover:text-white py-2 border-b border-gray-700">Profile</Link>
                            <Link href={route('logout')} method="post" as="button" className="block w-full text-left text-red-400 py-2">Log Out</Link>
                        </div>
                    </div>
                </div>

                {/* Page Header */}
                {header && (
                    <header className="bg-app-dark py-6 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-7xl mx-auto">
                            {header}
                        </div>
                    </header>
                )}

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
