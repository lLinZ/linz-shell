import { lazy, ComponentType } from 'react';

export interface BlockProps {
    payload: any;
}

export type BlockComponent = ComponentType<BlockProps>;

/**
 * Dynamic registry mapping block types to their lazy-loaded components.
 * This triggers code splitting, ensuring that block code is only downloaded
 * when a block of that type is actually rendered on the page.
 */
const registry: Record<string, Record<string, any>> = {
    Core: {
        Hero: lazy(() => import('./Blocks/Core/HeroBlock')),
        InteractiveHero: lazy(() => import('./Blocks/Core/InteractiveHeroBlock')),
        Features: lazy(() => import('./Blocks/Core/FeaturesBlock')),
        Footer: lazy(() => import('./Blocks/Core/FooterBlock')),
        DynamicForm: lazy(() => import('./Blocks/Core/DynamicFormBlock')),
        ReviewsCarousel: lazy(() => import('./Blocks/Core/ReviewsCarouselBlock')),
    },
    Ecommerce: {
        ProductGrid: lazy(() => import('./Blocks/Ecommerce/StoreGridBlock')),
    }
};

class BlockRegistry {
    /**
     * Get a lazy-loaded block component by its module and type.
     */
    get(moduleNamespace: string, blockType: string): BlockComponent | null {
        return registry[moduleNamespace]?.[blockType] || null;
    }

    /**
     * Legacy register method kept for backward compatibility if needed,
     * but dynamic imports defined above take precedence.
     */
    register(moduleNamespace: string, blockType: string, component: BlockComponent) {
        // No-op in dynamic mode or could be used for testing
    }
}

export const blockRegistry = new BlockRegistry();
