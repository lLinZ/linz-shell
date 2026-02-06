export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    avatar_color?: string;
    dark_mode?: boolean;
    role?: string;
    is_active: boolean;
}

export interface MenuItem {
    id: number;
    label: string;
    route?: string;
    url?: string;
    icon?: string;
    children?: MenuItem[];
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    modules: any[];
    menu: MenuItem[];
};

export interface Conversation {
    id: number;
    name: string;
    is_private: boolean;
    unread_count?: number;
    avatar_color?: string;
}
