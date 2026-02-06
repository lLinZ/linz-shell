import { ButtonHTMLAttributes } from 'react';

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded-md border border-app-input-border bg-app-input-bg px-4 py-2 text-xs font-semibold uppercase tracking-widest text-app-text shadow-sm transition duration-150 ease-in-out hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-app-accent focus:ring-offset-2 disabled:opacity-25 dark:border-app-input-border dark:bg-app-input-bg dark:text-app-text dark:hover:bg-white/10 dark:focus:ring-offset-gray-800 ${disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
