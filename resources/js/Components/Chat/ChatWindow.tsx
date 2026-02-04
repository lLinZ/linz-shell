import { useRef, useEffect, useState } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { useChat } from "@/Hooks/useChat";
import { User, Conversation } from "@/types";
import { Users, X, Pen, Check } from "lucide-react";
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import axios from "axios";

interface ChatWindowProps {
    conversation: Conversation;
    currentUser: User;
    onUpdate?: (conversation: Partial<Conversation>) => void;
}

export default function ChatWindow({ conversation, currentUser, onUpdate }: ChatWindowProps) {
    // Guard clause if no conversation is selected
    if (!conversation) {
        return (
            <div className="h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}>
                <p>Selecciona un chat para comenzar</p>
            </div>
        );
    }

    const {
        messages, isTyping, sendMessage, sendTyping, onlineUsers, allUsers, refreshUsers,
        loading, loadingMore, hasMore, loadMore
    } = useChat(conversation.id, currentUser.id);
    const bottomRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);

    // User Management State
    const [searchUserQuery, setSearchUserQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Editing state
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);

    // Auto-scroll to bottom on new messages (logic refined)
    // We only auto-scroll if we are NOT loading history.

    // Handle Scroll for Infinite Loading
    const handleScroll = () => {
        if (!messagesContainerRef.current) return;
        const { scrollTop } = messagesContainerRef.current;

        if (scrollTop === 0 && hasMore && !loadingMore) {
            // Save current scroll height to restore position after load
            const currentScrollHeight = messagesContainerRef.current.scrollHeight;
            isLoadingOlderRef.current = true; // Set flag before loading
            loadMore();
            (messagesContainerRef.current as any).prevScrollHeight = currentScrollHeight;
        }
    };

    // Keep track of the previous message count to detect if messages were prepended (loaded old) or appended (new)
    const prevMessageCountRef = useRef(messages.length);
    const isLoadingOlderRef = useRef(false);

    // Restore scroll position after loading more
    useEffect(() => {
        if (!loadingMore && messagesContainerRef.current && (messagesContainerRef.current as any).prevScrollHeight) {
            const newScrollHeight = messagesContainerRef.current.scrollHeight;
            const diff = newScrollHeight - (messagesContainerRef.current as any).prevScrollHeight;
            messagesContainerRef.current.scrollTop = diff;
            (messagesContainerRef.current as any).prevScrollHeight = null;
            isLoadingOlderRef.current = false; // Reset flag
        }
    }, [messages, loadingMore]);

    // Initial scroll and Auto-scroll on new message
    useEffect(() => {
        // Only auto-scroll if:
        // 1. Not loading initial messages
        // 2. Not loading older messages (infinite scroll)
        // 3. Message count increased (new message arrived)
        const messageCountIncreased = messages.length > prevMessageCountRef.current;

        if (!loadingMore && !loading && messageCountIncreased && !isLoadingOlderRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }

        prevMessageCountRef.current = messages.length;
    }, [messages.length, isTyping, loading]);

    // Search Users Effect
    useEffect(() => {
        if (!searchUserQuery.trim() || !conversation.id) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            setIsSearching(true);
            axios.get(`/chat/${conversation.id}/search-users?query=${searchUserQuery}`)
                .then(res => setSearchResults(res.data))
                .catch(err => console.error(err))
                .finally(() => setIsSearching(false));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchUserQuery, conversation.id]);

    // Add User
    const addUser = async (userId: number) => {
        try {
            await axios.post(`/chat/${conversation.id}/users`, { user_id: userId });
            refreshUsers();
            setSearchUserQuery('');
            setSearchResults([]);
        } catch (error) {
            console.error(error);
            alert("Error al agregar usuario");
        }
    };

    // Remove User
    const removeUser = async (userId: number) => {
        if (!confirm("¿Seguro que quieres eliminar a este usuario del chat?")) return;
        try {
            await axios.delete(`/chat/${conversation.id}/users`, { data: { user_id: userId } });
            refreshUsers();
        } catch (error) {
            console.error(error);
            alert("Error al eliminar usuario");
        }
    };

    // Handle Edit Start
    const startEditing = () => {
        setEditName(conversation.name);
        setIsEditingName(true);
    };

    // Handle Save Name
    const saveName = async () => {
        if (!editName.trim() || editName === conversation.name) {
            setIsEditingName(false);
            return;
        }

        setIsSavingName(true);
        try {
            await axios.patch(`/chat/${conversation.id}/name`, { name: editName });
            if (onUpdate) onUpdate({ ...conversation, name: editName });
            setIsEditingName(false);
        } catch (error) {
            console.error("Failed to update name:", error);
            alert("Error al actualizar el nombre");
        } finally {
            setIsSavingName(false);
        }
    };

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            {/* Header */}
            <div className="h-16 border-b flex items-center justify-between px-6 shadow-sm z-10" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-primary)' }}>
                <div className="flex items-center space-x-3 flex-1">
                    {isEditingName ? (
                        <div className="flex items-center space-x-2 w-full max-w-sm">
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="flex-1 rounded-md border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm dark:text-white py-1 px-2 focus:ring-blue-500 focus:border-blue-500"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveName();
                                    if (e.key === 'Escape') setIsEditingName(false);
                                }}
                            />
                            <button
                                onClick={saveName}
                                disabled={isSavingName}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsEditingName(false)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2 group">
                            <h3 className="font-bold text-gray-800 dark:text-white text-lg truncate">
                                {conversation.name}
                            </h3>
                            {/* Only Admins can edit generic (non-private) chat names */}
                            {!conversation.is_private && currentUser.role === 'admin' && (
                                <button
                                    onClick={startEditing}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-blue-500"
                                    title="Editar nombre"
                                >
                                    <Pen className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setIsUsersModalOpen(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-2"
                >
                    <Users className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {loading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {!loading && (
                    <>
                        {loadingMore && (
                            <div className="flex justify-center py-2 h-8">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                            </div>
                        )}

                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <p>No hay mensajes aún.</p>
                                <p className="text-sm">¡Sé el primero en hablar!</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <MessageBubble
                                    key={msg.id || idx}
                                    message={msg}
                                    isMe={msg.user_id === currentUser.id}
                                />
                            ))
                        )}

                        {isTyping && (
                            <div className="text-xs text-gray-500 ml-12 animate-pulse">
                                Alguien está escribiendo...
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <ChatInput onSendMessage={sendMessage} onTyping={sendTyping} />

            {/* Users Modal */}
            <Transition appear show={isUsersModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsUsersModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                                    <div className="flex justify-between items-center mb-4">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                                        >
                                            Participantes ({allUsers.length})
                                        </Dialog.Title>
                                        <button
                                            onClick={() => setIsUsersModalOpen(false)}
                                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Admin Add User Section */}
                                    {currentUser.role === 'admin' && !conversation.is_private && (
                                        <div className="mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">Agregar Usuario</p>
                                            <input
                                                type="text"
                                                placeholder="Buscar por nombre o email..."
                                                value={searchUserQuery}
                                                onChange={(e) => setSearchUserQuery(e.target.value)}
                                                className="w-full text-sm rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white mb-2"
                                            />
                                            {isSearching && <p className="text-xs text-gray-500">Buscando...</p>}
                                            {searchResults.length > 0 && (
                                                <div className="max-h-32 overflow-y-auto space-y-1 mt-2">
                                                    {searchResults.map(user => (
                                                        <button
                                                            key={user.id}
                                                            onClick={() => addUser(user.id)}
                                                            className="w-full flex items-center justify-between p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-left group"
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <div
                                                                    className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs"
                                                                    style={{ backgroundColor: user.avatar_color || '#3b82f6' }}
                                                                >
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="text-sm dark:text-gray-200">{user.name}</span>
                                                            </div>
                                                            <span className="text-xs text-blue-600 font-bold opacity-0 group-hover:opacity-100">AGREGAR</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-4 max-h-[40vh] overflow-y-auto space-y-3">
                                        {allUsers.map(user => {
                                            const isOnline = onlineUsers.some(u => u.id === user.id);
                                            const canRemove = currentUser.role === 'admin' && user.id !== currentUser.id && !conversation.is_private;

                                            return (
                                                <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 group">
                                                    <div className="flex items-center space-x-3">
                                                        <div
                                                            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                                            style={{ backgroundColor: user.avatar_color || '#3b82f6' }}
                                                        >
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                                                            <p className="text-xs text-gray-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex items-center space-x-1">
                                                            <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                                            <span className="text-xs text-gray-500 w-10">{isOnline ? 'Online' : 'Offline'}</span>
                                                        </div>
                                                        {canRemove && (
                                                            <button
                                                                onClick={() => removeUser(user.id)}
                                                                className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all"
                                                                title="Eliminar usuario"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
