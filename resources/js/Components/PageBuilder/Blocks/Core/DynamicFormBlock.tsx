import React, { useState } from 'react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { BlockProps } from '../../BlockRegistry';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/Components/ui/textarea';

/**
 * DynamicFormBlock - Exclusive Lead Capture Component
 * Renders a customizable form based on JSON configuration.
 */
const DynamicFormBlock: React.FC<BlockProps> = ({ payload }) => {
    // Ultra-defensive extraction with smart fallbacks
    const safePayload = payload || {};

    // Fallback to "Contáctanos" if no name is provided to ensure visibility
    const form_name = safePayload.form_name || 'Contáctanos';
    const submit_text = safePayload.submit_text || 'Enviar Mensaje';
    const description = safePayload.description || 'Estamos aquí para ayudarte. Déjanos tu mensaje.';

    // If user provided a raw array instead of an object with .fields
    const fieldsData = Array.isArray(safePayload) ? safePayload : (safePayload.fields || []);
    const fields = Array.isArray(fieldsData) ? fieldsData : [];

    // Form state handling
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleInputChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await axios.post('/api/forms/submit', {
                form_name: form_name || 'Generic Form',
                data: formData
            });

            if (response.data.success) {
                setStatus('success');
                setMessage(response.data.message);
                setFormData({}); // Clear form
            } else {
                throw new Error('Unexpected response');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Hubo un error al enviar el formulario. Por favor, intenta de nuevo.');
        }
    };

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/20">
            <div className="max-w-3xl mx-auto">
                <Surface
                    variant="primary"
                    rounding="3xl"
                    shadow="2xl"
                    className="p-8 sm:p-12 border border-[var(--color-border)] overflow-hidden relative"
                >
                    {/* Header */}
                    <div className="mb-12 text-center relative z-20">
                        <Typography
                            variant="gradient"
                            className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 leading-tight drop-shadow-sm"
                        >
                            {form_name}
                        </Typography>
                        {description && (
                            <Typography
                                variant="muted"
                                className="text-sm sm:text-base font-medium max-w-xl mx-auto leading-relaxed"
                            >
                                {description}
                            </Typography>
                        )}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: 48 }}
                            className="h-1 bg-[var(--color-primary)] mx-auto mt-8 rounded-full shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.5)]"
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {status === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 text-center"
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full mb-6">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <Typography variant="h3" className="mb-2">¡Recibido!</Typography>
                                <Typography variant="muted" className="mb-8">
                                    {message}
                                </Typography>
                                <Button
                                    variant="outline"
                                    onClick={() => setStatus('idle')}
                                    className="rounded-2xl border-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
                                >
                                    Enviar otro mensaje
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.form
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 gap-6">
                                    {fields.map((field: any, idx: number) => (
                                        <div key={idx} className="space-y-2">
                                            <Typography variant="small" className="font-black text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] px-1">
                                                {field.label} {field.required && <span className="text-[var(--color-primary)]">*</span>}
                                            </Typography>

                                            {field.type === 'textarea' ? (
                                                <Textarea
                                                    id={`field-${idx}`}
                                                    required={field.required}
                                                    placeholder={`Ingresa tu ${field.label.toLowerCase()}`}
                                                    className="w-full h-14 bg-[var(--color-bg-tertiary)] border-[var(--color-border)] rounded-2xl px-6 focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-medium"
                                                    value={formData[field.name] || ''}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(field.name, e.target.value)}
                                                />
                                            ) : (
                                                <TextInput
                                                    id={`field-${idx}`}
                                                    type={field.type || 'text'}
                                                    required={field.required}
                                                    placeholder={`Ingresa tu ${field.label.toLowerCase()}`}
                                                    className="w-full h-14 bg-[var(--color-bg-tertiary)] border-[var(--color-border)] rounded-2xl px-6 focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-medium"
                                                    value={formData[field.name] || ''}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(field.name, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {status === 'error' && (
                                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 animate-shake">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <Typography variant="small" className="font-bold">{message}</Typography>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        variant="premium"
                                        disabled={status === 'loading'}
                                        className="w-full h-16 rounded-2xl text-lg font-black shadow-2xl shadow-[var(--color-primary)]/20 active:scale-95 transition-all group"
                                    >
                                        {status === 'loading' ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                {submit_text || 'Enviar Mensaje'}
                                            </>
                                        )}
                                    </Button>
                                    <Typography variant="small" className="text-center mt-6 text-[8px] font-black uppercase tracking-widest opacity-30">
                                        Powered by Linz Shell Lead Engine
                                    </Typography>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </Surface>
            </div>
        </section>
    );
};

export default DynamicFormBlock;
