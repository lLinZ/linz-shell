import React from 'react';
import { blockRegistry } from './BlockRegistry';

interface BlockData {
    module_namespace: string;
    block_type: string;
    payload_json: any;
}

interface BlockRendererProps {
    blocks: BlockData[];
}

/**
 * Orchestrator component that renders a list of blocks using the BlockRegistry.
 * Silently fails (returns null) if a block type or module is not registered.
 */
export default function BlockRenderer({ blocks }: BlockRendererProps) {
    return (
        <div className="flex flex-col w-full">
            {blocks.map((block, index) => {
                const Component = blockRegistry.get(block.module_namespace, block.block_type);

                if (!Component) {
                    // Fail silently if block/module is missing or deactivated
                    return null;
                }

                return (
                    <Component
                        key={`${block.module_namespace}-${block.block_type}-${index}`}
                        payload={block.payload_json}
                    />
                );
            })}
        </div>
    );
}
