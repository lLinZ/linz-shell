/**
 * ChatSoundContext
 *
 * Consolidates sound effect logic to a single point of truth.
 * Replaces multiple `new Audio()` instantiations across the app.
 *
 * Contract:
 *  - Only one Audio instance for the notification sound.
 *  - Exposes a stable `playNotification` function.
 */
import * as React from "react"
import { createContext, useContext, useRef, useEffect, useCallback } from "react"

interface ChatSoundContextValue {
    /** Play the incoming message notification sound. */
    playNotification: () => void
}

const ChatSoundContext = createContext<ChatSoundContextValue>({
    playNotification: () => { },
})

export function ChatSoundProvider({ children }: { children: React.ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        audioRef.current = new Audio('/sounds/notification.mp3')
    }, [])

    const playNotification = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0 // Restart if already playing
            audioRef.current.play().catch(err => {
                // Browsers often block autoplay or sound without user interaction
                console.warn("Sound reproduction blocked or failed:", err)
            })
        }
    }, [])

    return (
        <ChatSoundContext.Provider value={{ playNotification }}>
            {children}
        </ChatSoundContext.Provider>
    )
}

/** Consume the sound context in hooks or components. */
export const useChatSound = () => useContext(ChatSoundContext)
