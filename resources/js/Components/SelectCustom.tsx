import { forwardRef, SelectHTMLAttributes, useEffect, useRef } from 'react';

export default forwardRef(function SelectCustom(
    { className = '', isFocused = false, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { isFocused?: boolean },
    ref
) {
    const input = ref ? (ref as any) : useRef<HTMLSelectElement>(null);

    useEffect(() => {
        if (isFocused) {
            input.current?.focus();
        }
    }, []);

    return (
        <select
            {...props}
            className={
                'rounded-md border-app-input-border shadow-sm focus:border-app-accent focus:ring-app-accent bg-app-input-bg text-app-text transition-colors ' +
                className
            }
            ref={input}
        >
            {children}
        </select>
    );
});
