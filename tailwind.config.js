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
