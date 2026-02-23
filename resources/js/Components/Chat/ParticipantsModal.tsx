import * as React from "react"
import { Fragment } from "react"
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react'
import { X } from "lucide-react"
import { Typography } from "@/Components/ui/Typography"
import { Input } from "@/Components/ui/input"
import { Surface } from "@/Components/ui/Surface"
import Avatar from "@/Components/ui/Avatar"
import { useParticipantsManagement } from "@/Hooks/useParticipantsManagement"
import { ParticipantItem } from "./ParticipantItem"
import { Button } from "@/Components/ui/button"

interface ParticipantsModalProps {
    isOpen: boolean
    onClose: () => void
    conversation: any
    currentUser: any
    allUsers: any[]
    onlineUsers: any[]
    refreshUsers: () => void
}

export const ParticipantsModal = ({
    isOpen,
    onClose,
    conversation,
    currentUser,
    allUsers,
    onlineUsers,
    refreshUsers
}: ParticipantsModalProps) => {
    const {
        searchUserQuery,
        setSearchUserQuery,
        searchResults,
        isSearching,
        addUser,
        removeUser
    } = useParticipantsManagement(conversation.id, refreshUsers);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform transition-all">
                                <Surface variant="secondary" size="lg" shadow="lg" border={true} rounding="xl" className="text-left">
                                    <div className="flex justify-between items-center mb-6">
                                        <DialogTitle as="div">
                                            <Typography variant="h4" className="text-[var(--color-text-primary)]">
                                                Participantes ({allUsers.length})
                                            </Typography>
                                        </DialogTitle>
                                        <Button
                                            variant="ghost"
                                            size="none"
                                            onClick={onClose}
                                            className="p-1.5 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    {currentUser.role === 'admin' && !conversation.is_private && (
                                        <Surface variant="tertiary" size="sm" border={true} rounding="lg" className="mb-6">
                                            <Typography variant="small" className="text-[var(--color-text-secondary)] mb-3 uppercase font-bold text-[10px] tracking-widest">
                                                Agregar Usuario
                                            </Typography>
                                            <Input
                                                placeholder="Buscar por nombre o email..."
                                                value={searchUserQuery}
                                                onChange={(e) => setSearchUserQuery(e.target.value)}
                                                className="mb-2 bg-[var(--color-bg-primary)]"
                                            />
                                            {isSearching && (
                                                <div className="flex items-center space-x-2 px-1">
                                                    <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                                                    <Typography variant="muted" className="text-xs">Buscando...</Typography>
                                                </div>
                                            )}
                                            {searchResults.length > 0 && (
                                                <div className="max-h-40 overflow-y-auto space-y-1 mt-2 custom-scrollbar">
                                                    {searchResults.map(user => (
                                                        <Button
                                                            key={user.id}
                                                            variant="ghost"
                                                            size="none"
                                                            onClick={() => addUser(user.id)}
                                                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-primary)]/10 text-left group transition-all h-auto"
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <Avatar name={user.name} color={user.avatar_color} size="sm" />
                                                                <Typography variant="small" className="text-[var(--color-text-primary)]">{user.name}</Typography>
                                                            </div>
                                                            <Typography variant="small" className="text-[var(--color-primary)] font-bold text-[10px] opacity-0 group-hover:opacity-100 uppercase tracking-tighter">AGREGAR</Typography>
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}
                                        </Surface>
                                    )}

                                    <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                                        {allUsers.map(user => (
                                            <ParticipantItem
                                                key={user.id}
                                                user={user}
                                                isOnline={onlineUsers.some(u => u.id === user.id)}
                                                canRemove={currentUser.role === 'admin' && user.id !== currentUser.id && !conversation.is_private}
                                                onRemove={removeUser}
                                            />
                                        ))}
                                    </div>
                                </Surface>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
