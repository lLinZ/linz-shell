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
                className="absolute inset-0 z-0"
                style={{ y: isParallax ? y : 0 }}
            >
                {isVideo ? (
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className={cn(
                            "w-full h-full object-cover",
                            isParallax ? "scale-150" : "scale-105"
                        )}
                    >
                        <source src={payload.video_url} type="video/mp4" />
                    </video>
                ) : hasSlides ? (
                    slides.map((slide: any, idx: number) => (
                        <div
                            key={idx}
                            className={cn(
                                "absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out",
                                idx === currentSlide ? "opacity-100" : "opacity-0",
                                isParallax ? "scale-150" : ""
                            )}
                            style={{ backgroundImage: `url(${slide.image})` }}
                        />
                    ))
                ) : null}
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
                                <PrimaryButton size="lg" className="px-12 py-8 text-xl rounded-2xl group">
                                    {payload.primary_cta.text}
                                    <Play className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform fill-current" />
                                </PrimaryButton>
                            </Link>
                        )}
                        {payload.secondary_cta?.text && (
                            <Link href={payload.secondary_cta.url || '#'}>
                                <Button variant="outline" size="lg" className="px-12 py-8 text-xl rounded-2xl border-white/30 hover:bg-white/10 backdrop-blur-sm text-white">
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
                    <button
                        onClick={prevSlide}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 backdrop-blur-md transition-all"
                    >
                        <ChevronLeft className="w-8 h-8 text-white" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 backdrop-blur-md transition-all"
                    >
                        <ChevronRight className="w-8 h-8 text-white" />
                    </button>

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

const PrimaryButton = ({ children, className, ...props }: any) => (
    <Button
        className={cn(
            "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white shadow-xl shadow-[var(--color-primary)]/20",
            className
        )}
        {...props}
    >
        {children}
    </Button>
);

blockRegistry.register('Core', 'InteractiveHero', InteractiveHeroBlock);

export default InteractiveHeroBlock;
