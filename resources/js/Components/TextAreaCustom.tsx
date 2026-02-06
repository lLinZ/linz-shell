import { forwardRef, TextareaHTMLAttributes, useEffect, useRef } from 'react';

export default forwardRef(function TextAreaCustom(
    { className = '', isFocused = false, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { isFocused?: boolean },
    ref
) {
    const input = ref ? (ref as any) : useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isFocused) {
            input.current?.focus();
        }
    }, []);

    return (
        <textarea
            {...props}
            className={
                'rounded-md border-app-input-border shadow-sm focus:border-app-accent focus:ring-app-accent bg-app-input-bg text-app-text transition-colors ' +
                className
            }
            ref={input}
        />
    );
});
