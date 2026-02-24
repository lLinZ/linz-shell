import React, { useState, useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, LogIn, ExternalLink } from 'lucide-react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import ChatWindow from './ChatWindow';
import axios from 'axios';

/**
 * Floating Chat Widget for Linz Shell.
 * Handles both Guest (Popover) and Authenticated (Compact Window) states.
 */
export default function FloatingChat() {
    const { auth } = usePage<any>().props;
    const [isOpen, setIsOpen] = useState(false);
    const [conversation, setConversation] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [hasSentMeta, setHasSentMeta] = useState(false);

    const user = auth?.user;

    // Hide for any staff/admin roles
    if (user && (user.role === 'admin' || user.role === 'master')) return null;

    // Handle initial conversation fetch for authenticated users
    const handleToggle = async () => {
        if (!isOpen && user) {
            setLoading(true);
            try {
                // Get or create conversation with admin + auto-send meta-message once
                const response = await axios.post(route('chat.with-admin'), {
                    current_url: !hasSentMeta ? window.location.href : null
                });
                setConversation(response.data);
                if (!hasSentMeta) setHasSentMeta(true);
            } catch (error) {
                console.error("Error starting chat with admin:", error);
            } finally {
                setLoading(false);
            }
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-2"
                    >
                        {!user ? (
                            // Guest State: Popover
                            <Surface
                                variant="primary"
                                className="w-[320px] p-6 shadow-2xl rounded-3xl border border-[var(--color-border)]/50 backdrop-blur-xl bg-[var(--color-bg-secondary)]/90"
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="bg-[var(--color-primary)]/10 p-2 rounded-xl">
                                            <MessageCircle className="w-6 h-6 text-[var(--color-primary)]" />
                                        </div>
                                        <button onClick={() => setIsOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div>
                                        <Typography variant="h4" className="mb-2">¡Hola!</Typography>
                                        <Typography variant="small" className="text-[var(--color-text-muted)] leading-relaxed">
                                            Regístrate o inicia sesión para chatear con soporte y recibir asesoría personalizada.
                                        </Typography>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <Link href={route('login')} className="w-full">
                                            <Button variant="outline" className="w-full h-11 rounded-xl text-sm">
                                                Entrar
                                            </Button>
                                        </Link>
                                        <Link href={route('register')} className="w-full">
                                            <Button className="w-full h-11 rounded-xl text-sm shadow-lg shadow-[var(--color-primary)]/20">
                                                Registrarse
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Surface>
                        ) : (
                            // Authenticated State: Compact Chat Window
                            <Surface
                                variant="secondary"
                                className="w-[380px] h-[520px] shadow-2xl rounded-3xl overflow-hidden border border-[var(--color-border)]/50 flex flex-col backdrop-blur-xl bg-[var(--color-bg-secondary)]/95"
                            >
                                {loading ? (
                                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                                        <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                                        <Typography variant="muted">Conectando con soporte...</Typography>
                                    </div>
                                ) : conversation ? (
                                    <ChatWindow
                                        conversation={conversation}
                                        currentUser={user}
                                        onBack={() => setIsOpen(false)}
                                    />
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                                        <Typography variant="h4" className="text-[var(--color-danger)]">Error de Conexión</Typography>
                                        <Typography variant="small" className="text-[var(--color-text-muted)]">No pudimos conectar con un administrador en este momento.</Typography>
                                        <Button variant="outline" size="sm" onClick={handleToggle}>Reintentar</Button>
                                    </div>
                                )}
                            </Surface>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggle}
                className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 backdrop-blur-md",
                    isOpen
                        ? "bg-[var(--color-bg-secondary)] text-[var(--color-primary)] rotate-90 border border-[var(--color-border)]"
                        : "bg-[var(--color-primary)] text-white"
                )}
            >
                {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}

                {/* Notification Badge Placeholder */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse" />
                )}
            </motion.button>
        </div>
    );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
