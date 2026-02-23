import React from 'react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { blockRegistry, BlockProps } from '../../BlockRegistry';
import { ShoppingCart } from 'lucide-react';

/**
 * StoreGridBlock component for the 'Ecommerce' namespace.
 * Renders a grid of products hydrated from the backend.
 */
const StoreGridBlock: React.FC<BlockProps> = ({ payload }) => {
    const products = payload.products || [];

    // Helper to format price
    const formatPrice = (price: string | number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Number(price));
    };

    return (
        <section className="py-24 px-6 md:px-12 bg-[var(--color-bg-primary)]">
            <div className="max-w-7xl mx-auto">
                {payload.title && (
                    <Typography variant="h2" className="text-4xl font-black mb-12 text-center">
                        {payload.title}
                    </Typography>
                )}

                {products.length === 0 ? (
                    <Surface variant="secondary" className="p-12 text-center rounded-3xl border border-dashed border-[var(--color-border)]">
                        <Typography variant="muted" className="text-lg">
                            No hay productos disponibles en este momento.
                        </Typography>
                    </Surface>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product: any) => (
                            <Surface
                                key={product.id}
                                border
                                variant="tertiary"
                                className="overflow-hidden flex flex-col group hover:shadow-2xl hover:border-[var(--color-primary)]/50 transition-all duration-300 rounded-3xl"
                            >
                                {/* Product Image */}
                                <div className="aspect-square w-full overflow-hidden bg-[var(--color-bg-secondary)] relative">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {product.stock <= 5 && product.stock > 0 && (
                                        <div className="absolute top-4 left-4">
                                            <Surface variant="primary" size="sm" rounding="full" className="bg-orange-500/10 border-orange-500/20">
                                                <Typography variant="small" className="text-orange-500 font-bold text-[10px]">
                                                    ¡ÚLTIMAS UNIDADES!
                                                </Typography>
                                            </Surface>
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex-1">
                                        <Typography variant="h4" className="text-xl font-bold mb-2 line-clamp-1">
                                            {product.name}
                                        </Typography>
                                        <Typography variant="small" className="text-[var(--color-text-muted)] line-clamp-2 mb-4 h-10">
                                            {product.description}
                                        </Typography>
                                    </div>

                                    <div className="mt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <Typography variant="h3" className="text-2xl font-black text-[var(--color-primary)]">
                                                {formatPrice(product.price)}
                                            </Typography>
                                            {product.stock > 0 ? (
                                                <Typography variant="small" className="text-green-500 font-bold">
                                                    En Inventario
                                                </Typography>
                                            ) : (
                                                <Typography variant="small" className="text-red-500 font-bold">
                                                    Agotado
                                                </Typography>
                                            )}
                                        </div>

                                        <Button
                                            className="w-full py-6 rounded-xl font-bold flex gap-2 items-center justify-center transition-all active:scale-95"
                                            disabled={product.stock <= 0}
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            Añadir al Carrito
                                        </Button>
                                    </div>
                                </div>
                            </Surface>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

// Register the block in the 'Ecommerce' namespace
blockRegistry.register('Ecommerce', 'ProductGrid', StoreGridBlock);

export default StoreGridBlock;
