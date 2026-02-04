import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-[var(--color-primary)] text-[var(--color-text-on-primary)] shadow hover:bg-[var(--color-primary-dark)]",
                secondary:
                    "border-transparent bg-[var(--color-surface)] text-gray-900 dark:text-gray-100 hover:bg-[var(--color-surface-hover)]",
                success:
                    "border-transparent bg-green-500 text-white shadow hover:bg-green-600",
                warning:
                    "border-transparent bg-amber-500 text-white shadow hover:bg-amber-600",
                danger:
                    "border-transparent bg-red-500 text-white shadow hover:bg-red-600",
                info:
                    "border-transparent bg-blue-500 text-white shadow hover:bg-blue-600",
                outline: "text-gray-950 dark:text-gray-50 border-[var(--color-border)]",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
