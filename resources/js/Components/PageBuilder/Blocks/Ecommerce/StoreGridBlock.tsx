import React from 'react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { blockRegistry, BlockProps } from '../../BlockRegistry';

/**
 * StoreGridBlock component for the 'Ecommerce' namespace.
 * Placeholder for the product grid module.
 */
const StoreGridBlock: React.FC<BlockProps> = ({ payload }) => {
    return (
        <Surface variant="secondary" size="lg" className="my-12">
            <Typography variant="h2" className="text-center mb-8">
                {payload.title || 'Nuestra Tienda'}
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Product cards will be injected here by the Ecommerce module logic */}
                <Typography variant="muted" className="col-span-full text-center py-20 border-2 border-dashed border-[var(--color-border)] rounded-xl">
                    Módulo de Inventario: StoreGridBlock (Namespace: Ecommerce) listo para vinculación.
                </Typography>
            </div>
        </Surface>
    );
};

// Register the block in the Ecommerce namespace
blockRegistry.register('Ecommerce', 'ProductGrid', StoreGridBlock);

export default StoreGridBlock;
