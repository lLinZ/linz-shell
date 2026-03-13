import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { generateColorPalette, applyPaletteToCSSVariables } from '@/lib/colorUtils';

export default function ThemeManager() {
    const { auth, settings } = usePage<any>().props;
    const user = auth?.user;

    useEffect(() => {
        // More robust parsing for settings values
        const defaultColor = settings?.default_primary_color || settings?.primary_color || '#3B82F6';
        const rawDarkMode = settings?.default_dark_mode;
        const defaultDarkMode = rawDarkMode === 'true' || rawDarkMode === '1' || rawDarkMode === true || rawDarkMode === 1;

        const primaryColor = user?.avatar_color || defaultColor;
        const isDarkMode = user ? (user.dark_mode === true || user.dark_mode === 1) : defaultDarkMode;

        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        const palette = generateColorPalette(primaryColor, isDarkMode);
        applyPaletteToCSSVariables(palette);
    }, [user?.avatar_color, user?.dark_mode, settings?.default_primary_color, settings?.default_dark_mode]);

    return null;
}
