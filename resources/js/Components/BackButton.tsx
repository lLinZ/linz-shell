import { Link } from '@inertiajs/react';

interface BackButtonProps {
    href?: string;
    label?: string;
}

export default function BackButton({ href, label = 'Back' }: BackButtonProps) {
    const handleBack = () => {
        if (href) {
            return; // Link handles strict navigation
        }
        window.history.back();
    };

    if (href) {
        return (
            <Link
                href={href}
                className="inline-flex items-center px-4 py-2 bg-transparent dark:bg-app-card/30 border border-app-border rounded-md font-semibold text-xs text-app-text/70 dark:text-app-text/80 uppercase tracking-widest hover:border-app-accent hover:text-app-accent hover:bg-app-accent/5 focus:outline-none focus:ring-2 focus:ring-app-accent focus:ring-offset-2 dark:focus:ring-offset-app-background transition ease-in-out duration-150 mb-4"
            >
                &larr; {label}
            </Link>
        );
    }

    return (
        <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 bg-transparent dark:bg-app-card/30 border border-app-border rounded-md font-semibold text-xs text-app-text/70 dark:text-app-text/80 uppercase tracking-widest hover:border-app-accent hover:text-app-accent hover:bg-app-accent/5 focus:outline-none focus:ring-2 focus:ring-app-accent focus:ring-offset-2 dark:focus:ring-offset-app-background transition ease-in-out duration-150 mb-4"
        >
            &larr; {label}
        </button>
    );
}
