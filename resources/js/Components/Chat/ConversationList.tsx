import { cn } from "@/lib/utils";
import { User } from "@/types";
import { generateDarkVariant, generateLightVariant, generateAccentColor, generateTextColor, getBackgroundVariant } from '@/lib/colorUtils';
import Avatar from "@/Components/ui/Avatar";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Typography } from "@/Components/ui/Typography";

interface Conversation {
    id: number;
    name: string;
    is_private: boolean;
    active?: boolean;
    avatar_color?: string; // Optional prop for demo
    unread_count?: number;
    other_user_id?: number;
}

interface ConversationListProps {
    conversations: Conversation[];
    activeId?: number;
    onSelect: (id: number) => void;
    onlineUserIds: number[];
}

export default function ConversationList({ conversations, activeId, onSelect, onlineUserIds }: ConversationListProps) {
    return (
        <div className="flex flex-col space-y-1 p-2 h-full overflow-y-auto">
            {conversations.map((conv) => {
                // Determine online status
                // For private chats, check if other_user_id is in onlineUserIds
                // For group chats, we could potentially check if *any* user is online, or just hide it.
                // Currently, let's only show for private chats or if we had a way to know group presence (complex).
                const isOnline = conv.is_private && conv.other_user_id && onlineUserIds.includes(conv.other_user_id);

                return (
                    <Button
                        key={conv.id}
                        variant="ghost"
                        size="none"
                        onClick={() => onSelect(conv.id)}
                        className={cn(
                            "flex items-center p-3 rounded-lg transition-all duration-200 text-left theme-hover h-auto justify-start",
                            activeId === conv.id
                                ? "theme-active relative overflow-hidden"
                                : ""
                        )}
                        style={activeId === conv.id ? {
                            backgroundColor: `var(--color-active-bg)`,
                            borderLeft: `4px solid var(--color-primary)`,
                            borderTopLeftRadius: '0',
                            borderBottomLeftRadius: '0'
                        } : {}}
                    >
                        <Avatar
                            name={conv.name}
                            color={conv.avatar_color || 'var(--color-primary)'}
                            size="md"
                            status={conv.is_private ? (isOnline ? 'online' : 'offline') : null}
                        />

                        <div className="ml-3 flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                                <Typography variant="small" className="font-semibold truncate text-[var(--color-text-primary)]">
                                    {conv.name}
                                </Typography>
                                {conv.unread_count && conv.unread_count > 0 ? (
                                    <Badge variant="danger" className="ml-2">
                                        {conv.unread_count}
                                    </Badge>
                                ) : null}
                            </div>
                            <Typography variant="muted" className={cn(
                                "text-[11px] truncate flex items-center gap-1",
                                isOnline ? "text-green-600 dark:text-green-400" : "text-[var(--color-text-muted)]"
                            )}>
                                {isOnline ? 'En línea' : 'Desconectado'}
                            </Typography>
                        </div>
                    </Button>
                );
            })}
        </div>
    );
}
