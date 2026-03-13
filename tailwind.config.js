import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],
    safelist: [
        // Status pills & dots used dynamically in Orders CRM
        'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-emerald-500', 'bg-rose-500',
        'bg-blue-500/15', 'bg-yellow-500/15', 'bg-purple-500/15', 'bg-emerald-500/15', 'bg-rose-500/15',
        'border-blue-500/20', 'border-yellow-500/20', 'border-purple-500/20', 'border-emerald-500/20', 'border-rose-500/20',
        'text-blue-400', 'text-yellow-400', 'text-purple-400', 'text-emerald-400', 'text-rose-400',
    ],

    theme: {
        extend: {
            colors: {
                'app-dark': 'var(--color-bg-primary)',
                'app-card': 'var(--color-bg-tertiary)',
                'app-accent': 'var(--color-accent)',
                'app-accent-hover': 'var(--color-accent-hover)',
                'app-text': 'var(--color-text-primary)',
                'app-secondary': 'var(--color-bg-secondary)',
                'app-background': 'var(--color-bg-primary)',
                'app-border': 'var(--color-border)',
                'app-input-bg': 'var(--color-input-bg)',
                'app-input-border': 'var(--color-input-border)',
            },
        },
    },

    plugins: [forms],
};
