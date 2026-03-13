import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded-md border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-[var(--color-primary)] shadow-sm focus:ring-[var(--color-primary)]/40 focus:ring-offset-[var(--color-bg-primary)] transition-all ' +
                className
            }
        />
    );
}
