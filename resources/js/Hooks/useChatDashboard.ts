import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useChatSound } from '@/Components/Chat/ChatSoundContext';

interface Conversation {
    id: number;
    name: string;
    is_private: boolean;
    unread_count?: number;
    other_user_id?: number;
    avatar_color?: string;
}

export function useChatDashboard(initialConversations: Conversation[], currentUserId: number) {
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [activeConversationId, setActiveConversationId] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [globalUsers, setGlobalUsers] = useState<any[]>([]);
    const { playNotification } = useChatSound();


    // Global Notification Listener (Echo)
    useEffect(() => {
        // @ts-ignore
        if (!window.Echo) return;

        // @ts-ignore
        window.Echo.private(`App.Models.User.${currentUserId}`)
            .listen('NewMessageNotification', (e: any) => {
                const isCurrent = e.conversation_id === activeConversationId;

                // Play sound if not in active conversation
                if (!isCurrent) {
                    playNotification();
                }

                setConversations(prev => {
                    // Check if conversation exists
                    const exists = prev.find(c => c.id === e.conversation_id);
                    if (exists) {
                        return prev.map(conv => {
                            if (conv.id === e.conversation_id) {
                                return {
                                    ...conv,
                                    unread_count: isCurrent ? 0 : (conv.unread_count || 0) + 1
                                };
                            }
                            return conv;
                        });
                    } else {
                        // If it's a new conversation not in our list, we might need to fetch its info
                        // For now we'll just wait for a refresh or manual check, 
                        // but ideally we'd fetch the basic conversation info here.
                        return prev;
                    }
                });
            });

        return () => {
            // @ts-ignore
            window.Echo.leave(`App.Models.User.${currentUserId}`);
        }
    }, [activeConversationId, currentUserId]);

    // Global Search Effect
    useEffect(() => {
        if (!searchQuery.trim()) {
            setGlobalUsers([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            axios.get(`/chat/search-all-users?query=${searchQuery}`)
                .then(res => setGlobalUsers(res.data))
                .catch(err => console.error(err));
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSelectConversation = (id: number) => {
        setActiveConversationId(id);
        setConversations(prev => prev.map(conv =>
            conv.id === id ? { ...conv, unread_count: 0 } : conv
        ));
    };

    const startChat = async (user: any) => {
        try {
            const response = await axios.post(`/chat/private/${user.id}`);
            const conversation = response.data;
            if (conversation) {
                if (!conversations.find(c => c.id === conversation.id)) {
                    setConversations(prev => [
                        { ...conversation, name: user.name, avatar_color: user.avatar_color, is_private: true },
                        ...prev
                    ]);
                }
                setActiveConversationId(conversation.id);
                setSearchQuery('');
                setGlobalUsers([]);
            }
        } catch (error) {
            console.error("Failed to start chat", error);
        }
    };

    const createGroup = async (name: string) => {
        try {
            const response = await axios.post('/chat/group', { name });
            const conversation = response.data;
            setConversations(prev => [conversation, ...prev]);
            setActiveConversationId(conversation.id);
            return conversation;
        } catch (error) {
            console.error("Failed to create group", error);
            throw error;
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
        conversations,
        setConversations,
        activeConversationId,
        setActiveConversationId,
        searchQuery,
        setSearchQuery,
        globalUsers,
        filteredConversations,
        handleSelectConversation,
        startChat,
        createGroup
    };
}
