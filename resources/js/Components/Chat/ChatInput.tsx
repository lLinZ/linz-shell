import { useState, FormEvent } from "react";
import { Send, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    onTyping: () => void;
    disabled?: boolean;
}

export default function ChatInput({ onSendMessage, onTyping, disabled }: ChatInputProps) {
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
        <form onSubmit={handleSubmit} className="border-t p-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-primary)' }}>
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={message}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder="Escribe un mensaje..."
                    className="w-full rounded-full py-3 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-app-accent transition-all border-none bg-white/5 text-app-text"
                />
                <button
                    type="submit"
                    disabled={!message.trim() || disabled}
                    className={cn(
                        "absolute right-2 p-2 rounded-full transition-colors",
                        message.trim()
                            ? "bg-app-accent text-black hover:bg-app-accent-hover"
                            : "bg-white/10 text-app-text/30 cursor-not-allowed"
                    )}
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </form>
    );
}
