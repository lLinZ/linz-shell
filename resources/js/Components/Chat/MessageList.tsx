import * as React from "react"
import { useRef, useEffect, useCallback } from "react"
import MessageBubble from "./MessageBubble"
import { ChatMenuProvider } from "./ChatMenuContext"
import { Typography } from "@/Components/ui/Typography"
import { MessageSquare } from "lucide-react"

interface MessageListProps {
    messages: any[]
    currentUser: any
    loading: boolean
    loadingMore: boolean
    hasMore: boolean
    loadMore: () => void
    isTyping: boolean
    isPrivate: boolean
    onReact: (messageId: number, emoji: string) => void
    onReply: (message: any) => void
}

export const MessageList = ({
    messages,
    currentUser,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    isTyping,
    isPrivate,
    onReact,
    onReply,
}: MessageListProps) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const scrollStateRef = useRef({
        prevMessageCount: 0,
        prevScrollHeight: 0,
        isLoadingOlder: false,
        hasInitiallyScrolled: false,
    });

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView({ behavior });
        });
    }, []);

    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;
        const { scrollTop } = containerRef.current;

        if (scrollTop < 50 && hasMore && !loadingMore && !scrollStateRef.current.isLoadingOlder) {
            scrollStateRef.current.prevScrollHeight = containerRef.current.scrollHeight;
            scrollStateRef.current.isLoadingOlder = true;
            loadMore();
        }
    }, [hasMore, loadingMore, loadMore]);

    // Restore scroll after loading older messages
    useEffect(() => {
        const state = scrollStateRef.current;
        if (state.isLoadingOlder && !loadingMore && containerRef.current && state.prevScrollHeight > 0) {
            const newScrollHeight = containerRef.current.scrollHeight;
            const heightDiff = newScrollHeight - state.prevScrollHeight;
            containerRef.current.scrollTop = heightDiff;
            state.prevScrollHeight = 0;
            state.isLoadingOlder = false;
        }
    }, [messages, loadingMore]);

    // Auto-scroll for new messages
    useEffect(() => {
        const state = scrollStateRef.current;
        const messageCountIncreased = messages.length > state.prevMessageCount;

        if (messageCountIncreased && !state.isLoadingOlder && !loadingMore) {
            if (state.hasInitiallyScrolled && containerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
                const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
                if (isNearBottom) scrollToBottom('smooth');
            }
        }
        state.prevMessageCount = messages.length;
    }, [messages.length, scrollToBottom, loadingMore]);

    // Scroll to bottom when loading finishes (initial load)
    const prevLoadingRef = useRef(loading);
    useEffect(() => {
        const wasLoading = prevLoadingRef.current;
        prevLoadingRef.current = loading;

        if (wasLoading && !loading && messages.length > 0) {
            const forceScrollBottom = () => {
                if (containerRef.current) {
                    containerRef.current.scrollTop = containerRef.current.scrollHeight;
                }
            };
            forceScrollBottom();
            requestAnimationFrame(forceScrollBottom);
            setTimeout(forceScrollBottom, 50);
            setTimeout(forceScrollBottom, 200);

            scrollStateRef.current.hasInitiallyScrolled = true;
            scrollStateRef.current.prevMessageCount = messages.length;
        }
    }, [loading, messages.length]);

    // Scroll when typing indicator appears
    useEffect(() => {
        if (isTyping && containerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
            if (isNearBottom) scrollToBottom('smooth');
        }
    }, [isTyping, scrollToBottom]);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center w-full bg-[var(--color-bg-primary)]">
                <div className="w-12 h-12 rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] animate-spin" />
                <Typography variant="muted" className="mt-4 animate-pulse">Cargando mensajes...</Typography>
            </div>
        );
    }

    return (
        <ChatMenuProvider>
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[var(--color-bg-primary)]"
            >
                {loadingMore && (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--color-primary)] border-t-transparent" />
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center px-4">
                        <div className="w-20 h-20 bg-[var(--color-bg-tertiary)] rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <MessageSquare className="w-10 h-10 text-[var(--color-text-muted)]" />
                        </div>
                        <Typography variant="h3" className="text-[var(--color-text-primary)] mb-2">
                            No hay mensajes aún
                        </Typography>
                        <Typography variant="muted" className="max-w-[250px]">
                            ¡Sé el primero en romper el hielo y comienza la conversación!
                        </Typography>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-1 min-h-full justify-end">
                        {messages.map((msg, idx) => (
                            <MessageBubble
                                key={msg.id || idx}
                                message={msg}
                                isMe={msg.user_id === currentUser.id}
                                isPrivate={isPrivate}
                                currentUserId={currentUser.id}
                                onReact={onReact}
                                onReply={onReply}
                            />
                        ))}
                    </div>
                )}

                {isTyping && (
                    <div className="flex items-center space-x-2 text-xs text-[var(--color-text-muted)] ml-12 py-2">
                        <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-[var(--color-text-muted)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1.5 h-1.5 bg-[var(--color-text-muted)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1.5 h-1.5 bg-[var(--color-text-muted)] rounded-full animate-bounce" />
                        </div>
                        <Typography variant="muted" component="span">Alguien está escribiendo...</Typography>
                    </div>
                )}
                <div ref={bottomRef} className="h-px" />
            </div>
        </ChatMenuProvider>
    );
};
