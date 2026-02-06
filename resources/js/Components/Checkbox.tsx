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
                'rounded border-gray-600 text-app-accent shadow-sm focus:ring-app-accent dark:border-gray-700 dark:bg-app-background dark:focus:ring-app-accent dark:focus:ring-offset-gray-800 ' +
                className
            }
        />
    );
}
