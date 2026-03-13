import React from 'react';
import { useToastStore } from '@/Stores/useToastStore';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Typography } from './Typography';

const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
};

const bgColors = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    error: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
};

export function Toaster() {
    const toasts = useToastStore((state) => state.toasts);
    const removeToast = useToastStore((state) => state.removeToast);

    return (
        <div className="fixed bottom-0 right-0 z-[100] flex flex-col gap-3 p-4 sm:p-6 w-full sm:w-auto max-w-[420px] pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className={cn(
                            "pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl",
                            "bg-[var(--color-bg-primary)]/90 dark:bg-[var(--color-bg-secondary)]/90",
                            bgColors[toast.type]
                        )}
                    >
                        <div className="flex-shrink-0 mt-0.5">
                            {icons[toast.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <Typography variant="small" className="font-bold text-[var(--color-text-primary)] leading-tight">
                                {toast.message}
                            </Typography>
                            {toast.description && (
                                <Typography variant="muted" className="text-xs mt-1 leading-snug">
                                    {toast.description}
                                </Typography>
                            )}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="flex-shrink-0 ml-4 opacity-50 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                        >
                            <X className="w-4 h-4 text-[var(--color-text-primary)]" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
