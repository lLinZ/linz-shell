import * as React from "react"
import { Typography } from "@/Components/ui/Typography"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface SidebarSectionProps {
    title: string
    count?: number
    titleColor?: string
    children: React.ReactNode
    defaultOpen?: boolean
}

export const SidebarSection = ({ title, count, titleColor, children, defaultOpen = true }: SidebarSectionProps) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen)

    // If no children are passed, don't render the section
    if (React.Children.count(children) === 0) return null

    return (
        <div className="mb-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-[var(--color-surface-hover)]/30 transition-colors group"
            >
                <Typography
                    variant="small"
                    className={cn(
                        "text-gray-400 uppercase font-semibold tracking-wider text-[10px] flex items-center gap-2",
                        titleColor
                    )}
                >
                    {title} {count !== undefined && `(${count})`}
                </Typography>
                <ChevronDown className={cn(
                    "w-3 h-3 text-gray-400 transition-transform duration-200",
                    !isOpen && "-rotate-90"
                )} />
            </button>
            {isOpen && (
                <div className="flex flex-col space-y-0.5 p-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    {children}
                </div>
            )}
        </div>
    )
}
