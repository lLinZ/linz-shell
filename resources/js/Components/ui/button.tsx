import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-50 active:scale-95 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] shadow-[var(--color-primary)]/20 hover:bg-[var(--color-primary-dark)]",
                destructive:
                    "bg-[var(--color-danger)] text-white shadow-[var(--color-danger)]/20 hover:opacity-90",
                outline:
                    "border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]",
                secondary:
                    "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]/80",
                ghost: "hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:text-[var(--color-primary)]",
                link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
                premium: "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-[var(--color-primary)]/30 hover:opacity-90",
            },
            size: {
                default: "h-11 px-6 py-2",
                sm: "h-9 px-4 text-xs",
                lg: "h-14 px-10 text-base",
                icon: "h-11 w-11",
                "icon-sm": "h-10 w-10",
                "icon-xs": "h-8 w-8",
                none: "",
            },
            rounding: {
                none: "rounded-none",
                sm: "rounded-sm",
                md: "rounded-md",
                lg: "rounded-lg",
                xl: "rounded-xl",
                "2xl": "rounded-2xl",
                "3xl": "rounded-3xl",
                full: "rounded-full",
            },
            shadow: {
                none: "shadow-none",
                sm: "shadow-sm",
                md: "shadow-md",
                lg: "shadow-lg",
                xl: "shadow-xl",
                "2xl": "shadow-2xl",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            rounding: "xl",
            shadow: "md",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    glow?: boolean
    animation?: "none" | "hover-lift" | "hover-scale" | "float-up"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, rounding, shadow, glow = false, animation = "hover-lift", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        const animationClasses = {
            none: "",
            "hover-lift": "hover:-translate-y-0.5",
            "hover-scale": "hover:scale-105",
            "float-up": "translate-y-4 group-hover:translate-y-0",
        }

        return (
            <Comp
                className={cn(
                    buttonVariants({ variant, size, rounding, shadow, className }),
                    glow && (variant === 'premium' || variant === 'default' ? "shadow-[var(--color-primary)]/50" : "shadow-[var(--color-border)]/50"),
                    animationClasses[animation]
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
