import React, { useEffect } from 'react';
import { useCartStore } from '@/Stores/useCartStore';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CartDrawer() {
    const {
        items,
        isOpen,
        toggleCart,
        updateQuantity,
        removeItem,
        getTotal,
        getItemCount
    } = useCartStore();

    // Prevent scrolling when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const formatPrice = (price: string | number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Number(price));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex justify-end">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => toggleCart(false)}
            />

            {/* Drawer Content */}
            <Surface
                variant="primary"
                className={cn(
                    "relative w-full max-w-md h-full shadow-2xl flex flex-col transition-transform duration-500 transform",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-[var(--color-primary)]" />
                        <Typography variant="h3">Tu Carrito</Typography>
                        <Surface variant="secondary" size="sm" rounding="full" className="px-2">
                            <Typography variant="small" className="font-bold text-[var(--color-primary)]">
                                {getItemCount()}
                            </Typography>
                        </Surface>
                    </div>
                    <Button variant="ghost" size="none" onClick={() => toggleCart(false)} className="p-2">
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <Surface variant="secondary" className="p-8 rounded-full mb-4">
                                <ShoppingBag className="w-12 h-12 opacity-20" />
                            </Surface>
                            <Typography variant="h4" className="mb-2">El carrito está vacío</Typography>
                            <Typography variant="muted">Agrega algunos productos para comenzar tu compra.</Typography>
                        </div>
                    ) : (
                        items.map((item: any) => (
                            <Surface key={item.id} variant="secondary" border className="p-4 rounded-2xl flex gap-4 group">
                                <div className="w-20 h-20 rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-primary)] shrink-0">
                                    <img src={item.image_url || ''} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <Typography variant="p" className="font-bold leading-tight line-clamp-1">{item.name}</Typography>
                                            <Button
                                                variant="ghost"
                                                size="none"
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <Typography variant="small" className="text-[var(--color-primary)] font-bold">
                                            {formatPrice(item.price)}
                                        </Typography>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center border border-[var(--color-border)] rounded-lg overflow-hidden h-8">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="px-2 hover:bg-[var(--color-bg-primary)] transition-colors border-r border-[var(--color-border)]"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="px-3 text-xs font-bold">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="px-2 hover:bg-[var(--color-bg-primary)] transition-colors border-l border-[var(--color-border)]"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <Typography variant="small" className="font-bold">
                                            {formatPrice(Number(item.price) * item.quantity)}
                                        </Typography>
                                    </div>
                                </div>
                            </Surface>
                        ))
                    )}
                </div>

                {/* Footer / Summary */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Typography variant="muted">Subtotal</Typography>
                                <Typography variant="p">{formatPrice(getTotal())}</Typography>
                            </div>
                            <div className="flex justify-between">
                                <Typography variant="muted">Envío</Typography>
                                <Typography variant="p" className="text-green-500 font-bold">Gratis</Typography>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-[var(--color-border)]">
                                <Typography variant="h4">Total</Typography>
                                <Typography variant="h3" className="text-[var(--color-primary)]">
                                    {formatPrice(getTotal())}
                                </Typography>
                            </div>
                        </div>

                        <Button className="w-full py-8 rounded-2xl font-bold flex items-center justify-center gap-2 group">
                            Proceder al Pago
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                )}
            </Surface>
        </div>
    );
}
