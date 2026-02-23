import * as React from "react"
import { Typography } from "@/Components/ui/Typography"
import { cn } from "@/lib/utils"

interface SidebarSectionProps {
    title: string
    count?: number
    titleColor?: string
    children: React.ReactNode
}

export const SidebarSection = ({ title, count, titleColor, children }: SidebarSectionProps) => {
    // If no children are passed, don't render the section
    if (React.Children.count(children) === 0) return null

    return (
        <div className="mb-2">
            <Typography
                variant="small"
                className={cn(
                    "px-4 py-2 text-gray-400 uppercase font-semibold tracking-wider text-[10px]",
                    titleColor
                )}
            >
                {title} {count !== undefined && `(${count})`}
            </Typography>
            <div className="flex flex-col space-y-0.5 p-2">
                {children}
            </div>
        </div>
    )
}
