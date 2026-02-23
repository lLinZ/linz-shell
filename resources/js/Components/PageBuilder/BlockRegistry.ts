import React from 'react';

export interface BlockProps {
    payload: any;
}

export type BlockComponent = React.ComponentType<BlockProps>;

class BlockRegistry {
    private registry: Map<string, Map<string, BlockComponent>> = new Map();

    /**
     * Register a block component for a specific module and block type.
     */
    register(moduleNamespace: string, blockType: string, component: BlockComponent) {
        if (!this.registry.has(moduleNamespace)) {
            this.registry.set(moduleNamespace, new Map());
        }
        this.registry.get(moduleNamespace)!.set(blockType, component);
    }

    /**
     * Get a block component by its module and type.
     */
    get(moduleNamespace: string, blockType: string): BlockComponent | null {
        return this.registry.get(moduleNamespace)?.get(blockType) || null;
    }
}

export const blockRegistry = new BlockRegistry();
