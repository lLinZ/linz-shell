import * as React from "react"
import { useState } from "react"
import { MessageSquare } from "lucide-react"
import { useChat } from "@/Hooks/useChat"
import { User, Conversation } from "@/types"
import ChatInput from "./ChatInput"
import { ChatHeader } from "./ChatHeader"
import { MessageList } from "./MessageList"
import { ParticipantsModal } from "./ParticipantsModal"
import { Typography } from "@/Components/ui/Typography"
import { Surface } from "@/Components/ui/Surface"

interface ChatWindowProps {
    conversation: Conversation;
    currentUser: User;
    onUpdate?: (conversation: Partial<Conversation>) => void;
    onBack?: () => void;
}

export default function ChatWindow({ conversation, currentUser, onUpdate, onBack }: ChatWindowProps) {
    const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
    const [replyingTo, setReplyingTo] = useState<any | null>(null);

    // Hooks always called before any conditional return
    const {
        messages, isTyping, sendMessage, sendTyping, reactToMessage,
        onlineUsers, allUsers, refreshUsers, loading, loadingMore, hasMore, loadMore
    } = useChat(conversation?.id || 0, currentUser.id);

    // Empty state — no conversation selected
    if (!conversation) {
        return (
            <Surface variant="primary" size="none" border={false} className="h-full w-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-[var(--color-bg-tertiary)] rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <MessageSquare className="w-8 h-8 text-[var(--color-text-muted)]" />
                </div>
                <Typography variant="h3" className="text-[var(--color-text-primary)] mb-1">
                    LinZ Chat
                </Typography>
                <Typography variant="muted" className="text-center max-w-[240px]">
                    Selecciona una conversación para comenzar
                </Typography>
            </Surface>
        );
    }

    const handleSendMessage = (body: string) => {
        sendMessage(body, replyingTo?.id);
        setReplyingTo(null); // Clear reply after sending
    };

    return (
        <Surface variant="secondary" size="none" border={false} rounding="none" className="flex flex-col h-full w-full">
            <ChatHeader
                conversation={conversation}
                currentUser={currentUser}
                onUpdate={onUpdate}
                onShowParticipants={() => setIsUsersModalOpen(true)}
                onBack={onBack}
            />

            <MessageList
                messages={messages.filter(m => {
                    if (currentUser.role === 'client' && m.body.startsWith("El cliente está consultando desde:")) {
                        return false;
                    }
                    return true;
                })}
                currentUser={currentUser}
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                loadMore={loadMore}
                isTyping={isTyping}
                isPrivate={conversation.is_private}
                onReact={reactToMessage}
                onReply={(msg) => setReplyingTo(msg)}
            />

            <ChatInput
                onSendMessage={handleSendMessage}
                onTyping={sendTyping}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
            />

            <ParticipantsModal
                isOpen={isUsersModalOpen}
                onClose={() => setIsUsersModalOpen(false)}
                conversation={conversation}
                currentUser={currentUser}
                allUsers={allUsers}
                onlineUsers={onlineUsers}
                refreshUsers={refreshUsers}
            />
        </Surface>
    );
}
