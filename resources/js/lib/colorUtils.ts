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

    // Allow setting absolute values if the adjustment is very specific (hacky way: if < -100 treat as set? No, let's just clamp)
    // Actually, for background generation, we want a specific look. 
    // Let's refine the logic: if we provide a 'set' property in adjustments used internally? No, we can just rewrite the function or use a new one.
    // For now, let's just trust the relative math.
    // To get a very dark color (L~5) from ANY color:
    // If L is 50, L-45 = 5. If L is 90, L-85 = 5.
    // Instead of relative, let's create a helper 'generateTint' or just implement set behavior?

    // Modified logic: If adjustment puts it out of bounds, clamp it.
    // BUT, for consistent backgrounds, we really want to SET the Lightness to 5-10%, not subtract.

    if (adjustments.s !== undefined) hsl.s = Math.max(0, Math.min(100, hsl.s + adjustments.s));

    // Basic clamping
    if (adjustments.l !== undefined) {
        // If we want to force it dark, we might need a different approach.
        // Let's assume the input calls will use large negative numbers to force it down.
        hsl.l = Math.max(0, Math.min(100, hsl.l + adjustments.l));
    }

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
    // Input colors
    inputBg: string;        // Input background
    inputBorder: string;    // Input border
}

/**
 * Generate a complete color palette from a base color
 * @param baseColor - HEX color string (user's avatar color)
 * @param isDark - whether dark mode is active
 * @returns ColorPalette object with all themed colors
 */
/**
 * Generate a dark background tinted with the base color
 * @param color - HEX color string
 * @param lightness - Target lightness percentage (0-100)
 * @returns HEX color string
 */
function generateTintedBackground(color: string, lightness: number): string {
    const rgb = hexToRgb(color);
    // Standard fallback to black if invalid color
    if (!rgb) return '#101010';

    // Convert to HSL
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Force specific lightness and low saturation for a subtle background
    hsl.l = lightness;
    hsl.s = Math.min(hsl.s, 40); // Increased saturation cap for more perceptible tint

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return `#${((1 << 24) + (newRgb.r << 16) + (newRgb.g << 8) + newRgb.b).toString(16).slice(1)}`;
}

/**
 * Generate a complete color palette from a base color
 * @param baseColor - HEX color string (user's avatar color)
 * @param isDark - whether dark mode is active
 * @returns ColorPalette object with all themed colors
 */
export function generateColorPalette(baseColor: string, isDark: boolean = false): ColorPalette {
    const rgb = hexToRgb(baseColor);

    // Default blue if hex is invalid
    const validRgb = rgb || { r: 59, g: 130, b: 246 };

    if (isDark) {
        // DARK MODE - High quality "Anthracite" foundation
        return {
            primary: baseColor,
            primaryDark: adjustColor(baseColor, { l: -10 }),
            primaryLight: `rgba(${validRgb.r}, ${validRgb.g}, ${validRgb.b}, 0.25)`,
            primaryLighter: `rgba(${validRgb.r}, ${validRgb.g}, ${validRgb.b}, 0.15)`,
            accent: baseColor,
            accentHover: adjustColor(baseColor, { l: 5 }),
            surface: `rgba(${validRgb.r}, ${validRgb.g}, ${validRgb.b}, 0.1)`,
            surfaceHover: `rgba(${validRgb.r}, ${validRgb.g}, ${validRgb.b}, 0.18)`,
            textOnPrimary: calculateContrastText(baseColor),

            // BORDERS: Dynamic tinted borders
            border: generateTintedBackground(baseColor, 12),

            // BACKGROUNDS: Dynamic very dark tint of the primary color
            bgPrimary: generateTintedBackground(baseColor, 3),      // Deep tinted bg
            bgSecondary: generateTintedBackground(baseColor, 5),    // Siderbar/Nav
            bgTertiary: generateTintedBackground(baseColor, 8),     // Card surface

            success: '#10B981',
            successLight: 'rgba(16, 185, 129, 0.15)',
            warning: '#F59E0B',
            warningLight: 'rgba(245, 158, 11, 0.15)',
            danger: '#EF4444',
            dangerLight: 'rgba(239, 68, 68, 0.15)',
            info: '#3B82F6',
            infoLight: adjustColor(baseColor, { s: -10, l: -10 }), // Adapted info light
            online: '#10B981',
            offline: '#6B7280',

            hoverBg: `rgba(${validRgb.r}, ${validRgb.g}, ${validRgb.b}, 0.12)`,
            activeBg: `rgba(${validRgb.r}, ${validRgb.g}, ${validRgb.b}, 0.22)`,
            focusRing: `rgba(${validRgb.r}, ${validRgb.g}, ${validRgb.b}, 0.5)`,

            textPrimary: '#F9FAFB',
            textSecondary: '#D1D5DB', // Gray 300 instead of 400
            textMuted: '#9CA3AF',     // Gray 400 instead of 500

            // INPUTS
            inputBg: generateTintedBackground(baseColor, 6),
            inputBorder: generateTintedBackground(baseColor, 15),
        };
    } else {
        // LIGHT MODE - Clean, premium "Soft White" foundation
        return {
            primary: baseColor,
            primaryDark: adjustColor(baseColor, { l: -10 }),
            primaryLight: adjustColor(baseColor, { s: -30, l: 40 }),
            primaryLighter: adjustColor(baseColor, { s: -40, l: 45 }),
            accent: baseColor,
            accentHover: adjustColor(baseColor, { l: -5 }),
            surface: `rgba(${validRgb.r}, ${validRgb.g}, ${validRgb.b}, 0.05)`,
            surfaceHover: `rgba(${validRgb.r}, ${validRgb.g}, ${validRgb.b}, 0.1)`,
            textOnPrimary: calculateContrastText(baseColor),

            // BORDERS: Clean neutral gray
            border: '#E5E7EB',

            // BACKGROUNDS: Crisp and clean
            bgPrimary: '#F8F9FA',      // Very light gray
            bgSecondary: '#FFFFFF',    // Pure white
            bgTertiary: '#F1F3F5',     // Light surface

            success: '#059669',
            successLight: 'rgba(5, 150, 105, 0.1)',
            warning: '#D97706',
            warningLight: 'rgba(217, 119, 6, 0.1)',
            danger: '#DC2626',
            dangerLight: 'rgba(220, 38, 38, 0.1)',
            info: '#2563EB',
            infoLight: 'rgba(37, 99, 235, 0.1)',
            online: '#059669',
            offline: '#6B7280',

            hoverBg: `rgba(${validRgb.r}, ${validRgb.g}, ${validRgb.b}, 0.08)`,
            activeBg: `rgba(${validRgb.r}, ${validRgb.g}, ${validRgb.b}, 0.15)`,
            focusRing: `rgba(${validRgb.r}, ${validRgb.g}, ${validRgb.b}, 0.4)`,

            textPrimary: '#111827',
            textSecondary: '#374151',
            textMuted: '#6B7280',

            // INPUTS (Light Mode)
            inputBg: '#FFFFFF',
            inputBorder: '#D1D5DB',
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

    // Inputs
    root.style.setProperty('--color-input-bg', palette.inputBg);
    root.style.setProperty('--color-input-border', palette.inputBorder);
}
