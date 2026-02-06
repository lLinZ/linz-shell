import { ButtonHTMLAttributes } from 'react';

export default function ButtonCustom({
    className = '',
    disabled,
    variant = 'primary',
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }) {

    const baseClasses = "inline-flex items-center rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 shadow-md";

    const variants = {
        primary: "border-transparent bg-app-accent text-black hover:bg-app-accent-hover focus:ring-app-accent",
        secondary: "border border-app-input-border bg-app-input-bg text-app-text hover:bg-white/5 focus:ring-app-accent",
        danger: "border-transparent bg-red-600 text-white hover:bg-red-500 focus:ring-red-500"
    };

    return (
        <button
            {...props}
            className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-25' : ''} ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
