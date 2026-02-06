import { forwardRef, InputHTMLAttributes, useEffect, useRef } from 'react';

export default forwardRef(function TextFieldCustom(
    { type = 'text', className = '', isFocused = false, ...props }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
    ref
) {
    const input = ref ? (ref as any) : useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isFocused) {
            input.current?.focus();
        }
    }, []);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-md border-app-input-border shadow-sm focus:border-app-accent focus:ring-app-accent bg-app-input-bg text-app-text transition-colors ' +
                className
            }
            ref={input}
        />
    );
});
