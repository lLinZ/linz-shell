import { useState, useEffect } from 'react';

/**
 * Hook to manage global user presence using Laravel Echo.
 * Returns an array of user IDs that are currently online.
 */
export function usePresence() {
    const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);

    useEffect(() => {
        // @ts-ignore
        if (!window.Echo) {
            console.warn('Echo not found. Presence will not work.');
            return;
        }

        // @ts-ignore
        const channel = window.Echo.join('global.presence')
            .here((users: any[]) => {
                setOnlineUserIds(users.map(u => u.id));
            })
            .joining((user: any) => {
                setOnlineUserIds(prev => {
                    if (prev.includes(user.id)) return prev;
                    return [...prev, user.id];
                });
            })
            .leaving((user: any) => {
                setOnlineUserIds(prev => prev.filter(id => id !== user.id));
            })
            .error((error: any) => {
                console.error('Global presence error:', error);
            });

        return () => {
            // @ts-ignore
            window.Echo.leave('global.presence');
        }
    }, []);

    return { onlineUserIds };
}
