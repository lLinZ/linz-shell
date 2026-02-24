import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePage } from '@inertiajs/react';

interface PresenceContextType {
    onlineUserIds: number[];
}

const PresenceContext = createContext<PresenceContextType>({ onlineUserIds: [] });

export const usePresence = () => useContext(PresenceContext);

export function PresenceProvider({ children, user: propUser }: { children: ReactNode, user?: any }) {
    const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);

    // We try to get the user from props first (global use), 
    // then from usePage if we are inside the Inertia tree.
    let user = propUser;

    // Safety check for usePage
    try {
        const page = usePage<any>();
        if (!user && page?.props?.auth?.user) {
            user = page.props.auth.user;
        }
    } catch (e) {
        // Ignored: probably calling from app.tsx setup where context isn't ready
    }

    useEffect(() => {
        // Only join if user is authenticated and Echo is available
        // @ts-ignore
        if (!user || !window.Echo) {
            if (!user) console.log('Presence: No user, cleaning up');
            setOnlineUserIds([]);
            return;
        }

        console.log('Presence: Attempting to join global.presence for user:', user.id);

        // @ts-ignore
        const channel = window.Echo.join('global.presence')
            .here((users: any[]) => {
                console.log('Presence: Members currently online:', users);
                setOnlineUserIds(users.map(u => u.id));
            })
            .joining((member: any) => {
                console.log('Presence: Member joining:', member);
                setOnlineUserIds(prev => {
                    const memberId = Number(member.id);
                    if (prev.includes(memberId)) return prev;
                    return [...prev, memberId];
                });
            })
            .leaving((member: any) => {
                console.log('Presence: Member leaving:', member);
                setOnlineUserIds(prev => {
                    const memberId = Number(member.id);
                    return prev.filter(id => id !== memberId);
                });
            })
            .error((error: any) => {
                console.error('Presence: Channel error:', error);
            });

        return () => {
            console.log('Presence: Leaving global.presence');
            // @ts-ignore
            window.Echo.leave('global.presence');
        };
    }, [user?.id]); // Re-join if user changes

    return (
        <PresenceContext.Provider value={{ onlineUserIds }}>
            {children}
        </PresenceContext.Provider>
    );
}
