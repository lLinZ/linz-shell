import { useMemo } from 'react';

export function useSidebarUsers(conversations: any[], allUsers: any[], onlineUserIds: (number | string)[]) {
    return useMemo(() => {
        const userMap = new Map();

        // Normalize onlineUserIds to a Set of numbers for fast O(1) lookup
        const onlineSet = new Set(onlineUserIds.map(id => Number(id)).filter(id => !isNaN(id)));

        // 1. Process existing conversations
        conversations.forEach(conv => {
            const archived = !!conv.is_archived;

            if (conv.is_private && conv.other_user_id) {
                const otherId = Number(conv.other_user_id);
                userMap.set(otherId, {
                    id: otherId,
                    name: conv.name,
                    avatar_color: conv.avatar_color,
                    conversation_id: conv.id,
                    unread_count: conv.unread_count,
                    role: conv.other_user_role,
                    is_archived: archived
                });
            } else if (!conv.is_private) {
                userMap.set(`group_${conv.id}`, {
                    id: conv.id,
                    name: conv.name,
                    avatar_color: conv.avatar_color,
                    conversation_id: conv.id,
                    unread_count: conv.unread_count,
                    is_group: true,
                    is_archived: archived
                });
            }
        });

        // 2. Add users without conversations (only if they aren't already in the map)
        allUsers.forEach(user => {
            const userId = Number(user.id);
            if (!userMap.has(userId) && !isNaN(userId)) {
                userMap.set(userId, {
                    id: userId,
                    name: user.name,
                    avatar_color: user.avatar_color,
                    email: user.email,
                    conversation_id: null,
                    role: user.role,
                    is_archived: false
                });
            }
        });

        const allUsersList = Array.from(userMap.values());

        // Filter out archived conversations unless we specifically want them
        const activeUsers = allUsersList.filter(u => !u.is_archived);
        const archivedUsers = allUsersList.filter(u => u.is_archived);

        const groups = activeUsers.filter(u => u.is_group);
        const teammates = activeUsers.filter(u => !u.is_group && u.role !== 'client');
        const clients = activeUsers.filter(u => !u.is_group && u.role === 'client');

        return {
            groups,
            teammatesOnline: teammates.filter(u => onlineSet.has(Number(u.id))),
            teammatesOffline: teammates.filter(u => !onlineSet.has(Number(u.id))),
            clientsOnline: clients.filter(u => onlineSet.has(Number(u.id))),
            clientsOffline: clients.filter(u => !onlineSet.has(Number(u.id))),
            archived: archivedUsers
        };
    }, [conversations, allUsers, onlineUserIds]);
}
