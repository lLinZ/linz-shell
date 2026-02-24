import * as React from "react"
import { cn } from "@/lib/utils"
import Avatar from "@/Components/ui/Avatar"
import { Badge } from "@/Components/ui/badge"
import { Typography } from "@/Components/ui/Typography"
import { Button } from "@/Components/ui/button"

interface SidebarItemProps {
    user: {
        id: number | string
        name: string
        avatar_color?: string
        conversation_id?: number | null
        unread_count?: number
        is_group?: boolean
        role?: string
    }
    isActive?: boolean
    status?: "online" | "offline" | null
    onClick: () => void
}

export const SidebarItem = ({ user, isActive, status, onClick }: SidebarItemProps) => {
    return (
        <Button
            variant="ghost"
            size="none"
            onClick={onClick}
            className={cn(
                "flex items-center p-3 rounded-lg transition-all duration-200 text-left theme-hover w-full h-auto justify-start",
                isActive && "theme-active relative overflow-hidden ring-1 ring-[var(--color-primary)] bg-[var(--color-active-bg)] border-l-4 border-[var(--color-primary)] rounded-l-none"
            )}
        >
            <Avatar
                name={user.name}
                color={user.avatar_color || 'var(--color-primary)'}
                size="md"
                status={status}
            />
            <div className="ml-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <Typography variant="small" className="font-semibold truncate">
                            {user.name}
                        </Typography>
                        {user.role === 'client' && (
                            <Badge variant="outline" className="border-[var(--color-primary)] text-[var(--color-primary)] text-[9px] py-0 px-1 h-4 flex items-center shrink-0">
                                Cliente
                            </Badge>
                        )}
                    </div>
                    {(user.unread_count || 0) > 0 && (
                        <Badge variant="danger">
                            {user.unread_count}
                        </Badge>
                    )}
                </div>
                <Typography variant="muted" className={cn(
                    "text-xs truncate text-left",
                    status === "online" && "text-green-600 dark:text-green-400"
                )}>
                    {user.is_group ? "Grupo" : status === "online" ? "En línea" : "Desconectado"}
                </Typography>
            </div>
        </Button>
    )
}
