import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: number;
    name: string;
    price: number | string;
    quantity: number;
    image_url: string | null;
    description?: string;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    addItem: (product: { id: number; name: string; price: number | string; image_url: string | null; description?: string }) => void;
    removeItem: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    toggleCart: (open?: boolean) => void;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (product) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((item) => item.id === product.id);

                if (existingItem) {
                    set({
                        items: currentItems.map((item) =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                    });
                } else {
                    set({
                        items: [
                            ...currentItems,
                            {
                                ...product,
                                quantity: 1,
                            },
                        ],
                    });
                }
                set({ isOpen: true });
            },

            removeItem: (id) => {
                set({
                    items: get().items.filter((item) => item.id !== id),
                });
            },

            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(id);
                    return;
                }
                set({
                    items: get().items.map((item) =>
                        item.id === id ? { ...item, quantity } : item
                    ),
                });
            },

            clearCart: () => set({ items: [] }),

            toggleCart: (open) => set((state) => ({ isOpen: open ?? !state.isOpen })),

            getTotal: () => {
                return get().items.reduce((total, item) => {
                    return total + Number(item.price) * item.quantity;
                }, 0);
            },

            getItemCount: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },
        }),
        {
            name: 'linz-cart-storage',
        }
    )
);
