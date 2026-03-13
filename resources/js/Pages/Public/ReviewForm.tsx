import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { StarRating } from '@/Components/ui/StarRating';
import { Camera, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReviewForm({ reviewInvitation }: { reviewInvitation: any }) {
    const { data, setData, post, processing, errors, wasSuccessful, reset } = useForm({
        uuid: reviewInvitation.uuid,
        rating: 0,
        comment: '',
        author_name: '',
        author_email: '',
        photos: [] as File[],
    });

    const [previews, setPreviews] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setData('photos', [...data.photos, ...newFiles]);

            const filePreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews([...previews, ...filePreviews]);
        }
    };

    const removePhoto = (index: number) => {
        const newPhotos = [...data.photos];
        newPhotos.splice(index, 1);
        setData('photos', newPhotos);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('reviews.store'), {
            forceFormData: true,
        });
    };

    if (wasSuccessful || reviewInvitation.status !== 'invited') {
        return (
            <GuestLayout>
                <div className="text-center py-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </motion.div>
                    <Typography variant="h3" className="mb-2">¡Gracias por tu reseña!</Typography>
                    <Typography variant="muted">
                        {reviewInvitation.status === 'invited'
                            ? 'Tu comentario ha sido enviado y será revisado pronto.'
                            : 'Esta reseña ya ha sido enviada o completada anteriormente.'}
                    </Typography>
                    <div className="mt-8">
                        <Button variant="outline" rounding="full" onClick={() => window.location.href = '/'}>
                            Volver al inicio
                        </Button>
                    </div>
                </div>
            </GuestLayout>
        );
    }

    return (
        <GuestLayout>
            <Head title="Dejar una Reseña" />

            <div className="space-y-8">
                <div>
                    <Typography variant="h2" className="text-center mb-2">Tu opinión nos importa</Typography>
                    <Typography variant="muted" className="text-center">Comparte tu experiencia con nosotros.</Typography>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <Typography variant="small" className="uppercase tracking-widest text-[10px] opacity-60 font-bold block text-center">Calificación</Typography>
                        <div className="flex justify-center py-2">
                            <StarRating
                                value={data.rating}
                                onChange={(val) => setData('rating', val)}
                                size={40}
                            />
                        </div>
                        {errors.rating && <Typography variant="small" className="text-red-500 text-center block">{errors.rating}</Typography>}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Typography variant="small" className="uppercase tracking-widest text-[10px] opacity-60 font-bold">Nombre</Typography>
                            <Input
                                placeholder="Tu nombre"
                                value={data.author_name}
                                onChange={e => setData('author_name', e.target.value)}
                            />
                            {errors.author_name && <Typography variant="small" className="text-red-500">{errors.author_name}</Typography>}
                        </div>
                        <div className="space-y-2">
                            <Typography variant="small" className="uppercase tracking-widest text-[10px] opacity-60 font-bold">Email</Typography>
                            <Input
                                type="email"
                                placeholder="tu@email.com"
                                value={data.author_email}
                                onChange={e => setData('author_email', e.target.value)}
                            />
                            {errors.author_email && <Typography variant="small" className="text-red-500">{errors.author_email}</Typography>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Typography variant="small" className="uppercase tracking-widest text-[10px] opacity-60 font-bold">Comentario (Opcional)</Typography>
                        <Textarea
                            placeholder="Cuéntanos sobre tu experiencia..."
                            className="min-h-[120px]"
                            value={data.comment}
                            onChange={e => setData('comment', e.target.value)}
                        />
                        {errors.comment && <Typography variant="small" className="text-red-500">{errors.comment}</Typography>}
                    </div>

                    <div className="space-y-3">
                        <Typography variant="small" className="uppercase tracking-widest text-[10px] opacity-60 font-bold">Fotos</Typography>

                        <div className="grid grid-cols-4 gap-2">
                            <AnimatePresence>
                                {previews.map((preview, index) => (
                                    <motion.div
                                        key={preview}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="relative aspect-square rounded-xl overflow-hidden group"
                                    >
                                        <img src={preview} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(index)}
                                            className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {data.photos.length < 4 && (
                                <label className="aspect-square rounded-xl border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)]/50 transition-all text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
                                    <Camera size={20} />
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">Subir</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            )}
                        </div>
                        <Typography variant="muted" className="text-[10px]">Puedes subir hasta 4 fotos.</Typography>
                    </div>

                    <Button
                        type="submit"
                        disabled={processing || data.rating === 0}
                        className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-[var(--color-primary)]/20"
                        glow
                        variant="premium"
                    >
                        {processing ? 'Enviando...' : 'Publicar Reseña'}
                    </Button>
                </form>
            </div>
        </GuestLayout>
    );
}
