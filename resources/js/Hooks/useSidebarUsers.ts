import { useMemo } from 'react';

export function useSidebarUsers(conversations: any[], allUsers: any[], onlineUserIds: number[]) {
    return useMemo(() => {
        const userMap = new Map();

        conversations.forEach(conv => {
            if (conv.is_private && conv.other_user_id) {
                userMap.set(conv.other_user_id, {
                    id: conv.other_user_id,
                    name: conv.name,
                    avatar_color: conv.avatar_color,
                    conversation_id: conv.id,
                    unread_count: conv.unread_count
                });
            } else if (!conv.is_private) {
                userMap.set(`group_${conv.id}`, {
                    id: conv.id,
                    name: conv.name,
                    avatar_color: conv.avatar_color,
                    conversation_id: conv.id,
                    unread_count: conv.unread_count,
                    is_group: true
                });
            }
        });

        allUsers.forEach(user => {
            if (!userMap.has(user.id)) {
                userMap.set(user.id, {
                    id: user.id,
                    name: user.name,
                    avatar_color: user.avatar_color,
                    email: user.email,
                    conversation_id: null
                });
            }
        });

        const allUsersList = Array.from(userMap.values());
        const groups = allUsersList.filter(u => (u as any).is_group);
        const privateUsers = allUsersList.filter(u => !(u as any).is_group);

        return {
            groups,
            onlineUsers: privateUsers.filter(u => onlineUserIds.includes((u as any).id)),
            offlineUsers: privateUsers.filter(u => !onlineUserIds.includes((u as any).id))
        };
    }, [conversations, allUsers, onlineUserIds]);
}
