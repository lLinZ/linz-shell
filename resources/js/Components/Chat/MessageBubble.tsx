import { cn } from "@/lib/utils";
import { User } from "@/types";

interface MessageBubbleProps {
    message: {
        id: number;
        body: string;
        created_at: string;
        user_id: number;
        user?: User;
    };
    isMe: boolean;
}

export default function MessageBubble({ message, isMe }: MessageBubbleProps) {
    return (
        <div className={cn(
            "flex w-full mt-2 space-x-3 max-w-xs md:max-w-md",
            isMe ? "ml-auto justify-end" : ""
        )}>
            {!isMe && (
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                    {/* Avatar placeholder or image */}
                    <span className="font-bold text-gray-600">{message.user?.name?.charAt(0) || '?'}</span>
                </div>
            )}
            <div
                className={cn(
                    "relative p-3 rounded-lg shadow-sm text-sm",
                    isMe
                        ? "text-white rounded-br-none"
                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none"
                )}
                style={isMe ? { backgroundColor: 'var(--color-primary)' } : {}}
            >
                {!isMe && (
                    <span className="text-xs text-blue-500 font-bold mb-1 block">
                        {message.user?.name}
                    </span>
                )}
                <p className="break-all whitespace-pre-wrap text-left">{message.body}</p>
                <span className={cn(
                    "text-[10px] block mt-1 opacity-70",
                    isMe ? "text-white/80" : "text-gray-400"
                )}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
}
