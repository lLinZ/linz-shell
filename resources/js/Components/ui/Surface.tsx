import * as React from "react"
import { cn } from "@/lib/utils"

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "primary" | "secondary" | "tertiary" | "flat"
    size?: "none" | "sm" | "md" | "lg"
    border?: boolean
    shadow?: "none" | "sm" | "md" | "lg"
    rounding?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"
}

const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
    ({ className, variant = "primary", size = "md", border = true, shadow = "md", rounding = "lg", ...props }, ref) => {
        const variants = {
            primary: "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]",
            secondary: "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]",
            tertiary: "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]",
            flat: "bg-transparent",
        }

        const sizes = {
            none: "p-0",
            sm: "p-2",
            md: "p-4",
            lg: "p-6",
        }

        const shadows = {
            none: "shadow-none",
            sm: "shadow-sm",
            md: "shadow-md",
            lg: "shadow-lg",
        }

        const roundings = {
            none: "rounded-none",
            sm: "rounded-sm",
            md: "rounded-md",
            lg: "rounded-lg",
            xl: "rounded-xl",
            "2xl": "rounded-2xl",
            "3xl": "rounded-3xl",
            full: "rounded-full",
        }

        return (
            <div
                ref={ref}
                className={cn(
                    variants[variant],
                    sizes[size],
                    shadows[shadow],
                    roundings[rounding],
                    border && "border border-[var(--color-border)]",
                    className
                )}
                {...props}
            />
        )
    }
)

Surface.displayName = "Surface"

export { Surface }
