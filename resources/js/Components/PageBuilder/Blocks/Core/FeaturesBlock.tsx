import React from 'react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { blockRegistry, BlockProps } from '../../BlockRegistry';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * FeaturesBlock component for the 'Core' namespace.
 * Renders a grid of features with icons, titles, and descriptions.
 */
const FeaturesBlock: React.FC<BlockProps> = ({ payload }) => {
    const features = payload.features || [];
    const hasBgImage = !!payload.styles?.background_image;

    return (
        <section className={cn(
            "py-24 px-6 md:px-12",
            !hasBgImage && "bg-[var(--color-bg-primary)]"
        )}>
            <div className="max-w-7xl mx-auto">
                {(payload.title || payload.subtitle) && (
                    <div className="text-center mb-16 space-y-4">
                        {payload.title && (
                            <Typography
                                variant="h2"
                                className={cn(
                                    "text-4xl md:text-5xl font-black",
                                    hasBgImage && "text-white"
                                )}
                            >
                                {payload.title}
                            </Typography>
                        )}
                        {payload.subtitle && (
                            <Typography
                                variant="p"
                                className={cn(
                                    "text-lg max-w-2xl mx-auto font-medium",
                                    hasBgImage ? "text-white/80" : "text-[var(--color-text-secondary)]"
                                )}
                            >
                                {payload.subtitle}
                            </Typography>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature: any, index: number) => {
                        const IconComponent = (LucideIcons as any)[feature.icon] || LucideIcons.Zap;
                        return (
                            <Surface
                                key={index}
                                variant={hasBgImage ? "primary" : "secondary"}
                                border
                                className={cn(
                                    "p-8 rounded-3xl hover:border-[var(--color-primary)]/50 transition-all duration-300 group",
                                    hasBgImage ? "bg-black/20 backdrop-blur-md border-white/10" : ""
                                )}
                            >
                                <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <IconComponent className="w-7 h-7 text-[var(--color-primary)]" />
                                </div>
                                <Typography
                                    variant="h4"
                                    className={cn(
                                        "text-xl font-bold mb-3",
                                        hasBgImage && "text-white"
                                    )}
                                >
                                    {feature.title}
                                </Typography>
                                <Typography
                                    variant="p"
                                    className={cn(
                                        "leading-relaxed text-sm font-medium",
                                        hasBgImage ? "text-white/70" : "text-[var(--color-text-secondary)]"
                                    )}
                                >
                                    {feature.description}
                                </Typography>
                            </Surface>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

// Register the block in the 'Core' namespace
blockRegistry.register('Core', 'Features', FeaturesBlock);

export default FeaturesBlock;
