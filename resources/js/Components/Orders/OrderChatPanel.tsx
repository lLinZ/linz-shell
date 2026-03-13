import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Loader2, MessageCircle } from 'lucide-react';
import axios from 'axios';

interface ChatUser { id: number; name: string; avatar_color?: string; }
interface ChatMessage {
    id: number; body: string; created_at: string;
    user: ChatUser;
}

function Avatar({ name, color, size = 28 }: { name: string; color?: string; size?: number }) {
    const initials = (name ?? '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return (
        <div className="rounded-full flex items-center justify-center font-black text-white flex-shrink-0"
            style={{ width: size, height: size, background: color || '#10b981', fontSize: size * 0.36 }}>
            {initials}
        </div>
    );
}

interface Props {
    orderId: number;
    authUser: { id: number; name: string; avatar_color?: string };
    onClose: () => void;
}

export default function OrderChatPanel({ orderId, authUser, onClose }: Props) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Initiate chat on mount
    useEffect(() => {
        (async () => {
            try {
                const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
                const res = await axios.post(`/admin/orders/${orderId}/start-chat`, {}, {
                    headers: { 'X-CSRF-TOKEN': csrf }
                });
                const convId = res.data.id;
                setConversationId(convId);

                // Load messages
                const msgRes = await axios.get(`/chat/${convId}/messages`);
                const rawMessages = msgRes.data?.data ?? [];
                setMessages([...rawMessages].reverse());
                setLoading(false);

                // Real-time
                if ((window as any).Echo) {
                    (window as any).Echo.private(`conversation.${convId}`)
                        .listen('.message.sent', (e: any) => {
                            setMessages(prev => [...prev, e.message]);
                        });
                }
            } catch (err: any) {
                setError(err?.response?.data?.error ?? 'No se pudo iniciar el chat.');
                setLoading(false);
            }
        })();

        return () => {
            if (conversationId && (window as any).Echo) {
                (window as any).Echo.leave(`conversation.${conversationId}`);
            }
        };
    }, [orderId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim() || !conversationId || sending) return;
        setSending(true);
        try {
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await axios.post(`/chat/${conversationId}/messages`, { body }, {
                headers: { 'X-CSRF-TOKEN': csrf }
            });
            setMessages(prev => [...prev, res.data]);
            setBody('');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] flex-shrink-0">
                <div className="flex items-center gap-2">
                    <MessageCircle size={15} className="text-[var(--color-primary)]" />
                    <span className="font-black text-sm">Chat con cliente</span>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:bg-[var(--color-bg-tertiary)] transition-all">
                    <X size={14} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
                {loading && (
                    <div className="flex items-center justify-center py-10 opacity-40">
                        <Loader2 size={20} className="animate-spin" />
                    </div>
                )}
                {error && (
                    <div className="text-center py-8 text-sm text-rose-500 font-bold opacity-80">{error}</div>
                )}
                {!loading && !error && messages.length === 0 && (
                    <div className="text-center py-8 text-sm opacity-30 font-bold italic">
                        Inicia la conversación con el cliente.
                    </div>
                )}
                <AnimatePresence initial={false}>
                    {messages.map(msg => {
                        const isMe = msg.user?.id === authUser.id;
                        return (
                            <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                <Avatar name={msg.user?.name ?? '?'} color={msg.user?.avatar_color} size={26} />
                                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                                    <div className={`px-3 py-2 rounded-2xl text-sm font-medium leading-relaxed ${isMe
                                            ? 'bg-[var(--color-primary)] text-black rounded-tr-sm'
                                            : 'bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-tl-sm'
                                        }`}>
                                        {msg.body}
                                    </div>
                                    <span className="text-[10px] opacity-30 px-1 font-medium">
                                        {new Date(msg.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            {!error && !loading && (
                <form onSubmit={sendMessage} className="p-3 border-t border-[var(--color-border)] flex-shrink-0 flex gap-2">
                    <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e as any); } }}
                        placeholder="Escribe un mensaje… (Enter para enviar)"
                        rows={2}
                        className="flex-1 px-3 py-2 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all resize-none placeholder:opacity-30"
                    />
                    <button type="submit" disabled={sending || !body.trim()}
                        className="p-2.5 rounded-xl bg-[var(--color-primary)] text-black hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none self-end flex-shrink-0">
                        <Send size={15} />
                    </button>
                </form>
            )}
        </div>
    );
}
