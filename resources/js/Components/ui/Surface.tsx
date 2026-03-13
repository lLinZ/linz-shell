import * as React from "react"
import { cn } from "@/lib/utils"

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "primary" | "secondary" | "tertiary" | "flat" | "premium"
    size?: "none" | "sm" | "md" | "lg" | "xl"
    border?: boolean
    shadow?: "none" | "sm" | "md" | "lg" | "xl" | "2xl"
    rounding?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"
    glow?: boolean
    interactive?: boolean
}

const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
    ({ className, variant = "primary", size = "md", border = true, shadow = "md", rounding = "lg", glow = false, interactive = false, ...props }, ref) => {
        const variants = {
            primary: "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]",
            secondary: "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]",
            tertiary: "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]",
            flat: "bg-transparent",
            premium: "bg-[var(--glass-background)] dark:bg-[var(--color-bg-secondary)] backdrop-blur-2xl border-[var(--glass-border)]",
        }

        const sizes = {
            none: "p-0",
            sm: "p-2",
            md: "p-4",
            lg: "p-8",
            xl: "p-12 sm:p-16",
        }

        const shadows = {
            none: "shadow-none",
            sm: "shadow-sm",
            md: "shadow-md",
            lg: "shadow-lg",
            xl: "shadow-xl",
            "2xl": "shadow-2xl",
        }

        const roundings = {
            none: "rounded-none",
            sm: "rounded-sm",
            md: "rounded-md",
            lg: "rounded-lg",
            xl: "rounded-xl",
            "2xl": "rounded-2xl",
            "3xl": "rounded-[2.5rem] sm:rounded-[3rem]",
            full: "rounded-full",
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "relative transition-all duration-300",

                    variants[variant],
                    sizes[size],
                    shadows[shadow],
                    roundings[rounding],
                    border && "border border-[var(--color-border)]",
                    interactive && "hover:border-[var(--color-primary)]/30 hover:shadow-2xl hover:shadow-[var(--color-primary)]/10 transition-all duration-500",
                    glow && "shadow-[var(--color-primary)]/5",
                    className
                )}
                {...props}
            />
        )
    }
)

Surface.displayName = "Surface"

export { Surface }
