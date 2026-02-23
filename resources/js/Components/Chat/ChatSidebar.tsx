import * as React from "react"
import { Surface } from "@/Components/ui/Surface"
import { Input } from "@/Components/ui/input"
import { Typography } from "@/Components/ui/Typography"
import { Button } from "@/Components/ui/button"
import { SidebarItem } from "./SidebarItem"
import { SidebarSection } from "./SidebarSection"
import { useSidebarUsers } from "@/Hooks/useSidebarUsers"
import { Plus } from "lucide-react"

interface ChatSidebarProps {
    conversations: any[]
    allUsers: any[]
    onlineUserIds: number[]
    activeConversationId: number
    searchQuery: string
    setSearchQuery: (query: string) => void
    onSelectConversation: (id: number) => void
    onStartChat: (user: any) => void
    onAddGroup?: (name: string) => void
    currentUser?: any
    globalUsers: any[]
    filteredConversations: any[]
}

export const ChatSidebar = ({
    conversations,
    allUsers,
    onlineUserIds,
    activeConversationId,
    searchQuery,
    setSearchQuery,
    onSelectConversation,
    onStartChat,
    onAddGroup,
    currentUser,
    globalUsers,
    filteredConversations
}: ChatSidebarProps) => {

    const { groups, onlineUsers, offlineUsers } = useSidebarUsers(conversations, allUsers, onlineUserIds);

    const handleItemClick = (user: any) => {
        if (user.conversation_id) {
            onSelectConversation(user.conversation_id);
        } else {
            onStartChat(user);
        }
    };

    const handleCreateGroup = () => {
        const name = prompt("Nombre del nuevo grupo:");
        if (name && onAddGroup) {
            onAddGroup(name);
        }
    };

    return (
        <Surface variant="primary" size="none" shadow="none" border={false} rounding="none" className="w-full h-full flex flex-col overflow-hidden">
            {/* Search Header */}
            <Surface variant="flat" size="none" border={false} shadow="none" className="border-b border-[var(--color-border)] p-3 md:p-4">
                <div className="flex items-center gap-2">
                    <Input
                        type="text"
                        placeholder="Buscar chat..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-[var(--color-bg-tertiary)]"
                    />
                    {currentUser?.role === 'admin' && (
                        <Button
                            size="none"
                            onClick={handleCreateGroup}
                            className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors shadow-sm"
                            title="Crear Nuevo Grupo"
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </Surface>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {!searchQuery ? (
                    <>
                        <SidebarSection title="Grupos">
                            {groups.map((group: any) => (
                                <SidebarItem
                                    key={`group_${group.id}`}
                                    user={group}
                                    isActive={activeConversationId === group.conversation_id}
                                    onClick={() => handleItemClick(group)}
                                />
                            ))}
                        </SidebarSection>

                        <SidebarSection
                            title="En línea"
                            count={onlineUsers.length}
                            titleColor="text-green-600 dark:text-green-400"
                        >
                            {onlineUsers.map((user: any) => (
                                <SidebarItem
                                    key={user.id}
                                    user={user}
                                    status="online"
                                    isActive={activeConversationId === user.conversation_id}
                                    onClick={() => handleItemClick(user)}
                                />
                            ))}
                        </SidebarSection>

                        <SidebarSection title="Desconectado" count={offlineUsers.length}>
                            {offlineUsers.map((user: any) => (
                                <SidebarItem
                                    key={user.id}
                                    user={user}
                                    status="offline"
                                    isActive={activeConversationId === user.conversation_id}
                                    onClick={() => handleItemClick(user)}
                                />
                            ))}
                        </SidebarSection>
                    </>
                ) : (
                    <>
                        <SidebarSection title="Conversaciones">
                            {filteredConversations.map((conv: any) => (
                                <SidebarItem
                                    key={`conv_${conv.id}`}
                                    user={{
                                        ...conv,
                                        conversation_id: conv.id,
                                        is_group: !conv.is_private
                                    }}
                                    isActive={activeConversationId === conv.id}
                                    status={conv.is_private ? (onlineUserIds.includes(conv.other_user_id) ? "online" : "offline") : null}
                                    onClick={() => onSelectConversation(conv.id)}
                                />
                            ))}
                        </SidebarSection>

                        <SidebarSection title="Otros Usuarios">
                            {globalUsers.map(user => (
                                <SidebarItem
                                    key={`global_${user.id}`}
                                    user={user}
                                    onClick={() => onStartChat(user)}
                                />
                            ))}
                        </SidebarSection>

                        {filteredConversations.length === 0 && globalUsers.length === 0 && (
                            <div className="p-8 text-center">
                                <Typography variant="muted">No se encontraron resultados para "{searchQuery}"</Typography>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Surface>
    )
}
