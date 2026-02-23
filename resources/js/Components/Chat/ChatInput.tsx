import * as React from "react"
import { useState, FormEvent } from "react"
import { Send, X, CornerUpLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Surface } from "@/Components/ui/Surface"
import { Input } from "@/Components/ui/input"
import { Button } from "@/Components/ui/button"
import { Typography } from "@/Components/ui/Typography"

interface ReplyingTo {
    id: number;
    body: string;
    user?: { name: string };
}

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    onTyping: () => void;
    disabled?: boolean;
    replyingTo?: ReplyingTo | null;
    onCancelReply?: () => void;
}

export default function ChatInput({ onSendMessage, onTyping, disabled, replyingTo, onCancelReply }: ChatInputProps) {
    const [message, setMessage] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        onSendMessage(message);
        setMessage("");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        onTyping();
    };

    return (
        <Surface variant="flat" size="none" className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            {/* Reply preview banner */}
            {replyingTo && (
                <div className="flex items-center justify-between px-4 py-2 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <CornerUpLeft className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                        <div className="min-w-0">
                            <Typography variant="small" className="font-semibold text-[var(--color-primary)] block">
                                Respondiendo a {replyingTo.user?.name ?? 'usuario'}
                            </Typography>
                            <Typography variant="muted" className="text-[11px] truncate block max-w-[280px]">
                                {replyingTo.body}
                            </Typography>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="none"
                        onClick={onCancelReply}
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors ml-2"
                    >
                        <X className="w-3.5 h-3.5" />
                    </Button>
                </div>
            )}

            {/* Input row */}
            <div className="px-4 py-3 pb-6 md:pb-4">
                <form onSubmit={handleSubmit} className="relative flex items-center max-w-5xl mx-auto w-full">
                    <Input
                        type="text"
                        value={message}
                        onChange={handleChange}
                        disabled={disabled}
                        placeholder="Escribe un mensaje..."
                        className="w-full h-11 rounded-full pr-12 bg-[var(--color-bg-tertiary)] border-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-shadow transition-all"
                    />
                    <Button
                        type="submit"
                        size="none"
                        disabled={!message.trim() || disabled}
                        className={cn(
                            "absolute right-1.5 p-2.5 rounded-full transition-all duration-300",
                            message.trim()
                                ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-md shadow-[var(--color-primary)]/20"
                                : "text-[var(--color-text-muted)] opacity-30 cursor-not-allowed scale-90"
                        )}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </Surface>
    );
}
