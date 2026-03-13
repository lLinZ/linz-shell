import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { blockRegistry, BlockProps } from '../../BlockRegistry';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

/**
 * InteractiveHeroBlock component.
 * Features: Background Video or Image Carousel with smooth transitions and Parallax support.
 */
const InteractiveHeroBlock: React.FC<BlockProps> = ({ payload }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const slides = payload.slides || [];
    const hasSlides = slides.length > 0;
    const isVideo = !!payload.video_url;

    // Parallax logic
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const isParallax = payload.styles?.parallax === true;
    const yValue = useTransform(scrollYProgress, [0, 1], [-200, 200]);
    const y = useSpring(yValue, { stiffness: 100, damping: 30, restDelta: 0.001 });

    useEffect(() => {
        if (hasSlides && !isVideo) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [hasSlides, isVideo, slides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <Surface
            ref={containerRef}
            variant="flat"
            size="none"
            rounding="none"
            border={false}
            shadow="none"
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
            {/* Background Layer with Integrated Parallax Support */}
            <motion.div
                className="absolute inset-0 z-0 overflow-hidden bg-black"
                style={{ y: isParallax ? y : 0, scale: isParallax ? 1.05 : 1, willChange: 'transform' }}
            >
                {isVideo ? (
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover opacity-60"
                    >
                        <source src={payload.video_url} type="video/mp4" />
                    </video>
                ) : hasSlides ? (
                    slides.map((slide: any, idx: number) => (
                        <motion.div
                            key={idx}
                            initial={false}
                            animate={{
                                opacity: idx === currentSlide ? 1 : 0,
                                scale: idx === currentSlide ? 1 : 1.1,
                            }}
                            transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${slide.image})`,
                                filter: 'contrast(1.1) brightness(0.8)'
                            }}
                        />
                    ))
                ) : null}

                {/* Cinematic Post-Processing Layers */}
                <div className="absolute inset-0 z-10">
                    {/* Dynamic Vignette */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_50%,rgba(0,0,0,0.8)_100%)]" />
                    {/* Vertical Gradient for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
                    {/* Subtle Noise Texture */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
                </div>
            </motion.div>

            {/* Content Container */}
            <div className="relative z-20 container mx-auto px-6 text-center text-white">
                <div className="max-w-4xl mx-auto space-y-8">
                    {payload.badge && (
                        <Typography variant="small" className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 font-bold uppercase tracking-widest text-[var(--color-primary-light)]">
                            {payload.badge}
                        </Typography>
                    )}

                    <Typography variant="h1" className="text-5xl md:text-8xl font-black leading-tight tracking-tighter drop-shadow-2xl">
                        {payload.title}
                    </Typography>

                    <Typography variant="p" className="text-xl md:text-2xl text-white/90 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                        {payload.description}
                    </Typography>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center pt-4">
                        {payload.primary_cta?.text && (
                            <Link href={payload.primary_cta.url || '#'}>
                                <Button size="lg" rounding="2xl" animation="hover-scale" className="px-12 py-8 text-xl group">
                                    {payload.primary_cta.text}
                                    <Play className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform fill-current" />
                                </Button>
                            </Link>
                        )}
                        {payload.secondary_cta?.text && (
                            <Link href={payload.secondary_cta.url || '#'}>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    rounding="2xl"
                                    animation="hover-scale"
                                    className="px-12 py-8 text-xl border-white/30 hover:bg-white/10 backdrop-blur-sm text-white"
                                >
                                    {payload.secondary_cta.text}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Carousel Navigation */}
            {hasSlides && !isVideo && slides.length > 1 && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        rounding="full"
                        onClick={prevSlide}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/40 border border-white/10 backdrop-blur-md transition-all"
                    >
                        <ChevronLeft className="w-8 h-8 text-white" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        rounding="full"
                        onClick={nextSlide}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/40 border border-white/10 backdrop-blur-md transition-all"
                    >
                        <ChevronRight className="w-8 h-8 text-white" />
                    </Button>

                    {/* Indicators */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                        {slides.map((_: any, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={cn(
                                    "h-1.5 transition-all rounded-full",
                                    idx === currentSlide ? "w-10 bg-[var(--color-primary)]" : "w-3 bg-white/30"
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </Surface>
    );
};

// Removed PrimaryButton internal helper as it is redundant

blockRegistry.register('Core', 'InteractiveHero', InteractiveHeroBlock);

export default InteractiveHeroBlock;
