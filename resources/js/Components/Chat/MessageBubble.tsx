/**
 * MessageBubble
 *
 * Rendering contract:
 *  - <Button variant="ghost"> for all menu actions (Issue A)
 *  - useChatMenu() context instead of window.dispatchEvent (Issue G)
 *  - Smart desktop menu placement: above or below based on available space
 *  - Mobile: full-screen bottom sheet
 *  - Private chats: no avatar, no sender name
 */
import * as React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import Avatar from "@/Components/ui/Avatar"
import { Typography } from "@/Components/ui/Typography"
import { Button } from "@/Components/ui/button"
import { Reply, Copy, Trash2, X } from "lucide-react"
import { useChatMenu } from "./ChatMenuContext"

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

interface Reaction {
    id: number;
    name: string;
}

interface ReplyMessage {
    id: number;
    body: string;
    user?: { name: string; avatar_color?: string };
}

interface MessageBubbleProps {
    message: {
        id: number
        body: string
        created_at: string
        user_id: number
        user?: any
        reply_to?: ReplyMessage | null
        reactions?: Record<string, Reaction[]>
    }
    isMe: boolean
    isPrivate: boolean
    currentUserId: number
    onReact: (messageId: number, emoji: string) => void
    onReply: (message: any) => void
}

export default function MessageBubble({
    message, isMe, isPrivate, currentUserId, onReact, onReply,
}: MessageBubbleProps) {
    // ── Context menu state via React Context (Issue G) ─────────────────────
    const { openMenuId, openMenu, closeMenu } = useChatMenu();
    const showContextMenu = openMenuId === message.id;

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [menuPlacement, setMenuPlacement] = useState<'above' | 'below'>('above');
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const didLongPress = useRef(false);
    const bubbleRef = useRef<HTMLDivElement>(null);

    // In private chats, hide avatar and sender name for the other person
    const showSenderInfo = !isPrivate && !isMe;

    // ── Close emoji picker on outside click ───────────────────────────────
    useEffect(() => {
        if (!showEmojiPicker) return;
        const close = () => setShowEmojiPicker(false);
        const timer = setTimeout(() => {
            window.addEventListener('click', close, { once: true });
        }, 0);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('click', close);
        };
    }, [showEmojiPicker]);

    // ── Close context menu on outside click ───────────────────────────────
    useEffect(() => {
        if (!showContextMenu) return;
        const close = () => closeMenu();
        const timer = setTimeout(() => {
            window.addEventListener('click', close, { once: true });
            window.addEventListener('contextmenu', close, { once: true });
        }, 0);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('click', close);
            window.removeEventListener('contextmenu', close);
        };
    }, [showContextMenu, closeMenu]);

    // ── Open context menu (context takes care of closing others) ──────────
    const handleOpenMenu = useCallback(() => {
        const MENU_HEIGHT = 220;
        const rect = bubbleRef.current?.getBoundingClientRect();
        if (rect) {
            setMenuPlacement(rect.top >= MENU_HEIGHT ? 'above' : 'below');
        }
        openMenu(message.id);
    }, [openMenu, message.id]);

    // ── Right-click (desktop) ─────────────────────────────────────────────
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleOpenMenu();
    };

    // ── Long-press (mobile) ───────────────────────────────────────────────
    const handleTouchStart = () => {
        didLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
            didLongPress.current = true;
            handleOpenMenu();
        }, 500);
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        if (didLongPress.current) e.preventDefault();
    };
    const handleTouchMove = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    const reactions = message.reactions || {};
    const reactionEntries = Object.entries(reactions);

    // ── Context menu action list — used by both desktop and mobile ─────────
    // Issue A: all actions use <Button variant="ghost"> from the design system.
    // Note: Button uses cva so we extend via className for layout specifics.
    const contextMenuItems = (
        <>
            <Button
                variant="ghost"
                className="w-full justify-start gap-3 rounded-none px-4 py-3 h-auto font-normal"
                onClick={() => { onReply(message); closeMenu(); }}
            >
                <Reply className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                Responder
            </Button>
            <Button
                variant="ghost"
                className="w-full justify-start gap-3 rounded-none px-4 py-3 h-auto font-normal"
                onClick={() => { setShowEmojiPicker(true); closeMenu(); }}
            >
                <span className="text-base leading-none flex-shrink-0">😊</span>
                Reaccionar
            </Button>
            <Button
                variant="ghost"
                className="w-full justify-start gap-3 rounded-none px-4 py-3 h-auto font-normal"
                onClick={() => { navigator.clipboard.writeText(message.body); closeMenu(); }}
            >
                <Copy className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
                Copiar texto
            </Button>
            {isMe && (
                <>
                    <div className="my-1 border-t border-[var(--color-border)]" />
                    {/* ghost base + red overrides — no destructive variant because that uses bg-red-500 */}
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 rounded-none px-4 py-3 h-auto font-normal text-red-500 hover:bg-red-500/10 hover:text-red-500"
                        onClick={() => { /* TODO: delete handler */ closeMenu(); }}
                    >
                        <Trash2 className="w-4 h-4 flex-shrink-0" />
                        Eliminar
                    </Button>
                </>
            )}
        </>
    );

    return (
        <>
            <div
                className={cn(
                    "group flex w-full mt-2 max-w-[85%] md:max-w-[70%]",
                    isMe ? "ml-auto justify-end" : "mr-auto justify-start",
                    showSenderInfo ? "space-x-3" : ""
                )}
                onContextMenu={handleContextMenu}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
            >
                {/* Avatar — ONLY in groups for the other person */}
                {showSenderInfo && (
                    <div className="flex-shrink-0 self-end">
                        <Avatar name={message.user?.name || "?"} color={message.user?.avatar_color} size="sm" />
                    </div>
                )}

                <div className="flex flex-col gap-0.5 min-w-0">
                    {/* Reply quote */}
                    {message.reply_to && (
                        <div className={cn(
                            "flex items-start gap-2 px-3 py-1.5 rounded-xl mb-0.5",
                            "bg-[var(--color-bg-tertiary)] border-l-[3px] border-[var(--color-primary)] max-w-full",
                            isMe ? "ml-auto" : ""
                        )}>
                            <div className="min-w-0">
                                <Typography variant="small" className="font-semibold text-[var(--color-primary)] block truncate">
                                    {message.reply_to.user?.name ?? 'Usuario'}
                                </Typography>
                                <Typography variant="muted" className="text-[11px] truncate block max-w-[180px]">
                                    {message.reply_to.body}
                                </Typography>
                            </div>
                        </div>
                    )}

                    {/* Bubble */}
                    <div className="relative" ref={bubbleRef}>
                        <div className={cn(
                            "relative p-3 rounded-2xl shadow-sm",
                            isMe
                                ? "bg-[var(--color-primary)] text-white rounded-tr-none"
                                : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-tl-none border border-[var(--color-border)]"
                        )}>
                            {/* Sender name — only in groups for others */}
                            {showSenderInfo && (
                                <Typography variant="small" className="text-[var(--color-primary)] font-bold mb-1 block text-xs">
                                    {message.user?.name}
                                </Typography>
                            )}
                            <Typography component="span" className={cn(
                                "leading-relaxed break-words whitespace-pre-wrap text-sm block",
                                isMe ? "text-white" : "text-[var(--color-text-primary)]"
                            )}>
                                {message.body}
                            </Typography>
                            <Typography variant="muted" className={cn(
                                "text-[10px] block mt-1 opacity-70 text-right",
                                isMe ? "text-white/80" : "text-[var(--color-text-muted)]"
                            )}>
                                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                        </div>

                        {/* Emoji trigger — hover (desktop only) */}
                        <Button
                            variant="ghost"
                            size="none"
                            className={cn(
                                "absolute -bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150",
                                "bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-full",
                                "w-7 h-7 flex items-center justify-center text-sm shadow-md hover:scale-110 transition-transform",
                                isMe ? "left-1" : "right-1"
                            )}
                            onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(v => !v); }}
                            title="Reaccionar"
                        >
                            😊
                        </Button>

                        {/* Emoji Picker — anchored above bubble */}
                        {showEmojiPicker && (
                            <div
                                className={cn(
                                    "absolute bottom-full mb-2 z-50",
                                    "bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-2 flex gap-1.5",
                                    isMe ? "right-0" : "left-0"
                                )}
                                onClick={e => e.stopPropagation()}
                            >
                                {EMOJI_LIST.map(emoji => (
                                    <Button
                                        key={emoji}
                                        variant="ghost"
                                        size="none"
                                        className="text-xl hover:scale-125 active:scale-95 transition-transform duration-100 p-1 rounded-lg"
                                        onClick={() => { onReact(message.id, emoji); setShowEmojiPicker(false); }}
                                    >
                                        {emoji}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Context Menu — DESKTOP only, smart placement */}
                        {showContextMenu && (
                            <div
                                className={cn(
                                    "hidden md:block absolute z-[200] overflow-hidden",
                                    "bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-2xl min-w-[180px]",
                                    menuPlacement === 'above' ? "bottom-full mb-2" : "top-full mt-2",
                                    isMe ? "right-0" : "left-0"
                                )}
                                onClick={e => e.stopPropagation()}
                            >
                                {contextMenuItems}
                            </div>
                        )}
                    </div>

                    {/* Reaction pills */}
                    {Object.entries(message.reactions || {}).length > 0 && (
                        <div className={cn("flex flex-wrap gap-1 mt-1", isMe ? "justify-end" : "justify-start")}>
                            {Object.entries(message.reactions || {}).map(([emoji, users]) => {
                                const safeUsers = Array.isArray(users) ? users : [];
                                const iReacted = safeUsers.some(u => u && u.id === currentUserId);

                                return (
                                    <Button
                                        key={emoji}
                                        variant="outline"
                                        size="none"
                                        onClick={() => onReact(message.id, emoji)}
                                        title={safeUsers.map(u => u?.name).filter(Boolean).join(', ')}
                                        className={cn(
                                            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs h-auto",
                                            "transition-all duration-150 hover:scale-105 active:scale-95",
                                            iReacted
                                                ? "bg-[var(--color-primary)]/15 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold"
                                                : "bg-[var(--color-bg-tertiary)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                                        )}
                                    >
                                        {emoji} <span className="pointer-events-none">{safeUsers.length}</span>
                                    </Button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Context Menu — MOBILE bottom sheet */}
            {showContextMenu && (
                <div
                    className="md:hidden fixed inset-0 z-[300] flex flex-col justify-end"
                    onClick={() => closeMenu()}
                >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    <div
                        className="relative bg-[var(--color-bg-secondary)] rounded-t-3xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
                        </div>

                        {/* Message preview */}
                        <div className="px-4 py-2 mb-1 border-b border-[var(--color-border)]">
                            <Typography variant="muted" className="text-xs truncate">{message.body}</Typography>
                        </div>

                        {/* Quick emoji row */}
                        <div className="flex justify-around px-4 py-3 border-b border-[var(--color-border)]">
                            {EMOJI_LIST.map(emoji => (
                                <Button
                                    key={emoji}
                                    variant="ghost"
                                    size="none"
                                    className="text-2xl hover:scale-125 active:scale-95 transition-transform duration-100 p-2 rounded-xl"
                                    onClick={() => { onReact(message.id, emoji); closeMenu(); }}
                                >
                                    {emoji}
                                </Button>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="py-2">
                            {contextMenuItems}
                        </div>

                        {/* Cancel */}
                        <div className="px-4 pb-8 pt-1">
                            <Button
                                variant="secondary"
                                className="w-full py-3 h-auto rounded-2xl"
                                onClick={() => closeMenu()}
                            >
                                <X className="w-4 h-4" />
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
