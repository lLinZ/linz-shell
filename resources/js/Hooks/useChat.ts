import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { User } from '@/types';

export const useChat = (conversationId: number, currentUserId?: number) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Presence state
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    // Pagination & Loading state
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);

    useEffect(() => {
        audioRef.current = new Audio('/sounds/notification.mp3');
    }, []);

    const loadMessages = (cursor: string | null = null) => {
        if (!conversationId) return;

        const isInitialLoad = !cursor;
        if (isInitialLoad) setLoading(true);
        else setLoadingMore(true);

        const url = `/chat/${conversationId}/messages` + (cursor ? `?cursor=${cursor}` : '');

        axios.get(url).then(response => {
            const newMessages = response.data.data.reverse(); // Backend returns latest first (desc), we display asc

            if (isInitialLoad) {
                setMessages(newMessages);
            } else {
                setMessages(prev => [...newMessages, ...prev]);
            }

            setNextCursor(response.data.next_cursor);
        }).catch(error => console.error("Failed to load messages:", error))
            .finally(() => {
                setLoading(false);
                setLoadingMore(false);
            });
    };

    useEffect(() => {
        if (!conversationId) return;

        // Reset state
        setMessages([]);
        setOnlineUsers([]);
        setAllUsers([]);
        setNextCursor(null);

        // Fetch initial messages
        loadMessages();

        // Fetch participants
        axios.get(`/chat/${conversationId}/users`).then(response => {
            setAllUsers(response.data);
        }).catch(error => console.error("Failed to load users:", error));

        // @ts-ignore
        // JOINING PRESENCE CHANNEL
        const channel = window.Echo.join(`chat.${conversationId}`)
            .here((users: User[]) => {
                setOnlineUsers(users);
            })
            .joining((user: User) => {
                setOnlineUsers((prev) => [...prev, user]);
            })
            .leaving((user: User) => {
                setOnlineUsers((prev) => prev.filter(u => u.id !== user.id));
            })
            .listen('MessageSent', (e: any) => {
                setMessages((prev) => {
                    if (prev.find(m => m.id === e.message.id)) return prev;
                    return [...prev, e.message];
                });

                if (currentUserId && e.message.user_id !== currentUserId) {
                    audioRef.current?.play().catch(e => console.error("Audio play failed", e));
                }
            })
            .listenForWhisper('typing', (e: any) => {
                setIsTyping(true);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
            });

        return () => {
            // @ts-ignore
            window.Echo.leave(`chat.${conversationId}`);
        };
    }, [conversationId, currentUserId]);

    const fetchUsers = () => {
        if (!conversationId) return;
        axios.get(`/chat/${conversationId}/users`).then(response => {
            setAllUsers(response.data);
        }).catch(error => console.error("Failed to load users:", error));
    };

    const sendMessage = async (body: string) => {
        if (!conversationId) return;
        try {
            const response = await axios.post(`/chat/${conversationId}/messages`, { body });
            setMessages((prev) => [...prev, response.data]);
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const sendTyping = () => {
        if (!conversationId) return;
        // @ts-ignore
        window.Echo.join(`chat.${conversationId}`)
            .whisper('typing', { name: 'User' });
    };

    const loadMore = () => {
        if (nextCursor && !loadingMore) {
            loadMessages(nextCursor);
        }
    };

    return {
        messages,
        isTyping,
        sendMessage,
        sendTyping,
        onlineUsers,
        allUsers,
        refreshUsers: fetchUsers,
        loading,
        loadingMore,
        hasMore: !!nextCursor,
        loadMore
    };
};
