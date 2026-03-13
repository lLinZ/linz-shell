import React from 'react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { blockRegistry, BlockProps } from '../../BlockRegistry';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * FeaturesBlock component for the 'Core' namespace.
 * Renders a grid of features with icons, titles, and descriptions.
 * Features customizable colors and modern aesthetics.
 */
const FeaturesBlock: React.FC<BlockProps> = ({ payload }) => {
    const features = payload.features || [];
    const hasBgImage = !!payload.styles?.background_image;
    const title = payload.title || "Nuestras Ventajas";
    const subtitle = payload.subtitle;

    return (
        <section className={cn(
            "py-32 px-6 md:px-12 relative overflow-hidden",
            !hasBgImage && "bg-[var(--color-bg-primary)]"
        )}>
            {/* Background Accents - Subtly colored blobs for depth */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)]/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {(title || subtitle) && (
                    <div className="text-center mb-24 space-y-6">
                        {title && (
                            <Typography
                                variant="h1"
                                className={cn(
                                    "text-5xl md:text-7xl font-black tracking-tight",
                                    hasBgImage ? "text-white" : "text-[var(--color-text-primary)]"
                                )}
                            >
                                {title}
                            </Typography>
                        )}
                        {subtitle && (
                            <Typography
                                variant="p"
                                className={cn(
                                    "text-lg md:text-xl max-w-3xl mx-auto font-medium opacity-80 leading-relaxed",
                                    hasBgImage ? "text-white/80" : "text-[var(--color-text-secondary)]"
                                )}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {features.map((feature: any, index: number) => {
                        const IconComponent = (LucideIcons as any)[feature.icon] || LucideIcons.Zap;
                        const featureColor = feature.color || '#10b981'; // Fallback to primary green if not set

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: index * 0.1,
                                    duration: 0.8,
                                    ease: [0.21, 0.47, 0.32, 0.98]
                                }}
                                viewport={{ once: true }}
                                className="h-full"
                            >
                                <Surface
                                    variant={hasBgImage ? "primary" : "secondary"}
                                    border
                                    className={cn(
                                        "p-10 rounded-[2.5rem] transition-all duration-500 group h-full flex flex-col items-start relative overflow-hidden",
                                        "hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]",
                                        "border-[var(--color-border)]",
                                        hasBgImage ? "bg-black/40 backdrop-blur-2xl border-white/10" : "hover:border-[var(--color-primary)]/20"
                                    )}
                                >
                                    {/* Interactive Glow Effect tied to feature color */}
                                    <div
                                        className="absolute -top-24 -right-24 w-48 h-48 opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-[60px] rounded-full pointer-events-none"
                                        style={{ backgroundColor: featureColor }}
                                    />

                                    {/* Background Icon Accent */}
                                    <div className="absolute -top-10 -right-10 p-4 opacity-[0.05] group-hover:opacity-[0.15] group-hover:scale-125 group-hover:-rotate-12 transition-all duration-1000 pointer-events-none">
                                        <IconComponent className="w-64 h-64" style={{ color: featureColor }} strokeWidth={1} />
                                    </div>

                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-10 relative group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                                        style={{ backgroundColor: `${featureColor}15` }}
                                    >
                                        <div
                                            className="absolute inset-0 rounded-2xl opacity-20 border-2"
                                            style={{ borderColor: featureColor }}
                                        />
                                        <IconComponent
                                            className="w-8 h-8 transition-all duration-500 group-hover:drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]"
                                            style={{ color: featureColor }}
                                        />
                                    </div>

                                    <Typography
                                        variant="h4"
                                        className={cn(
                                            "text-2xl font-black mb-4 leading-tight transition-colors duration-300",
                                            hasBgImage ? "text-white" : "text-[var(--color-text-primary)]"
                                        )}
                                    >
                                        {feature.title}
                                    </Typography>

                                    <Typography
                                        variant="p"
                                        className={cn(
                                            "leading-relaxed text-base font-medium mb-8",
                                            hasBgImage ? "text-white/70" : "text-[var(--color-text-secondary)]"
                                        )}
                                    >
                                        {feature.description}
                                    </Typography>

                                    {/* Elegant Feature Accent */}
                                    <div
                                        className="mt-auto h-1.5 w-12 rounded-full transition-all duration-700 group-hover:w-24"
                                        style={{ backgroundColor: featureColor, opacity: 0.4 }}
                                    />
                                </Surface>
                            </motion.div>
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
