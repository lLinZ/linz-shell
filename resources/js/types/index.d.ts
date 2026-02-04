export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: 'admin' | 'user';
    avatar_color: string;
    dark_mode: boolean;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

export interface Conversation {
    id: number;
    name: string;
    is_private: boolean;
    unread_count?: number;
    avatar_color?: string;
}
