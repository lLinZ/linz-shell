import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ease-in-out duration-150 ${disabled && 'opacity-25'
                } ` + className
            }
            style={{
                backgroundColor: disabled ? undefined : 'var(--color-primary)',
                color: 'var(--color-text-on-primary)',
            }}
            onMouseEnter={(e) => {
                if (!disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                }
            }}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
