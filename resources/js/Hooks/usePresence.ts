import { usePresence as useGlobalPresence } from '@/Components/Chat/PresenceContext';

/**
 * Hook to manage global user presence using Laravel Echo.
 * Returns an array of user IDs that are currently online.
 * Now acts as a proxy to the global PresenceContext.
 */
export function usePresence() {
    return useGlobalPresence();
}
