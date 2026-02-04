/**
 * Color utility functions for dynamic theming
 * Converts user avatar colors into subtle background variants
 */

interface RGB {
    r: number;
    g: number;
    b: number;
}

interface HSL {
    h: number;
    s: number;
    l: number;
}

/**
 * Convert HEX color to RGB
 */
function hexToRgb(hex: string): RGB | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): HSL {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): RGB {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/**
 * Generate very dark variant for dark mode backgrounds
 * @param color - HEX color string
 * @returns rgba string with low opacity
 */
export function generateDarkVariant(color: string): string {
    const rgb = hexToRgb(color);
    if (!rgb) return 'rgba(64, 64, 64, 0.25)'; // fallback

    // Use the color with very low opacity over dark background
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
}

/**
 * Generate very light variant for light mode backgrounds
 * @param color - HEX color string
 * @returns rgba string with very low opacity
 */
export function generateLightVariant(color: string): string {
    const rgb = hexToRgb(color);
    if (!rgb) return 'rgba(59, 130, 246, 0.1)'; // fallback

    // Use the color with extremely low opacity over white background
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
}

/**
 * Generate accent color for borders/rings
 * @param color - HEX color string
 * @param isDark - whether dark mode is active
 * @returns HEX color string
 */
export function generateAccentColor(color: string, isDark: boolean = false): string {
    const rgb = hexToRgb(color);
    if (!rgb) return isDark ? '#6b7280' : '#3b82f6'; // fallback

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    if (isDark) {
        // Make it darker and less saturated for dark mode
        hsl.l = Math.max(25, hsl.l - 20);
        hsl.s = Math.max(30, hsl.s - 10);
    } else {
        // Keep saturated for light mode
        hsl.s = Math.min(70, hsl.s + 10);
        hsl.l = Math.min(60, Math.max(40, hsl.l));
    }

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return `#${((1 << 24) + (newRgb.r << 16) + (newRgb.g << 8) + newRgb.b).toString(16).slice(1)}`;
}

/**
 * Generate text color for active state
 * @param color - HEX color string
 * @param isDark - whether dark mode is active
 * @returns HEX color string
 */
export function generateTextColor(color: string, isDark: boolean = false): string {
    const rgb = hexToRgb(color);
    if (!rgb) return isDark ? '#93c5fd' : '#1d4ed8'; // fallback

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    if (isDark) {
        // Lighter and more saturated for dark mode
        hsl.l = Math.min(75, hsl.l + 30);
        hsl.s = Math.min(80, hsl.s + 20);
    } else {
        // Darker and saturated for light mode
        hsl.l = Math.max(25, hsl.l - 25);
        hsl.s = Math.min(80, hsl.s + 10);
    }

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return `#${((1 << 24) + (newRgb.r << 16) + (newRgb.g << 8) + newRgb.b).toString(16).slice(1)}`;
}

/**
 * Get appropriate background variant based on current theme
 * @param color - HEX color string
 * @returns rgba string with opacity
 */
export function getBackgroundVariant(color: string): string {
    // Detect dark mode
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? generateDarkVariant(color) : generateLightVariant(color);
}

/**
 * Calculate contrast text color (white or black) for a given background color
 * @param bgColor - HEX background color
 * @returns HEX color string (white or black)
 */
export function calculateContrastText(bgColor: string): string {
    const rgb = hexToRgb(bgColor);
    if (!rgb) return '#FFFFFF';

    // Calculate relative luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

    // Return white for dark backgrounds, black for light backgrounds
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Adjust a color's HSL properties
 * @param color - HEX color string
 * @param adjustments - Object with h, s, l adjustments
 * @returns HEX color string
 */
function adjustColor(color: string, adjustments: { h?: number; s?: number; l?: number }): string {
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    if (adjustments.h !== undefined) hsl.h = (hsl.h + adjustments.h) % 360;
    if (adjustments.s !== undefined) hsl.s = Math.max(0, Math.min(100, hsl.s + adjustments.s));
    if (adjustments.l !== undefined) hsl.l = Math.max(0, Math.min(100, hsl.l + adjustments.l));

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return `#${((1 << 24) + (newRgb.r << 16) + (newRgb.g << 8) + newRgb.b).toString(16).slice(1)}`;
}

/**
 * Color Palette Interface
 */
export interface ColorPalette {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    primaryLighter: string;
    accent: string;
    accentHover: string;
    surface: string;
    surfaceHover: string;
    textOnPrimary: string;
    border: string;
    // Dark background variants for Material Design style
    bgPrimary: string;      // Main page background
    bgSecondary: string;    // Navbar, sidebar background
    bgTertiary: string;     // Card backgrounds
    // Semantic colors - fixed for universal recognition
    success: string;        // Green for success states
    successLight: string;   // Light green background
    warning: string;        // Yellow/Orange for warnings
    warningLight: string;   // Light yellow background
    danger: string;         // Red for errors/notifications
    dangerLight: string;    // Light red background
    info: string;           // Blue for information
    infoLight: string;      // Light blue background
    // Status colors - fixed for presence
    online: string;         // Green for online status
    offline: string;        // Gray for offline status
    // Interactive states based on user color
    hoverBg: string;        // Hover background
    activeBg: string;       // Active/selected background
    focusRing: string;      // Focus ring color
    // Text colors
    textPrimary: string;    // Primary text color
    textSecondary: string;  // Secondary text color
    textMuted: string;      // Muted/disabled text
}

/**
 * Generate a complete color palette from a base color
 * @param baseColor - HEX color string (user's avatar color)
 * @param isDark - whether dark mode is active
 * @returns ColorPalette object with all themed colors
 */
export function generateColorPalette(baseColor: string, isDark: boolean = false): ColorPalette {
    const rgb = hexToRgb(baseColor);
    if (!rgb) {
        // Fallback to blue palette (dark mode default)
        return {
            primary: '#3B82F6',
            primaryDark: '#2563EB',
            primaryLight: '#DBEAFE',
            primaryLighter: '#EFF6FF',
            accent: '#60A5FA',
            accentHover: '#3B82F6',
            surface: 'rgba(59, 130, 246, 0.1)',
            surfaceHover: 'rgba(59, 130, 246, 0.15)',
            textOnPrimary: '#FFFFFF',
            border: '#93C5FD',
            bgPrimary: '#0d0d0d',
            bgSecondary: '#1a1a1a',
            bgTertiary: '#2a2a2a',
            // Semantic colors
            success: '#10B981',
            successLight: 'rgba(16, 185, 129, 0.15)',
            warning: '#F59E0B',
            warningLight: 'rgba(245, 158, 11, 0.15)',
            danger: '#EF4444',
            dangerLight: 'rgba(239, 68, 68, 0.15)',
            info: '#3B82F6',
            infoLight: 'rgba(59, 130, 246, 0.15)',
            // Status colors
            online: '#10B981',
            offline: '#6B7280',
            // Interactive states
            hoverBg: 'rgba(59, 130, 246, 0.12)',
            activeBg: 'rgba(59, 130, 246, 0.2)',
            focusRing: '#60A5FA',
            // Text colors
            textPrimary: '#F9FAFB',
            textSecondary: '#D1D5DB',
            textMuted: '#9CA3AF',
        };
    }

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    if (isDark) {
        // Dark mode palette - Material Design inspired
        return {
            // Primary: Main brand color, slightly desaturated for dark mode
            primary: adjustColor(baseColor, { s: -10, l: 0 }),

            // Primary Dark: Darker version for hover states
            primaryDark: adjustColor(baseColor, { s: -5, l: -15 }),

            // Primary Light: Lighter version for subtle backgrounds
            primaryLight: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,

            // Primary Lighter: Very subtle background
            primaryLighter: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,

            // Accent: Brighter version for highlights
            accent: adjustColor(baseColor, { s: 10, l: 20 }),

            // Accent Hover: Slightly brighter on hover
            accentHover: adjustColor(baseColor, { s: 15, l: 25 }),

            // Surface: Very subtle tinted background
            surface: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,

            // Surface Hover: Slightly more visible on hover
            surfaceHover: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`,

            // Text on Primary: Calculated contrast color
            textOnPrimary: calculateContrastText(baseColor),

            // Border: Muted version for borders
            border: adjustColor(baseColor, { s: -20, l: 10 }),

            // Dark Backgrounds - Material Design style with GOOD CONTRAST
            // Much darker base, but cards stand out significantly
            bgPrimary: adjustColor(baseColor, { s: -40, l: -88 }),      // Darkest - main background (almost black)
            bgSecondary: adjustColor(baseColor, { s: -35, l: -82 }),    // Medium dark - navbar
            bgTertiary: adjustColor(baseColor, { s: -30, l: -72 }),     // Lighter - cards (visible!)

            // Semantic colors - Fixed for universal recognition (dark mode)
            success: '#10B981',         // Green-500
            successLight: 'rgba(16, 185, 129, 0.15)',
            warning: '#F59E0B',         // Amber-500
            warningLight: 'rgba(245, 158, 11, 0.15)',
            danger: '#EF4444',          // Red-500
            dangerLight: 'rgba(239, 68, 68, 0.15)',
            info: '#3B82F6',            // Blue-500
            infoLight: 'rgba(59, 130, 246, 0.15)',

            // Status colors - Fixed (dark mode)
            online: '#10B981',          // Green-500
            offline: '#6B7280',         // Gray-500

            // Interactive states based on user color
            hoverBg: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`,
            activeBg: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
            focusRing: adjustColor(baseColor, { s: 10, l: 15 }),

            // Text colors (dark mode)
            textPrimary: '#F9FAFB',     // Gray-50
            textSecondary: '#D1D5DB',   // Gray-300
            textMuted: '#9CA3AF',       // Gray-400
        };
    } else {
        // Light mode palette
        return {
            // Primary: Main brand color, more saturated
            primary: adjustColor(baseColor, { s: 10, l: 0 }),

            // Primary Dark: Darker version for hover states
            primaryDark: adjustColor(baseColor, { s: 5, l: -10 }),

            // Primary Light: Very light background
            primaryLight: adjustColor(baseColor, { s: -30, l: 40 }),

            // Primary Lighter: Super light background
            primaryLighter: adjustColor(baseColor, { s: -40, l: 45 }),

            // Accent: Vibrant version for highlights
            accent: adjustColor(baseColor, { s: 15, l: -5 }),

            // Accent Hover: Darker on hover
            accentHover: adjustColor(baseColor, { s: 20, l: -10 }),

            // Surface: Very subtle tinted background
            surface: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`,

            // Surface Hover: Slightly more visible on hover
            surfaceHover: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,

            // Text on Primary: Calculated contrast color
            textOnPrimary: calculateContrastText(baseColor),

            // Border: Soft border color
            border: adjustColor(baseColor, { s: -10, l: 25 }),

            // Light Backgrounds
            bgPrimary: '#F9FAFB',        // Light gray
            bgSecondary: '#FFFFFF',      // White
            bgTertiary: '#F3F4F6',       // Slightly darker

            // Semantic colors - Fixed for universal recognition (light mode)
            success: '#059669',         // Green-600
            successLight: 'rgba(5, 150, 105, 0.1)',
            warning: '#D97706',         // Amber-600
            warningLight: 'rgba(217, 119, 6, 0.1)',
            danger: '#DC2626',          // Red-600
            dangerLight: 'rgba(220, 38, 38, 0.1)',
            info: '#2563EB',            // Blue-600
            infoLight: 'rgba(37, 99, 235, 0.1)',

            // Status colors - Fixed (light mode)
            online: '#059669',          // Green-600
            offline: '#6B7280',         // Gray-500

            // Interactive states based on user color
            hoverBg: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`,
            activeBg: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
            focusRing: adjustColor(baseColor, { s: 15, l: -5 }),

            // Text colors (light mode)
            textPrimary: '#111827',     // Gray-900
            textSecondary: '#4B5563',   // Gray-600
            textMuted: '#9CA3AF',       // Gray-400
        };
    }
}

/**
 * Apply color palette to CSS variables
 * @param palette - ColorPalette object
 */
export function applyPaletteToCSSVariables(palette: ColorPalette): void {
    const root = document.documentElement;

    // Primary colors
    root.style.setProperty('--color-primary', palette.primary);
    root.style.setProperty('--color-primary-dark', palette.primaryDark);
    root.style.setProperty('--color-primary-light', palette.primaryLight);
    root.style.setProperty('--color-primary-lighter', palette.primaryLighter);
    root.style.setProperty('--color-accent', palette.accent);
    root.style.setProperty('--color-accent-hover', palette.accentHover);

    // Surface colors
    root.style.setProperty('--color-surface', palette.surface);
    root.style.setProperty('--color-surface-hover', palette.surfaceHover);

    // Text colors
    root.style.setProperty('--color-text-on-primary', palette.textOnPrimary);
    root.style.setProperty('--color-text-primary', palette.textPrimary);
    root.style.setProperty('--color-text-secondary', palette.textSecondary);
    root.style.setProperty('--color-text-muted', palette.textMuted);

    // Border
    root.style.setProperty('--color-border', palette.border);

    // Backgrounds
    root.style.setProperty('--color-bg-primary', palette.bgPrimary);
    root.style.setProperty('--color-bg-secondary', palette.bgSecondary);
    root.style.setProperty('--color-bg-tertiary', palette.bgTertiary);

    // Semantic colors
    root.style.setProperty('--color-success', palette.success);
    root.style.setProperty('--color-success-light', palette.successLight);
    root.style.setProperty('--color-warning', palette.warning);
    root.style.setProperty('--color-warning-light', palette.warningLight);
    root.style.setProperty('--color-danger', palette.danger);
    root.style.setProperty('--color-danger-light', palette.dangerLight);
    root.style.setProperty('--color-info', palette.info);
    root.style.setProperty('--color-info-light', palette.infoLight);

    // Status colors
    root.style.setProperty('--color-online', palette.online);
    root.style.setProperty('--color-offline', palette.offline);

    // Interactive states
    root.style.setProperty('--color-hover-bg', palette.hoverBg);
    root.style.setProperty('--color-active-bg', palette.activeBg);
    root.style.setProperty('--color-focus-ring', palette.focusRing);
}
