/**
 * ChatMenuContext
 *
 * Manages the "which bubble's context menu is open" state at the
 * MessageList level. Replaces the previous window.dispatchEvent approach
 * (chat:closeAllMenus) with a typed, React-native mechanism.
 *
 * Contract:
 *  - Only one context menu can be open at a time (identified by message.id).
 *  - Calling openMenu(id) automatically closes any previously open menu
 *    by overwriting openMenuId — no broadcast needed.
 *  - MessageBubble compares `openMenuId === message.id` to decide visibility.
 */
import * as React from "react"
import { createContext, useContext, useState, useCallback } from "react"

interface ChatMenuContextValue {
    /** The message.id whose context menu is currently open. null = none. */
    openMenuId: number | null
    /** Open the context menu for the given message, closing any other. */
    openMenu: (id: number) => void
    /** Close the currently open context menu. */
    closeMenu: () => void
}

const ChatMenuContext = createContext<ChatMenuContextValue>({
    openMenuId: null,
    openMenu: () => { },
    closeMenu: () => { },
})

export function ChatMenuProvider({ children }: { children: React.ReactNode }) {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null)

    const openMenu = useCallback((id: number) => setOpenMenuId(id), [])
    const closeMenu = useCallback(() => setOpenMenuId(null), [])

    return (
        <ChatMenuContext.Provider value={{ openMenuId, openMenu, closeMenu }}>
            {children}
        </ChatMenuContext.Provider>
    )
}

/** Consume the menu control context inside any MessageBubble */
export const useChatMenu = () => useContext(ChatMenuContext)
