import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Button, buttonVariants } from '@/Components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/Stores/useCartStore';
import { cn } from '@/lib/utils';
import { Typography } from '@/Components/ui/Typography';

export default function Navbar() {
    const { toggleCart, getItemCount } = useCartStore();
    const itemCount = getItemCount();
    const { navigation, branding, modules } = usePage<any>().props;

    const navbarLinks = (navigation?.links || [
        { label: 'Características', url: '#features' },
        { label: 'Precios', url: '#pricing' },
        { label: 'Tienda', url: '/shop', module: 'shopping-cart' },
    ]).filter((link: any) => !link.module || modules?.find((m: any) => m.slug === link.module)?.is_enabled);

    return (
        <nav className="sticky top-0 z-[100] bg-[var(--color-bg-primary)]/80 backdrop-blur-md border-b border-[var(--color-border)] py-4 px-6 md:px-12 flex justify-between items-center">
            <Link href={navigation?.logo_url || "/"} className="flex items-center gap-3">
                {branding?.site_logo ? (
                    <img src={branding.site_logo} alt={branding.site_name} className="h-10 object-contain" />
                ) : (
                    <ApplicationLogo className="w-10 h-10 text-[var(--color-primary)]" />
                )}
                <Typography variant="h4" className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
                    {branding?.site_name || navigation?.logo_text || 'Linz Shell'}
                </Typography>
            </Link>

            <div className="hidden md:flex gap-8 text-sm font-medium">
                {navbarLinks.map((link: any, idx: number) => (
                    <Link
                        key={idx}
                        href={link.url}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                        <Typography variant="small" className="font-medium">{link.label}</Typography>
                    </Link>
                ))}
            </div>

            <div className="flex gap-4 items-center">
                {/* Cart Trigger - Only show if shopping-cart module is enabled */}
                {(modules?.find((m: any) => m.slug === 'shopping-cart')?.is_enabled ?? true) && (
                    <Button
                        variant="ghost"
                        size="none"
                        className="relative p-2"
                        onClick={() => toggleCart(true)}
                    >
                        <ShoppingCart className="w-6 h-6" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[var(--color-primary)] text-[var(--color-text-on-primary)] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[var(--color-bg-primary)]">
                                {itemCount}
                            </span>
                        )}
                    </Button>
                )}

                {usePage().props.auth.user ? (
                    <div className="flex items-center gap-2">
                        <Link
                            href={usePage().props.auth.user.role !== 'client' ? route('dashboard') : route('profile.edit')}
                            className={buttonVariants({ variant: "ghost", size: "sm" })}
                        >
                            {usePage().props.auth.user.role !== 'client' ? 'Dashboard' : 'Mi Perfil'}
                        </Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
                        >
                            Salir
                        </Link>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link href={route('login')} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                            Entrar
                        </Link>
                        <Link href={route('register')} className={buttonVariants({ size: "sm" })}>
                            Registro
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
