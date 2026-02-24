import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { blockRegistry } from './BlockRegistry';
import { cn } from '@/lib/utils';

interface BlockData {
    module_namespace: string;
    block_type: string;
    payload_json: any;
}

interface BlockRendererProps {
    blocks: BlockData[];
}

/**
 * Individual block wrapper to handle parallax effects with framer-motion.
 * Orchestrates background layers and content alignment.
 */
const BlockWrapper = ({ block, index }: { block: BlockData; index: number }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Global scroll progress for the specific block
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const payload = block.payload_json || {};
    const styles = payload.styles || {};

    // Support for background image (can be overridden by specialized blocks like InteractiveHero)
    const bgImage = styles.background_image || payload.background_image;
    const hasBg = !!bgImage;
    const isParallax = styles.parallax === true;
    const overlayOpacity = styles.overlay_opacity !== undefined ? styles.overlay_opacity : (hasBg ? 0.5 : 0);

    // Parallax movement calculation
    const yValue = useTransform(scrollYProgress, [0, 1], [-200, 200]);
    const y = useSpring(yValue, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const Component = blockRegistry.get(block.module_namespace, block.block_type);

    if (!Component) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full overflow-hidden"
        >
            {/* Generic Background Layer (Framer Motion) */}
            {hasBg && (
                <motion.div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${bgImage})`,
                        y: isParallax ? y : 0,
                        scale: isParallax ? 1.4 : 1,
                        willChange: 'transform'
                    }}
                />
            )}

            {/* Global Readability Overlay */}
            {overlayOpacity > 0 && (
                <div
                    className="absolute inset-0 z-[5] pointer-events-none"
                    style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
                />
            )}

            {/* Block content */}
            <div className="relative z-10 w-full">
                <Component
                    payload={payload}
                />
            </div>
        </div>
    );
};

export default function BlockRenderer({ blocks }: BlockRendererProps) {
    return (
        <div className="flex flex-col w-full">
            {blocks.map((block, index) => (
                <BlockWrapper
                    key={`${block.module_namespace}-${block.block_type}-${index}`}
                    block={block}
                    index={index}
                />
            ))}
        </div>
    );
}
