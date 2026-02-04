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
                    className="w-full rounded-full py-3 px-5 pr-12 focus:outline-none focus:ring-2 transition-all border-none"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                />
                <button
                    type="submit"
                    disabled={!message.trim() || disabled}
                    className={cn(
                        "absolute right-2 p-2 rounded-full transition-colors",
                        message.trim()
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700"
                    )}
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </form>
    );
}
