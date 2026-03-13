import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { blockRegistry, BlockProps } from '../../BlockRegistry';
import { StarRating } from '@/Components/ui/StarRating';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const ReviewsCarouselBlock: React.FC<BlockProps> = ({ payload }) => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get(route('api.reviews.approved'), {
            params: {
                limit: payload.limit || 10,
                sort: payload.sort || 'recent',
                ids: payload.selected_ids?.length > 0 ? payload.selected_ids : undefined
            }
        }).then(res => {
            setReviews(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [payload.limit, payload.sort, payload.selected_ids]);

    const next = () => {
        if (reviews.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
    };

    const prev = () => {
        if (reviews.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    };

    if (loading && reviews.length === 0) {
        return <div className="py-20 text-center opacity-50">Cargando reseñas...</div>;
    }

    if (reviews.length === 0) {
        return null; // Don't show if no reviews
    }

    const currentReview = reviews[currentIndex];

    return (
        <section className="py-24 px-6 md:px-12 relative overflow-hidden bg-gradient-to-b from-[var(--color-bg-primary)] to-[var(--color-bg-secondary)]">
            {/* Background Blobs for depth */}
            <div className="absolute top-0 left-1/4 w-[60%] h-[60%] bg-[var(--color-primary)]/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[60%] h-[60%] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <Typography variant="h2" className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
                        {payload.title || 'Lo que dicen de nosotros'}
                    </Typography>
                    {payload.subtitle && (
                        <Typography variant="muted" className="text-lg md:text-xl opacity-60 max-w-2xl mx-auto font-medium">
                            {payload.subtitle}
                        </Typography>
                    )}
                </div>

                <div className="relative group">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, y: -20 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={(e, { offset, velocity }) => {
                                if (offset.x > 100) prev();
                                else if (offset.x < -100) next();
                            }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="cursor-grab active:cursor-grabbing"
                        >
                            <Surface
                                variant="premium"
                                rounding="3xl"
                                className="p-10 md:p-20 border-[var(--color-border)] shadow-3xl relative overflow-hidden bg-white/[0.02] backdrop-blur-3xl"
                                glow
                            >
                                <Quote className="absolute -top-4 -right-4 w-40 h-40 text-[var(--color-primary)] opacity-[0.03] rotate-12" />

                                <div className="flex flex-col items-center text-center space-y-10">
                                    <div className="p-4 bg-[var(--color-primary)]/5 rounded-full">
                                        <StarRating value={currentReview.rating} readonly size={32} />
                                    </div>

                                    <Typography variant="h3" className="text-2xl md:text-4xl font-bold leading-tight tracking-tight">
                                        "{currentReview.comment}"
                                    </Typography>

                                    <div className="flex flex-col items-center space-y-2">
                                        <Typography variant="h4" className="text-2xl font-black text-[var(--color-primary)]">
                                            {currentReview.author_name}
                                        </Typography>
                                        <Typography variant="muted" className="uppercase tracking-[0.3em] text-[11px] font-black opacity-40">
                                            Cliente Verificado • {new Date(currentReview.created_at).toLocaleDateString()}
                                        </Typography>
                                    </div>

                                    {currentReview.photos_json?.length > 0 && (
                                        <div className="flex gap-4 flex-wrap justify-center mt-6">
                                            {currentReview.photos_json.slice(0, 3).map((photo: string, i: number) => (
                                                <div key={i} className="p-1.5 bg-white/5 rounded-2xl border border-white/10 shadow-2xl">
                                                    <img
                                                        src={photo}
                                                        className="w-20 h-20 rounded-xl object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Surface>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons - High Visibility Glass Effect */}
                    <div className="absolute top-1/2 -left-4 -right-4 -translate-y-1/2 flex justify-between pointer-events-none z-20 hidden md:flex">
                        <button
                            onClick={prev}
                            className="p-5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-2xl pointer-events-auto active:scale-90 group/btn"
                        >
                            <ChevronLeft size={32} className="group-hover/btn:-translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={next}
                            className="p-5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-2xl pointer-events-auto active:scale-90 group/btn"
                        >
                            <ChevronRight size={32} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Mobile Navigation Buttons */}
                    <div className="flex justify-center gap-6 mt-16 md:hidden">
                        <button
                            onClick={prev}
                            className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-[var(--color-primary)] active:scale-90"
                        >
                            <ChevronLeft size={28} />
                        </button>
                        <button
                            onClick={next}
                            className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-[var(--color-primary)] active:scale-90"
                        >
                            <ChevronRight size={28} />
                        </button>
                    </div>

                    {/* Indicators */}
                    <div className="flex justify-center gap-2 mt-8">
                        {reviews.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all duration-300",
                                    i === currentIndex ? "w-8 bg-[var(--color-primary)]" : "bg-[var(--color-border)] hover:bg-[var(--color-primary)]/40"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

blockRegistry.register('Core', 'ReviewsCarousel', ReviewsCarouselBlock);

export default ReviewsCarouselBlock;
