import { useState, useEffect } from 'react';
import axios from 'axios';

export function useParticipantsManagement(conversationId: number, refreshUsers: () => void) {
    const [searchUserQuery, setSearchUserQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!searchUserQuery.trim() || !conversationId) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            setIsSearching(true);
            axios.get(`/chat/${conversationId}/search-users?query=${searchUserQuery}`)
                .then(res => setSearchResults(res.data))
                .catch(err => console.error(err))
                .finally(() => setIsSearching(false));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchUserQuery, conversationId]);

    const addUser = async (userId: number) => {
        try {
            await axios.post(`/chat/${conversationId}/users`, { user_id: userId });
            refreshUsers();
            setSearchUserQuery('');
            setSearchResults([]);
        } catch (error) {
            console.error(error);
            alert("Error al agregar usuario");
        }
    };

    const removeUser = async (userId: number) => {
        if (!confirm("¿Seguro que quieres eliminar a este usuario del chat?")) return;
        try {
            await axios.delete(`/chat/${conversationId}/users`, { data: { user_id: userId } });
            refreshUsers();
        } catch (error) {
            console.error(error);
            alert("Error al eliminar usuario");
        }
    };

    return {
        searchUserQuery,
        setSearchUserQuery,
        searchResults,
        isSearching,
        addUser,
        removeUser
    };
}
