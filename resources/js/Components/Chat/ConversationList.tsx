import { cn } from "@/lib/utils";
import { User } from "@/types";
import { generateDarkVariant, generateLightVariant, generateAccentColor, generateTextColor, getBackgroundVariant } from '@/lib/colorUtils';
import Avatar from "@/Components/ui/Avatar";
import { Badge } from "@/Components/ui/badge";

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
                    <button
                        key={conv.id}
                        onClick={() => onSelect(conv.id)}
                        className={cn(
                            "flex items-center p-3 rounded-lg transition-all duration-200 text-left theme-hover",
                            activeId === conv.id
                                ? "ring-1 theme-active"
                                : ""
                        )}
                        style={activeId === conv.id ? {
                            backgroundColor: `var(--color-active-bg)`,
                            borderColor: `var(--color-focus-ring)`,
                        } as React.CSSProperties : {}}
                    >
                        <Avatar
                            name={conv.name}
                            color={conv.avatar_color || 'var(--color-primary)'}
                            size="md"
                            status={conv.is_private ? (isOnline ? 'online' : 'offline') : null}
                        />

                        <div className="ml-3 flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">
                                    {conv.name}
                                </h4>
                                {conv.unread_count && conv.unread_count > 0 ? (
                                    <Badge variant="danger" className="ml-2">
                                        {conv.unread_count}
                                    </Badge>
                                ) : null}
                            </div>
                            <p className={cn(
                                "text-xs truncate flex items-center gap-1",
                                isOnline ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                            )}>
                                {isOnline ? 'En línea' : 'Desconectado'}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
