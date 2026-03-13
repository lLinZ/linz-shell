import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    description?: string;
    duration?: number;
}

interface ToastState {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({ toasts: [...state.toasts, { id, ...toast }] }));
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, toast.duration || 4000);
    },
    removeToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Helper object for easy importing and calling outside a hook
export const toast = {
    success: (message: string, description?: string, duration?: number) => useToastStore.getState().addToast({ type: 'success', message, description, duration }),
    error: (message: string, description?: string, duration?: number) => useToastStore.getState().addToast({ type: 'error', message, description, duration }),
    info: (message: string, description?: string, duration?: number) => useToastStore.getState().addToast({ type: 'info', message, description, duration }),
    warning: (message: string, description?: string, duration?: number) => useToastStore.getState().addToast({ type: 'warning', message, description, duration }),
};
