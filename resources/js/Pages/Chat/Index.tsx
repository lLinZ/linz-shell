import { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps, User } from '@/types';
import ChatWindow from '@/Components/Chat/ChatWindow';
import { ChatSidebar } from '@/Components/Chat/ChatSidebar';
import { usePresence } from '@/Hooks/usePresence';
import { useChatDashboard } from '@/Hooks/useChatDashboard';
import { Surface } from '@/Components/ui/Surface';
import { cn } from '@/lib/utils';
import { ChatSoundProvider } from '@/Components/Chat/ChatSoundContext';

interface Conversation {
    id: number;
    name: string;
    is_private: boolean;
    unread_count?: number;
    other_user_id?: number;
    avatar_color?: string;
}

interface ChatProps extends PageProps {
    conversations: Conversation[];
    allUsers: any[];
}

export default function ChatDashboard({ auth, conversations: initialConversations, allUsers }: ChatProps) {
    const { onlineUserIds } = usePresence();
    const {
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
    } = useChatDashboard(initialConversations, auth.user.id);

    // ESC key handler to deselect active chat
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && activeConversationId !== 0) {
                setActiveConversationId(0);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeConversationId, setActiveConversationId]);

    return (
        <AuthenticatedLayout fullWidth={true}>
            <Head title="Chat" />
            <ChatSoundProvider>
                <Surface variant="secondary" size="none" shadow="none" border={false} rounding="none" className="w-full h-full flex overflow-hidden">

                    {/* Sidebar: Hidden on mobile when a chat is active */}
                    <div className={cn(
                        "w-full md:w-1/3 h-full md:flex border-r border-[var(--color-border)]",
                        activeConversationId !== 0 ? "hidden md:flex" : "flex"
                    )}>
                        <ChatSidebar
                            conversations={conversations}
                            allUsers={allUsers}
                            onlineUserIds={onlineUserIds}
                            activeConversationId={activeConversationId}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            onSelectConversation={handleSelectConversation}
                            onStartChat={startChat}
                            onAddGroup={createGroup}
                            currentUser={auth.user}
                            globalUsers={globalUsers}
                            filteredConversations={filteredConversations}
                        />
                    </div>

                    {/* Chat Window: Hidden on mobile when no chat is active */}
                    <div className={cn(
                        "w-full md:w-2/3 h-full md:flex",
                        activeConversationId === 0 ? "hidden md:flex" : "flex"
                    )}>
                        <ChatWindow
                            conversation={conversations.find(c => c.id === activeConversationId)!}
                            currentUser={auth.user as User}
                            onBack={() => setActiveConversationId(0)}
                            onUpdate={(updatedConv: any) => {
                                setConversations(prev => prev.map(c =>
                                    c.id === updatedConv.id ? { ...c, ...updatedConv } : c
                                ));
                            }}
                        />
                    </div>
                </Surface>
            </ChatSoundProvider>
        </AuthenticatedLayout>
    );
}
