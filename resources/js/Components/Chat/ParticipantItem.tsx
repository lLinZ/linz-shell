import * as React from "react"
import Avatar from "@/Components/ui/Avatar"
import { Typography } from "@/Components/ui/Typography"
import { Button } from "@/Components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ParticipantItemProps {
    user: any
    isOnline: boolean
    canRemove: boolean
    onRemove: (userId: number) => void
}

export const ParticipantItem = ({ user, isOnline, canRemove, onRemove }: ParticipantItemProps) => {
    return (
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] group transition-colors">
            <div className="flex items-center space-x-3">
                <Avatar
                    name={user.name}
                    color={user.avatar_color}
                    size="md"
                    status={isOnline ? 'online' : 'offline'}
                />
                <div className="flex flex-col min-w-0">
                    <Typography variant="small" className="font-semibold truncate text-[var(--color-text-primary)]">
                        {user.name}
                    </Typography>
                    <Typography variant="muted" className="text-xs truncate text-[var(--color-text-secondary)]">
                        {user.email}
                    </Typography>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                {canRemove && (
                    <Button
                        variant="ghost"
                        size="none"
                        onClick={() => onRemove(user.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                        title="Eliminar usuario"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
