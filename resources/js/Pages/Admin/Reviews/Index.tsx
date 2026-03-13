import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import Modal from '@/Components/Modal';
import { StarRating } from '@/Components/ui/StarRating';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import {
    CheckCircle2,
    XCircle,
    QrCode,
    ExternalLink,
    Copy,
    MessageSquare,
    User,
    Clock,
    Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Index({ reviews }: any) {
    const [showQrModal, setShowQrModal] = useState(false);
    const [invitationUrl, setInvitationUrl] = useState('');
    const [generating, setGenerating] = useState(false);

    const handleUpdateStatus = (reviewId: number, status: string) => {
        router.patch(route('admin.reviews.update', reviewId), { status }, {
            preserveScroll: true
        });
    };

    const handleGenerateInvitation = async () => {
        try {
            setGenerating(true);
            const response = await axios.post(route('admin.reviews.generate'));
            setInvitationUrl(response.data.url);
            setShowQrModal(true);
        } catch (error) {
            console.error('Error generating invitation', error);
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(invitationUrl);
        // Toast logic could go here
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge variant="success">APROBADA</Badge>;
            case 'rejected': return <Badge variant="danger">RECHAZADA</Badge>;
            case 'pending': return <Badge variant="warning">PENDIENTE</Badge>;
            case 'invited': return <Badge variant="secondary">INVITACIÓN ENVIADA</Badge>;
            default: return <Badge variant="outline">{status.toUpperCase()}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Reseñas" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                    <div>
                        <Typography variant="h1" className="text-4xl md:text-5xl font-black mb-2 tracking-tight">Reseñas de Clientes</Typography>
                        <Typography variant="muted" className="text-lg opacity-60">Gestiona el feedback y genera invitaciones QR para nuevas compras.</Typography>
                    </div>
                    <Button
                        variant="premium"
                        onClick={handleGenerateInvitation}
                        disabled={generating}
                        className="h-14 px-8 rounded-2xl shadow-xl shadow-[var(--color-primary)]/20 text-lg"
                        glow
                    >
                        <QrCode className="mr-3 w-6 h-6" />
                        Generar Invitación QR
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence>
                        {reviews.data.map((review: any, index: number) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Surface variant="secondary" className="p-6 md:p-8 rounded-[2.5rem] border-[var(--color-border)] shadow-lg hover:shadow-xl transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                        <MessageSquare size={120} />
                                    </div>

                                    <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                                        <div className="flex-1 space-y-6">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-[var(--color-bg-tertiary)] flex items-center justify-center border border-[var(--color-border)] shadow-inner">
                                                    <User className="w-7 h-7 text-[var(--color-primary)] opacity-70" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <Typography variant="h4" className="font-black text-xl leading-none">
                                                            {review.author_name || 'Sin nombre'}
                                                        </Typography>
                                                        {getStatusBadge(review.status)}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Typography variant="muted" className="text-[11px] font-bold uppercase tracking-wider opacity-60">
                                                            {review.author_email || 'Sin email proporcionado'}
                                                        </Typography>
                                                        <span className="text-[var(--color-border)]">•</span>
                                                        <div className="flex items-center gap-1 text-[11px] font-bold opacity-40 uppercase tracking-wider">
                                                            <Clock size={12} />
                                                            {new Date(review.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="lg:ml-auto p-3 bg-[var(--color-bg-primary)]/50 rounded-2xl border border-[var(--color-border)]/30">
                                                    <StarRating value={review.rating} readonly size={20} />
                                                </div>
                                            </div>

                                            <div className="bg-[var(--color-bg-primary)]/30 p-6 rounded-3xl border border-[var(--color-border)]/20 italic">
                                                <Typography variant="p" className="text-lg md:text-xl leading-relaxed text-[var(--color-text-secondary)]">
                                                    {review.comment ? `"${review.comment}"` : <span className="opacity-30">Esta reseña no incluye comentarios de texto.</span>}
                                                </Typography>
                                            </div>

                                            {review.photos_json?.length > 0 && (
                                                <div className="flex flex-wrap gap-3">
                                                    {review.photos_json.map((photo: string, i: number) => (
                                                        <div key={i} className="relative group/img overflow-hidden rounded-2xl shadow-md">
                                                            <img
                                                                src={photo}
                                                                className="w-24 h-24 object-cover transition-transform duration-500 group-hover/img:scale-110"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-row lg:flex-col justify-end lg:justify-start gap-3 lg:min-w-[180px]">
                                            {review.status === 'pending' && (
                                                <>
                                                    <Button
                                                        onClick={() => handleUpdateStatus(review.id, 'approved')}
                                                        className="bg-green-500 hover:bg-green-600 text-white rounded-2xl h-12 flex-1 lg:flex-none"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                                        Aprobar
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleUpdateStatus(review.id, 'rejected')}
                                                        className="text-red-500 hover:bg-red-500/10 rounded-2xl h-12 flex-1 lg:flex-none"
                                                    >
                                                        <XCircle className="w-4 h-4 mr-2" />
                                                        Rechazar
                                                    </Button>
                                                </>
                                            )}

                                            {(review.status === 'approved' || review.status === 'rejected') && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleUpdateStatus(review.id, 'pending')}
                                                    className="rounded-2xl h-12 opacity-60 hover:opacity-100"
                                                >
                                                    Mover a Pendiente
                                                </Button>
                                            )}

                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    if (confirm('¿Estás seguro de eliminar esta reseña permanentemente?')) {
                                                        router.delete(route('admin.reviews.destroy', review.id));
                                                    }
                                                }}
                                                className="text-rose-500 hover:bg-rose-500/10 rounded-2xl h-12 flex-1 lg:flex-none"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Eliminar
                                            </Button>

                                            {review.status === 'invited' && (
                                                <Typography variant="muted" className="text-[10px] text-center italic bg-[var(--color-bg-tertiary)] p-3 rounded-xl border border-[var(--color-border)]">
                                                    Esperando que el cliente complete la reseña.
                                                </Typography>
                                            )}
                                        </div>
                                    </div>
                                </Surface>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {reviews.data.length === 0 && (
                        <div className="py-32 text-center border-4 border-dashed border-[var(--color-border)]/30 rounded-[4rem] bg-[var(--color-bg-tertiary)]/10">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="space-y-6"
                            >
                                <MessageSquare className="w-24 h-24 mx-auto mb-4 text-[var(--color-primary)] opacity-20" />
                                <div>
                                    <Typography variant="h2" className="text-3xl font-black">Tu flujo de feedback está vacío</Typography>
                                    <Typography variant="p" className="opacity-50 mt-2">Genera una invitación QR para que tus clientes compartan sus experiencias.</Typography>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleGenerateInvitation}
                                    className="rounded-full px-10 h-12 border-2"
                                >
                                    ¡Empezar ahora!
                                </Button>
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* Pagination placeholder if needed - reviews usually has pagination meta */}
            </div>

            {/* QR Modal - Linz Premium Style */}
            <Modal show={showQrModal} onClose={() => setShowQrModal(false)} maxWidth="md" className="backdrop-blur-xl">
                <div className="p-1 pb-10">
                    <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] h-32 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                        <QrCode className="w-16 h-16 text-white relative z-10" />
                    </div>

                    <div className="px-10 -mt-10 relative z-10">
                        <Surface rounding="3xl" className="p-8 text-center space-y-8 shadow-2xl border-[var(--color-border)]">
                            <div>
                                <Typography variant="h3" className="text-2xl font-black mb-1">¡Código QR Listo!</Typography>
                                <Typography variant="muted" className="text-xs uppercase tracking-widest font-bold opacity-40">Módulo de Reseñas de Cliente</Typography>
                            </div>

                            <div className="bg-white p-6 rounded-[2.5rem] inline-block mx-auto shadow-inner border-8 border-[var(--color-bg-secondary)] flex items-center justify-center">
                                <QRCodeSVG value={invitationUrl} size={220} level="H" includeMargin={false} />
                            </div>

                            <div className="space-y-4">
                                <Typography variant="muted" className="text-sm">Escanea este código o comparte el enlace directo con tu cliente.</Typography>

                                <div className="flex items-center gap-2 p-4 bg-[var(--color-bg-primary)] rounded-2xl border border-[var(--color-border)] group">
                                    <input
                                        readOnly
                                        value={invitationUrl}
                                        className="flex-1 bg-transparent border-none text-[10px] font-mono focus:ring-0 truncate font-bold text-[var(--color-primary)]"
                                    />
                                    <button
                                        onClick={copyToClipboard}
                                        className="p-3 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-primary)] hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button className="flex-1 h-14 rounded-2xl border-2" variant="outline" onClick={() => setShowQrModal(false)}>Cerrar</Button>
                                    <Button
                                        className="flex-1 h-14 rounded-2xl shadow-lg"
                                        variant="premium"
                                        onClick={() => window.open(invitationUrl, '_blank')}
                                    >
                                        Probar Enlace
                                        <ExternalLink className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Surface>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
