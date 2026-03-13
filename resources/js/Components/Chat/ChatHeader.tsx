import * as React from "react"
import { useState } from "react"
import { Pencil, Check, X, Users, ChevronLeft } from "lucide-react"
import { Typography } from "@/Components/ui/Typography"
import { Surface } from "@/Components/ui/Surface"
import { Input } from "@/Components/ui/input"
import { Button } from "@/Components/ui/button"
import { cn } from "@/lib/utils"
import axios from "axios"
import { toast } from "@/Stores/useToastStore"

interface ChatHeaderProps {
    conversation: any
    currentUser: any
    onUpdate?: (conversation: any) => void
    onShowParticipants: () => void
    onBack?: () => void
}

export const ChatHeader = ({ conversation, currentUser, onUpdate, onShowParticipants, onBack }: ChatHeaderProps) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);

    const startEditing = () => {
        setEditName(conversation.name);
        setIsEditingName(true);
    };

    const saveName = async () => {
        if (!editName.trim() || editName === conversation.name) {
            setIsEditingName(false);
            return;
        }

        setIsSavingName(true);
        try {
            await axios.patch(`/chat/${conversation.id}/name`, { name: editName });
            if (onUpdate) onUpdate({ ...conversation, name: editName });
            setIsEditingName(false);
        } catch (error) {
            console.error("Failed to update name:", error);
            toast.error("Error al actualizar", "No se pudo cambiar el nombre del chat.");
        } finally {
            setIsSavingName(false);
        }
    };

    return (
        <Surface variant="primary" size="none" shadow="sm" border={false} className="h-16 w-full flex-shrink-0 border-b flex items-center justify-between px-4 md:px-6 z-10 border-[var(--color-border)]">
            <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                {onBack && (
                    <Button
                        variant="ghost"
                        size="none"
                        onClick={onBack}
                        className="md:hidden p-2 -ml-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                )}

                {isEditingName ? (
                    <div className="flex items-center space-x-2 w-full max-w-sm">
                        <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 py-1 h-8"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') saveName();
                                if (e.key === 'Escape') setIsEditingName(false);
                            }}
                        />
                        <Button
                            variant="ghost"
                            size="none"
                            onClick={saveName}
                            disabled={isSavingName}
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                        >
                            <Check className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="none"
                            onClick={() => setIsEditingName(false)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2 group min-w-0">
                        <Typography variant="h4" component="h3" className="truncate m-0 text-lg md:text-xl">
                            {conversation.name}
                        </Typography>
                        {!conversation.is_private && currentUser.role === 'admin' && (
                            <Button
                                variant="ghost"
                                size="none"
                                onClick={startEditing}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                                title="Editar nombre"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <Button
                variant="ghost"
                size="none"
                onClick={onShowParticipants}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors ml-2 flex-shrink-0"
            >
                <Users className="w-5 h-5" />
            </Button>
        </Surface>
    );
};
