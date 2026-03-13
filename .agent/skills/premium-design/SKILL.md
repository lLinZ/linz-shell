---
name: premium_design
description: Standardized system for implementing the "Linz Shell Premium" design aesthetic.
---

# Linz Shell Premium Design System

This skill defines the visual language and component Implementation patterns for the Linz Shell project. Every page in the administration area must strictly adhere to these rules.

## 1. Core Principles
- **Vibrant Primary**: Use `#10b981` (Linz Green) for actions and branding.
- **Glassmorphism**: Use `backdrop-blur` and translucent backgrounds for overlays and sticky headers.
- **Depth & Surface**: Use `Surface` variants (`primary`, `secondary`, `tertiary`) instead of generic `div` with custom colors.
- **Micro-Animations**: Use `transition-all duration-300` on every interactive element.
- **Semantic Text**: Use the `<Typography>` component with appropriate variants (`h1`, `h2`, `h3`, `small`, `muted`). Never use raw `span` or `p`.

## 2. Color Tokens (CSS Variables)
- `--color-primary`: Main branding color.
- `--color-bg-primary`: Deep background.
- `--color-bg-secondary`: Elevated surface (cards).
- `--color-bg-tertiary`: Soft highlights/hovers.
- `--color-text-primary`: Pure white/near-black dynamic text.
- `--color-danger`: Vibrand red for destructive actions.

## 3. Implementation Patterns

### Breadcrumbs & Header
Always wrap page titles in a `div` with `flex justify-between` within the `header` prop of `AuthenticatedLayout`.

### Data Tables
Tables should be contained within a `Surface variant="primary"` with `p-0` and `overflow-hidden`.
- Header: `bg-[var(--color-bg-secondary)]/50` + `border-b`.
- Rows: `hover:bg-[var(--color-bg-tertiary)]/30`.

### Modals
Modals must use the `Surface` aesthetic:
- Padding: `p-6`.
- Headings: `Typography variant="h3"`.
- Buttons: `flex justify-end gap-3`.

## 5. Theme Adaptability & Accessibility

To maintain the premium aesthetic across both Light and Dark modes, follow these strict rules:

### Never Use Hardcoded Tints
Avoid using Tailwind classes like `border-white/10`, `bg-white/5`, or `text-black/50`. These break in opposite themes.
- **Backgrounds**: Use `bg-[var(--color-bg-primary)]`, `bg-[var(--color-bg-secondary)]`, or `bg-[var(--color-bg-tertiary)]`.
- **Borders**: Use `border-[var(--color-border)]`.
- **Text**: Use `<Typography>` variants or `text-[var(--color-text-primary)]`, etc.

### Glassmorphism & Effects
- **Dark Mode**: High transparency (`0.8`), subtle white borders (`0.05`).
- **Light Mode**: Increased opacity (`0.7`) and pronounced light borders (`0.3`) to ensure visibility against bright backgrounds.
- Always use `backdrop-blur-xl` or higher for a true glass effect.

### Contrast Standards
- **Muted Text**: Ensure `var(--color-text-muted)` is at least `#64748b` in light mode for accessibility.
- **Surfaces**: Use `bg-[var(--color-bg-tertiary)]/50` for lists and table headers to separate them from the primary background.

## 6. Implementation Checklist
- [ ] Uses `<Surface>`, `<Typography>`, and `<Button>` primitives.
- [ ] No hardcoded opacity/tint classes (`white/10`, `black/5`).
- [ ] Borders use `var(--color-border)`.
- [ ] Hover states use `var(--color-bg-tertiary)`.
- [ ] Verified legibility in both light and dark modes.
- [ ] Responsive layouts using `md:`, `lg:` prefixes.
