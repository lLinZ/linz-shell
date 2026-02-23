import React from 'react';
import { Link } from '@inertiajs/react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { blockRegistry, BlockProps } from '../../BlockRegistry';
import { cn } from '@/lib/utils';

/**
 * HeroBlock component for the 'Core' namespace.
 * Uses only system primitives for styling and layout.
 */
const HeroBlock: React.FC<BlockProps> = ({ payload }) => {
    const hasBgImage = !!payload.background_image;
    const bgColor = payload.background_color || 'transparent';

    return (
        <Surface
            variant="flat"
            size="none"
            rounding="none"
            border={false}
            shadow="none"
            className={cn(
                "relative pt-40 pb-20 lg:pt-56 lg:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4 min-h-[70vh]",
                hasBgImage ? "bg-cover bg-center" : ""
            )}
            style={{
                backgroundImage: hasBgImage ? `url(${payload.background_image})` : undefined,
                backgroundColor: !hasBgImage ? bgColor : undefined
            }}
        >
            {/* Overlay for readability when background image is present */}
            {hasBgImage && (
                <div className="absolute inset-0 bg-black/50 z-0" />
            )}

            <div className="relative z-10 flex flex-col items-center max-w-5xl">
                {/* Badge */}
                {payload.badge && (
                    <Surface
                        variant="primary"
                        size="sm"
                        rounding="full"
                        className="bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 mb-6 backdrop-blur-sm"
                    >
                        <Typography variant="small" className="text-[var(--color-primary)] font-bold uppercase tracking-wider">
                            {payload.badge}
                        </Typography>
                    </Surface>
                )}

                {/* Title */}
                <Typography
                    variant="h1"
                    className={cn(
                        "text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9]",
                        hasBgImage ? "text-white" : ""
                    )}
                >
                    {payload.title} <br />
                    <Typography component="span" className="text-[var(--color-primary)] italic">
                        {payload.subtitle}
                    </Typography>
                </Typography>

                {/* Description */}
                <Typography
                    variant="p"
                    className={cn(
                        "max-w-2xl mx-auto text-xl mb-12 font-medium",
                        hasBgImage ? "text-white/90" : "text-[var(--color-text-muted)]"
                    )}
                >
                    {payload.description}
                </Typography>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {payload.primary_cta?.text && (
                        <Link href={payload.primary_cta.url || '#'}>
                            <Button size="lg" className="px-10 py-8 rounded-2xl font-black text-xl hover:scale-105 transition-all">
                                {payload.primary_cta.text}
                            </Button>
                        </Link>
                    )}
                    {payload.secondary_cta?.text && (
                        <Link href={payload.secondary_cta.url || '#'}>
                            <Button
                                variant="outline"
                                size="lg"
                                className={cn(
                                    "px-10 py-8 rounded-2xl font-black text-xl hover:scale-105 transition-all",
                                    hasBgImage ? "text-white border-white hover:bg-white/10" : ""
                                )}
                            >
                                {payload.secondary_cta.text}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Decorative Pulse (Primitive based background) - only visible if NO background image */}
            {!hasBgImage && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20 dark:opacity-40 -z-10">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-primary)] rounded-full blur-[120px] animate-pulse"></div>
                </div>
            )}
        </Surface>
    );
};

// Auto-register the block
blockRegistry.register('Core', 'Hero', HeroBlock);

export default HeroBlock;
