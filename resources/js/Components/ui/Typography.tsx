import * as React from "react"
import { cn } from "@/lib/utils"

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
    variant?: "h1" | "h2" | "h3" | "h4" | "p" | "small" | "muted" | "gradient"
    component?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div"
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
    ({ className, variant = "p", component, ...props }, ref) => {
        const variants = {
            h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
            h2: "scroll-m-20 text-3xl font-bold tracking-tight",
            h3: "scroll-m-20 text-2xl font-bold tracking-tight",
            h4: "scroll-m-20 text-xl font-bold tracking-tight",
            p: "leading-7",
            small: "text-sm font-semibold leading-none",
            muted: "text-sm text-[var(--color-text-muted)]",
            gradient: "text-4xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-br from-[var(--color-text-primary)] via-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent",
        }

        const Component = component || (variant.startsWith("h") ? (variant as any) : variant === "small" ? "small" : "p")

        return (
            <Component
                ref={ref}
                className={cn(
                    // ESTA ES LA REGLA MAESTRA:
                    // Por defecto, TODO texto agarra el color primario dinámico,
                    // a menos que sea la variante 'muted'.
                    variant !== "muted" && "text-[var(--color-text-primary)]",
                    variants[variant],
                    className
                )}
                {...props}
            />
        )
    }
)

Typography.displayName = "Typography"

export { Typography }