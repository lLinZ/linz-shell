import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import ConversationList from '@/Components/Chat/ConversationList';
import ChatWindow from '@/Components/Chat/ChatWindow';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { generateDarkVariant, generateLightVariant, generateAccentColor, generateTextColor, getBackgroundVariant } from '@/lib/colorUtils';
import Avatar from '@/Components/ui/Avatar';
import { Badge } from '@/Components/ui/badge';

// Define the Conversation type if not already imported or defined
// Moving to use the same shape as ConversationList expects
interface Conversation {
    id: number;
    name: string;
    is_private: boolean;
    unread_count?: number;
    other_user_id?: number; // Added for presence check
    avatar_color?: string; // Added for UI display
}

interface ChatProps extends PageProps {
    conversations: Conversation[];
    allUsers: any[];
}

export default function ChatDashboard({ auth, conversations: initialConversations, allUsers: initialAllUsers }: ChatProps) {
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [allUsers, setAllUsers] = useState<any[]>(initialAllUsers);
    const [activeConversationId, setActiveConversationId] = useState<number>(initialConversations.length > 0 ? initialConversations[0].id : 0);
    const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        notificationAudioRef.current = new Audio('/sounds/notification.mp3');
    }, []);

    // Global Notification Listener
    useEffect(() => {
        // @ts-ignore
        window.Echo.private(`App.Models.User.${auth.user.id}`)
            .listen('NewMessageNotification', (e: any) => {
                console.log("🔔 [Global] New Message Notification:", e);

                // Play sound if not in the active conversation
                if (e.conversation_id !== activeConversationId) {
                    notificationAudioRef.current?.play().catch(err => console.error("Audio play failed", err));
                }

                setConversations(prev => prev.map(conv => {
                    if (conv.id === e.conversation_id) {
                        const isCurrent = conv.id === activeConversationId;
                        return {
                            ...conv,
                            unread_count: isCurrent ? 0 : (conv.unread_count || 0) + 1
                        };
                    }
                    return conv;
                }));
            });

        return () => {
            // @ts-ignore
            window.Echo.leave(`App.Models.User.${auth.user.id}`);
        }
    }, [activeConversationId]);

    // Global Presence for Sidebar Status
    const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);

    useEffect(() => {
        // @ts-ignore
        const channel = window.Echo.join('global.presence')
            .here((users: any[]) => {
                setOnlineUserIds(users.map(u => u.id));
            })
            .joining((user: any) => {
                setOnlineUserIds(prev => [...prev, user.id]);
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

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [globalUsers, setGlobalUsers] = useState<any[]>([]);

    // Clear unread count when selecting a conversation
    const handleSelectConversation = (id: number) => {
        setActiveConversationId(id);
        setConversations(prev => prev.map(conv =>
            conv.id === id ? { ...conv, unread_count: 0 } : conv
        ));
    };

    // Global Search Effect
    useEffect(() => {
        if (!searchQuery.trim()) {
            setGlobalUsers([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            // @ts-ignore
            axios.get(`/chat/search-all-users?query=${searchQuery}`)
                .then(res => setGlobalUsers(res.data))
                .catch(err => console.error(err));
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Start a chat with a user from search
    const startChat = async (user: any) => {
        try {
            const response = await axios.post(`/chat/private/${user.id}`);
            const conversation = response.data;

            if (conversation) {
                // Check if it exists in current list
                if (!conversations.find(c => c.id === conversation.id)) {
                    const newConv = {
                        ...conversation,
                        name: user.name,
                        avatar_color: user.avatar_color,
                        is_private: true
                    };
                    setConversations(prev => [newConv, ...prev]);
                }
                setActiveConversationId(conversation.id);
                setSearchQuery('');
                setGlobalUsers([]);
            }
        } catch (error) {
            console.error("Failed to start chat", error);
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AuthenticatedLayout>
            <Head title="Chat" />

            <div className="flex flex-col h-[calc(100vh-65px)]">
                <div style={{ backgroundColor: 'var(--color-bg-secondary)' }} className="w-full h-full flex overflow-hidden">

                    {/* Sidebar */}
                    <div style={{
                        backgroundColor: 'var(--color-bg-primary)',
                    }} className="w-1/3 border-r flex flex-col">
                        <div style={{ borderBottomColor: 'var(--color-border)' }} className="p-4 border-b">
                            <input
                                type="text"
                                placeholder="Buscar chat o usuario..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    backgroundColor: 'var(--color-bg-tertiary)',
                                    borderColor: 'var(--color-border)',
                                    borderWidth: '1px'
                                }}
                                className="w-full rounded-md text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-[var(--color-primary)] outline-none px-3 py-2"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {!searchQuery ? (
                                // Default view: All users grouped by online/offline
                                <>
                                    {(() => {
                                        // Create a map of all users combining conversations and allUsers
                                        const userMap = new Map();

                                        // Add users from conversations
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
                                                // Group conversations
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

                                        // Add remaining users from allUsers
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

                                        // Separate groups and private users
                                        const groups = allUsersList.filter(u => u.is_group);
                                        const privateUsers = allUsersList.filter(u => !u.is_group);

                                        // Separate online and offline private users
                                        const onlineUsers = privateUsers.filter(u => onlineUserIds.includes(u.id));
                                        const offlineUsers = privateUsers.filter(u => !onlineUserIds.includes(u.id));

                                        const handleUserClick = (user: any) => {
                                            if (user.conversation_id) {
                                                setActiveConversationId(user.conversation_id);
                                                setConversations(prev => prev.map(conv =>
                                                    conv.id === user.conversation_id ? { ...conv, unread_count: 0 } : conv
                                                ));
                                            } else {
                                                // Start new chat
                                                startChat(user);
                                            }
                                        };

                                        return (
                                            <>
                                                {groups.length > 0 && (
                                                    <div className="mb-2">
                                                        <h4 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Grupos</h4>
                                                        <div className="flex flex-col space-y-1 p-2">
                                                            {groups.map(group => {
                                                                const isActive = activeConversationId === group.conversation_id;

                                                                return (
                                                                    <button
                                                                        key={`group_${group.id}`}
                                                                        onClick={() => handleUserClick(group)}
                                                                        className={`flex items-center p-3 rounded-lg transition-all duration-200 text-left theme-hover ${isActive ? "theme-active relative overflow-hidden" : ""
                                                                            }`}
                                                                        style={isActive ? {
                                                                            backgroundColor: `var(--color-active-bg)`,
                                                                            borderLeft: `4px solid var(--color-primary)`,
                                                                            borderTopLeftRadius: '0',
                                                                            borderBottomLeftRadius: '0'
                                                                        } : {}}
                                                                    >
                                                                        <Avatar
                                                                            name={group.name}
                                                                            color={group.avatar_color || 'var(--color-primary)'}
                                                                            size="md"
                                                                        />
                                                                        <div className="ml-3 flex-1 overflow-hidden">
                                                                            <div className="flex justify-between items-center">
                                                                                <h4 className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">
                                                                                    {group.name}
                                                                                </h4>
                                                                                {(group.unread_count || 0) > 0 && (
                                                                                    <Badge variant="danger">
                                                                                        {group.unread_count}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Grupo</p>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div >
                                                )}

                                                {onlineUsers.length > 0 && (
                                                    <div className="mb-2">
                                                        <h4 className="px-4 py-2 text-xs font-semibold text-green-600 dark:text-green-400 uppercase">En línea ({onlineUsers.length})</h4>
                                                        <div className="flex flex-col space-y-1 p-2">
                                                            {onlineUsers.map(user => {
                                                                const isActive = activeConversationId === user.conversation_id;

                                                                return (
                                                                    <button
                                                                        key={user.id}
                                                                        onClick={() => handleUserClick(user)}
                                                                        className={`flex items-center p-3 rounded-lg transition-all duration-200 text-left theme-hover ${isActive ? "theme-active relative overflow-hidden" : ""
                                                                            }`}
                                                                        style={isActive ? {
                                                                            backgroundColor: `var(--color-active-bg)`,
                                                                            borderLeft: `4px solid var(--color-primary)`,
                                                                            borderTopLeftRadius: '0',
                                                                            borderBottomLeftRadius: '0'
                                                                        } : {}}
                                                                    >
                                                                        <Avatar
                                                                            name={user.name}
                                                                            color={user.avatar_color || 'var(--color-primary)'}
                                                                            size="md"
                                                                            status="online"
                                                                        />
                                                                        <div className="ml-3 flex-1 overflow-hidden">
                                                                            <div className="flex justify-between items-center">
                                                                                <h4
                                                                                    className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">
                                                                                    {user.name}
                                                                                </h4>
                                                                                {(user.unread_count || 0) > 0 && (
                                                                                    <Badge variant="danger">
                                                                                        {user.unread_count}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <p className="text-xs text-green-600 dark:text-green-400 truncate">En línea</p>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div >
                                                )}

                                                {offlineUsers.length > 0 && (
                                                    <div className="mb-2">
                                                        <h4 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Desconectado ({offlineUsers.length})</h4>
                                                        <div className="flex flex-col space-y-1 p-2">
                                                            {offlineUsers.map(user => {
                                                                const isActive = activeConversationId === user.conversation_id;

                                                                return (
                                                                    <button
                                                                        key={user.id}
                                                                        onClick={() => handleUserClick(user)}
                                                                        className={`flex items-center p-3 rounded-lg transition-all duration-200 text-left ${isActive ? "theme-active relative overflow-hidden" : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                                                                            }`}
                                                                        style={isActive ? {
                                                                            backgroundColor: `var(--color-active-bg)`,
                                                                            borderLeft: `4px solid var(--color-primary)`,
                                                                            borderTopLeftRadius: '0',
                                                                            borderBottomLeftRadius: '0'
                                                                        } : {}}
                                                                    >
                                                                        <Avatar
                                                                            name={user.name}
                                                                            color={user.avatar_color || 'var(--color-primary)'}
                                                                            size="md"
                                                                            status="offline"
                                                                        />
                                                                        <div className="ml-3 flex-1 overflow-hidden">
                                                                            <div className="flex justify-between items-center">
                                                                                <h4
                                                                                    className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">
                                                                                    {user.name}
                                                                                </h4>
                                                                                {(user.unread_count || 0) > 0 && (
                                                                                    <Badge variant="danger">
                                                                                        {user.unread_count}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Desconectado</p>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </>
                            ) : (
                                // Search view
                                <>
                                    {filteredConversations.length > 0 && (
                                        <div className="mb-2">
                                            <h4 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Conversaciones</h4>
                                            <ConversationList
                                                conversations={filteredConversations}
                                                activeId={activeConversationId}
                                                onSelect={handleSelectConversation}
                                                onlineUserIds={onlineUserIds}
                                            />
                                        </div>
                                    )}

                                    {searchQuery && globalUsers.length > 0 && (
                                        <div>
                                            <h4 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Otros Usuarios</h4>
                                            <div className="flex flex-col space-y-1 p-2">
                                                {globalUsers.map(user => (
                                                    <button
                                                        key={user.id}
                                                        onClick={() => startChat(user)}
                                                        className="flex items-center p-3 rounded-lg theme-hover transition-all duration-200 text-left"
                                                    >
                                                        <Avatar
                                                            name={user.name}
                                                            color={user.avatar_color || 'var(--color-primary)'}
                                                            size="md"
                                                        />
                                                        <div className="ml-3">
                                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</h4>
                                                            <p className="text-xs text-gray-500">{user.email}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {searchQuery && filteredConversations.length === 0 && globalUsers.length === 0 && (
                                        <div className="p-4 text-center text-gray-500">
                                            No se encontraron resultados
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className="w-2/3 h-full">
                        <ChatWindow
                            conversation={conversations.find(c => c.id === activeConversationId)!}
                            currentUser={auth.user}
                            onUpdate={(updatedConv) => {
                                setConversations(prev => prev.map(c =>
                                    c.id === updatedConv.id ? { ...c, ...updatedConv } : c
                                ));
                            }}
                        />
                    </div>

                </div>
            </div>
        </AuthenticatedLayout >
    );
}
