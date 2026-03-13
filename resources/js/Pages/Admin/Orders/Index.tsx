import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    Clock, MoreHorizontal, User, Phone, Mail,
    Search, X, ChevronDown, ShoppingCart, Plus,
    Trash2, Package, Check, MapPin, MessageCircle,
    Send, Hash, Calendar, ChevronRight, ExternalLink,
    UserPlus, Users, Loader2, Pencil,
} from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import OrderChatPanel from '@/Components/Orders/OrderChatPanel';

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUSES = ['Nuevo', 'En Proceso', 'Enviado', 'Completado', 'Cancelado'];
const STATUS_CFG: Record<string, { bg: string; text: string }> = {
    'Nuevo': { bg: 'rgb(59,130,246)', text: '#fff' },
    'En Proceso': { bg: 'rgb(234,179,8)', text: '#fff' },
    'Enviado': { bg: 'rgb(168,85,247)', text: '#fff' },
    'Completado': { bg: 'rgb(16,185,129)', text: '#fff' },
    'Cancelado': { bg: 'rgb(244,63,94)', text: '#fff' },
};
const sc = (s: string) => STATUS_CFG[s] ?? { bg: '#6b7280', text: '#fff' };
const waLink = (p: string) => `https://wa.me/${p.replace(/\D/g, '')}`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const fmtShort = (d: string) => new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short' });

// ── Types ─────────────────────────────────────────────────────────────────────
interface Product { id: number; name: string; price: number; image_url?: string; }
interface OrderItem { id: number; quantity: number; price: number; product?: { name: string; image_url?: string }; }
interface OrderNote { id: number; body: string; created_at: string; user: { id: number; name: string; avatar_color?: string }; }
interface OrderUser { id: number; name: string; email: string; avatar_color?: string; }
interface Order {
    id: number; customer_name: string; customer_email: string;
    customer_phone: string; customer_address?: string;
    status: string; total: string; created_at: string;
    is_manual: boolean; manual_label?: string;
    user?: OrderUser; items: OrderItem[]; notes: OrderNote[];
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, color, size = 28 }: { name: string; color?: string; size?: number }) {
    const ini = (name ?? '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return (
        <div className="rounded-full flex items-center justify-center font-black text-white flex-shrink-0"
            style={{ width: size, height: size, background: color || '#10b981', fontSize: size * 0.36 }}>
            {ini}
        </div>
    );
}

// ── InfoRow ───────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest opacity-40">{icon} {label}</div>
            <div className="text-sm font-bold">{value}</div>
        </div>
    );
}

// ── Manual Badge ──────────────────────────────────────────────────────────────
function ManualBadge({ label }: { label?: string }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
            style={{ background: 'rgba(99,102,241,0.12)', color: 'rgb(129,140,248)', borderColor: 'rgba(99,102,241,0.25)' }}>
            <Pencil size={9} /> {label || 'Manual'}
        </span>
    );
}

// ── Order Detail Dialog ───────────────────────────────────────────────────────
function OrderDialog({ order: initial, onClose, onStatusChange }: {
    order: Order; onClose: () => void; onStatusChange: (id: number, s: string) => void;
}) {
    const { auth } = usePage().props as any;
    const [order, setOrder] = useState<Order>(initial);
    const [notes, setNotes] = useState<OrderNote[]>(initial.notes ?? []);
    const [noteBody, setNoteBody] = useState('');
    const [sendingNote, setSendingNote] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [panel, setPanel] = useState<'notes' | 'chat'>('notes');
    const bottomRef = useRef<HTMLDivElement>(null);
    const cfg = sc(order.status);

    useEffect(() => { setOrder(initial); setNotes(initial.notes ?? []); }, [initial.id]);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [notes]);

    const handleStatusChange = (newStatus: string) => {
        setOrder(o => ({ ...o, status: newStatus }));
        onStatusChange(order.id, newStatus);
        axios.patch(route('admin.orders.update-status', order.id), { status: newStatus });
    };

    const submitNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteBody.trim()) return;
        setSendingNote(true);
        try {
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await axios.post(route('admin.orders.notes.store', order.id), { body: noteBody }, {
                headers: { 'X-CSRF-TOKEN': csrf }
            });
            setNotes(prev => [res.data, ...prev]);
            setNoteBody('');
        } finally { setSendingNote(false); }
    };

    const subtotal = order.items.reduce((s, i) => s + i.quantity * parseFloat(String(i.price)), 0);

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-end">
            <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />

            <motion.div
                className="relative z-10 w-full sm:w-[720px] lg:w-[800px] h-[95vh] sm:h-full flex flex-col bg-[var(--color-bg-secondary)] sm:rounded-l-[2rem] shadow-2xl border-l border-[var(--color-border)] overflow-hidden"
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}>

                {/* Top bar */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--color-border)] flex-shrink-0 bg-[var(--color-bg-secondary)]/95 backdrop-blur-xl">
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--color-bg-tertiary)] transition-colors opacity-50 hover:opacity-100">
                        <ChevronRight size={18} />
                    </button>
                    <div className="flex items-center gap-2">
                        <Hash size={14} className="opacity-40" />
                        <span className="font-black text-lg">{order.id}</span>
                        {order.is_manual && <ManualBadge label={order.manual_label} />}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        {order.customer_phone && (
                            <a href={waLink(order.customer_phone)} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 transition-colors">
                                <ExternalLink size={12} /> WhatsApp
                            </a>
                        )}
                        {order.user && (
                            <button onClick={() => setPanel(p => p === 'chat' ? 'notes' : 'chat')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${panel === 'chat' ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border-[var(--color-primary)]/30' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 border-[var(--color-primary)]/20'}`}>
                                <MessageCircle size={12} /> Chat
                            </button>
                        )}
                    </div>
                </div>

                {/* Body — two columns on desktop */}
                <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">

                    {/* ── Left: order detail ── */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 lg:border-r border-[var(--color-border)]">

                        {/* Status + date */}
                        <div className="flex flex-wrap items-center gap-3">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm border-0 hover:brightness-110 active:scale-95 transition-all"
                                        style={{ background: cfg.bg, color: cfg.text }}>
                                        {order.status} <MoreHorizontal size={14} className="opacity-70" />
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content align="left" width="48" contentClasses="bg-[var(--color-bg-secondary)] py-1.5 shadow-2xl border border-[var(--color-border)] rounded-2xl z-[300]">
                                    {STATUSES.map(s => (
                                        <button key={s} onClick={() => handleStatusChange(s)} disabled={s === order.status}
                                            className={`w-full text-left px-4 py-2.5 hover:bg-[var(--color-bg-primary)]/60 transition-colors text-sm font-bold flex items-center gap-3 ${s === order.status ? 'opacity-40 cursor-default' : ''}`}>
                                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: sc(s).bg }} />
                                            {s}
                                        </button>
                                    ))}
                                </Dropdown.Content>
                            </Dropdown>
                            <div className="flex items-center gap-1.5 text-xs opacity-40 font-bold">
                                <Calendar size={11} /> {fmtDate(order.created_at)}
                            </div>
                        </div>

                        {/* Customer */}
                        <Surface variant="primary" className="rounded-2xl p-5 border border-[var(--color-border)] space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-base flex-shrink-0"
                                    style={{ background: 'var(--color-primary)', color: '#000' }}>
                                    {(order.customer_name?.[0] ?? '?').toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-black text-base">{order.customer_name || '—'}</div>
                                    {order.user && (
                                        <div className="text-xs opacity-50 font-medium flex items-center gap-1">
                                            <User size={10} /> Usuario vinculado: {order.user.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <InfoRow icon={<Mail size={12} />} label="Email" value={order.customer_email || '—'} />
                                <InfoRow icon={<Phone size={12} />} label="Teléfono" value={order.customer_phone || '—'} />
                                {order.customer_address && (
                                    <div className="sm:col-span-2">
                                        <InfoRow icon={<MapPin size={12} />} label="Dirección" value={order.customer_address} />
                                    </div>
                                )}
                            </div>
                        </Surface>

                        {/* Products */}
                        <div>
                            <div className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2">
                                <Package size={11} /> Productos
                            </div>
                            <div className="space-y-2">
                                {order.items?.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-tertiary)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {item.product?.image_url ? <img src={item.product.image_url} className="w-full h-full object-cover" alt="" /> : <Package size={16} className="opacity-30" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm truncate">{item.product?.name || 'Producto eliminado'}</div>
                                            <div className="text-xs opacity-50">{item.quantity} unidad{item.quantity !== 1 ? 'es' : ''}</div>
                                        </div>
                                        <div className="font-black text-sm">${(item.quantity * parseFloat(String(item.price))).toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 p-4 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] space-y-2">
                                <div className="flex justify-between text-sm"><span className="opacity-60">Subtotal</span><span className="font-bold">${subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm"><span className="opacity-60">Envío</span><span className="font-bold text-[var(--color-primary)]">GRATIS</span></div>
                                <div className="flex justify-between text-base border-t border-[var(--color-border)] pt-2"><span className="font-black">Total</span><span className="font-black">${parseFloat(order.total).toFixed(2)}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* ── Right panel: Notes or Chat ── */}
                    <div className="w-full lg:w-[300px] flex flex-col border-t border-[var(--color-border)] lg:border-t-0 min-h-0">

                        {/* Panel tabs (only if user exists) */}
                        {order.user && (
                            <div className="flex border-b border-[var(--color-border)] flex-shrink-0">
                                {(['notes', 'chat'] as const).map(p => (
                                    <button key={p} onClick={() => setPanel(p)}
                                        className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 ${panel === p ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'opacity-40 hover:opacity-70'}`}>
                                        {p === 'notes' ? <><MessageCircle size={11} /> Notas</> : <><MessageCircle size={11} /> Chat</>}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Chat panel */}
                        {panel === 'chat' && order.user && auth?.user ? (
                            <OrderChatPanel orderId={order.id} authUser={auth.user} onClose={() => setPanel('notes')} />
                        ) : (
                            <>
                                {/* Notes header */}
                                {!order.user && (
                                    <div className="px-5 py-4 border-b border-[var(--color-border)] flex-shrink-0">
                                        <div className="text-[11px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                            <MessageCircle size={11} /> Notas internas
                                        </div>
                                    </div>
                                )}

                                {/* Notes list */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 400 }}>
                                    {[...notes].reverse().length === 0 ? (
                                        <div className="py-8 text-center opacity-30 text-sm font-bold italic">Sin notas aún.</div>
                                    ) : [...notes].reverse().map(note => (
                                        <motion.div key={note.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                                            <Avatar name={note.user.name} color={note.user.avatar_color} size={26} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="font-black text-xs">{note.user.name}</span>
                                                    <span className="text-[10px] opacity-40">{fmtShort(note.created_at)}</span>
                                                </div>
                                                <div className="mt-1 text-sm leading-relaxed opacity-80 bg-[var(--color-bg-primary)] rounded-2xl rounded-tl-sm px-3 py-2 border border-[var(--color-border)]">
                                                    {note.body}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    <div ref={bottomRef} />
                                </div>

                                {/* Note input */}
                                <form onSubmit={submitNote} className="p-4 border-t border-[var(--color-border)] flex-shrink-0 flex gap-2">
                                    {auth?.user && <Avatar name={auth.user.name} color={auth.user.avatar_color} size={28} />}
                                    <div className="flex-1 relative">
                                        <textarea value={noteBody} onChange={e => setNoteBody(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitNote(e as any); } }}
                                            placeholder="Nota interna… (Enter para enviar)" rows={2}
                                            className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all resize-none placeholder:opacity-30" />
                                    </div>
                                    <button type="submit" disabled={sendingNote || !noteBody.trim()}
                                        className="p-2.5 rounded-xl bg-[var(--color-primary)] text-black hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none self-end flex-shrink-0">
                                        <Send size={14} />
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ── Create Order Modal ────────────────────────────────────────────────────────
function CreateOrderModal({ open, onClose, products }: { open: boolean; onClose: () => void; products: Product[]; }) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        customer_name: string; customer_email: string; customer_phone: string;
        customer_address: string; status: string; manual_label: string;
        user_action: 'none' | 'existing' | 'create';
        user_id: number | null;
        new_user_name: string; new_user_email: string; new_user_password: string;
        items: { product_id: number; quantity: number; price: number; _label: string }[];
    }>({
        customer_name: '', customer_email: '', customer_phone: '',
        customer_address: '', status: 'Nuevo', manual_label: 'Manual',
        user_action: 'none', user_id: null,
        new_user_name: '', new_user_email: '', new_user_password: '',
        items: [],
    });

    const [productSearch, setProductSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [userResults, setUserResults] = useState<{ id: number; name: string; email: string; avatar_color?: string }[]>([]);
    const [searchingUser, setSearchingUser] = useState(false);

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

    // User search debounce
    useEffect(() => {
        if (data.user_action !== 'existing' || userSearch.length < 2) { setUserResults([]); return; }
        setSearchingUser(true);
        const t = setTimeout(async () => {
            try {
                const res = await axios.get(route('admin.orders.search-users'), { params: { q: userSearch } });
                setUserResults(res.data);
            } finally { setSearchingUser(false); }
        }, 300);
        return () => clearTimeout(t);
    }, [userSearch, data.user_action]);

    const addProduct = (p: Product) => {
        const idx = data.items.findIndex(i => i.product_id === p.id);
        if (idx !== -1) { const u = [...data.items]; u[idx].quantity += 1; setData('items', u); }
        else setData('items', [...data.items, { product_id: p.id, quantity: 1, price: p.price, _label: p.name }]);
        setProductSearch('');
    };
    const updateQty = (idx: number, qty: number) => { const u = [...data.items]; u[idx].quantity = Math.max(1, qty); setData('items', u); };
    const removeItem = (idx: number) => setData('items', data.items.filter((_, i) => i !== idx));
    const total = data.items.reduce((s, i) => s + i.quantity * i.price, 0);
    const submit = (e: React.FormEvent) => { e.preventDefault(); post(route('admin.orders.store'), { onSuccess: () => { reset(); onClose(); } }); };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
            <motion.div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[2rem] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-2xl"
                initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2 }}>

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-bg-secondary)] backdrop-blur-xl z-10 rounded-t-[2rem]">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Typography variant="h3" className="font-black text-xl">Nueva Orden Manual</Typography>
                            <ManualBadge />
                        </div>
                        <Typography variant="muted" className="text-xs opacity-50">Crea una orden directamente desde el CRM</Typography>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--color-bg-tertiary)] transition-colors opacity-50 hover:opacity-100"><X size={18} /></button>
                </div>

                <form onSubmit={submit} className="p-8 space-y-8">

                    {/* ── Label + Status ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold opacity-60 mb-1.5">Etiqueta de la orden</label>
                            <input type="text" value={data.manual_label} onChange={e => setData('manual_label', e.target.value)} placeholder="Ej: Pedido por teléfono"
                                className="w-full px-4 py-3 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold opacity-60 mb-1.5">Estado inicial</label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all appearance-none">
                                {STATUSES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* ── Customer Info ── */}
                    <div className="space-y-4">
                        <div className="text-[11px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2"><User size={11} /> Datos del cliente</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold opacity-60 mb-1.5">Nombre completo *</label>
                                <div className="relative"><User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                                    <input type="text" value={data.customer_name} onChange={e => setData('customer_name', e.target.value)} placeholder="Juan Pérez" required
                                        className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all" />
                                </div>
                                {errors.customer_name && <p className="text-rose-500 text-xs mt-1">{errors.customer_name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold opacity-60 mb-1.5">Email *</label>
                                <div className="relative"><Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                                    <input type="email" value={data.customer_email} onChange={e => setData('customer_email', e.target.value)} placeholder="juan@email.com" required
                                        className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold opacity-60 mb-1.5">Teléfono / WhatsApp *</label>
                                <div className="relative"><Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                                    <input type="text" value={data.customer_phone} onChange={e => setData('customer_phone', e.target.value)} placeholder="+1 809 000 0000" required
                                        className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all" />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold opacity-60 mb-1.5">Dirección</label>
                                <div className="relative"><MapPin size={13} className="absolute left-3 top-3.5 opacity-40" />
                                    <textarea value={data.customer_address} onChange={e => setData('customer_address', e.target.value)} placeholder="Calle, sector, ciudad…" rows={2}
                                        className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all resize-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── User Assignment ── */}
                    <div className="space-y-4">
                        <div className="text-[11px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2"><Users size={11} /> Cuenta de usuario (para chat)</div>

                        {/* Mode selector */}
                        <div className="grid grid-cols-3 gap-2">
                            {([['none', 'Sin cuenta'], ['existing', 'Asignar existente'], ['create', 'Crear nuevo']] as const).map(([val, label]) => (
                                <button key={val} type="button" onClick={() => setData('user_action', val)}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all ${data.user_action === val ? 'bg-[var(--color-primary)] text-black border-[var(--color-primary)]' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Existing user search */}
                        {data.user_action === 'existing' && (
                            <div className="space-y-2">
                                <div className="relative">
                                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                                    <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Buscar cliente por nombre o email…"
                                        className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all" />
                                    {searchingUser && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin opacity-40" />}
                                </div>
                                {data.user_id && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-sm font-bold text-[var(--color-primary)]">
                                        <Check size={14} /> Usuario seleccionado (ID: {data.user_id})
                                        <button type="button" onClick={() => { setData('user_id', null); setUserSearch(''); }} className="ml-auto"><X size={13} /></button>
                                    </div>
                                )}
                                <AnimatePresence>
                                    {userResults.length > 0 && !data.user_id && (
                                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-xl overflow-hidden">
                                            {userResults.map(u => (
                                                <button key={u.id} type="button" onClick={() => { setData('user_id', u.id); setUserSearch(u.name); setUserResults([]); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-tertiary)] transition-colors text-left">
                                                    <Avatar name={u.name} color={u.avatar_color} size={28} />
                                                    <div>
                                                        <div className="font-bold text-sm">{u.name}</div>
                                                        <div className="text-xs opacity-50">{u.email}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Create new user */}
                        {data.user_action === 'create' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
                                <div>
                                    <label className="block text-xs font-bold opacity-60 mb-1.5">Nombre del usuario *</label>
                                    <input type="text" value={data.new_user_name} onChange={e => setData('new_user_name', e.target.value)} placeholder="Juan Pérez"
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all" />
                                    {errors.new_user_name && <p className="text-rose-500 text-xs mt-1">{errors.new_user_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold opacity-60 mb-1.5">Email del usuario *</label>
                                    <input type="email" value={data.new_user_email} onChange={e => setData('new_user_email', e.target.value)} placeholder="juan@email.com"
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all" />
                                    {errors.new_user_email && <p className="text-rose-500 text-xs mt-1">{errors.new_user_email}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold opacity-60 mb-1.5">Contraseña *</label>
                                    <input type="password" value={data.new_user_password} onChange={e => setData('new_user_password', e.target.value)} placeholder="Mínimo 8 caracteres"
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all" />
                                    {errors.new_user_password && <p className="text-rose-500 text-xs mt-1">{errors.new_user_password}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Products ── */}
                    <div className="space-y-4">
                        <div className="text-[11px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2"><Package size={11} /> Productos</div>
                        <div className="relative">
                            <Package size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                            <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Buscar producto…"
                                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all" />
                            <AnimatePresence>
                                {productSearch.length > 0 && filteredProducts.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                        className="absolute top-full left-0 right-0 mt-1 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-2xl overflow-hidden z-20 max-h-48 overflow-y-auto">
                                        {filteredProducts.slice(0, 6).map(p => (
                                            <button key={p.id} type="button" onClick={() => addProduct(p)}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-tertiary)] transition-colors text-left">
                                                <div className="w-8 h-8 rounded-xl bg-[var(--color-bg-tertiary)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" alt="" /> : <Package size={14} className="opacity-40" />}
                                                </div>
                                                <span className="flex-1 font-bold text-sm truncate">{p.name}</span>
                                                <span className="text-sm font-black text-[var(--color-primary)]">${p.price}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {errors.items && <p className="text-rose-500 text-xs">{String(errors.items)}</p>}
                        <div className="space-y-2">
                            <AnimatePresence>
                                {data.items.map((item, idx) => (
                                    <motion.div key={item.product_id} layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                                        className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
                                        <div className="flex-1 font-bold text-sm truncate">{item._label}</div>
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={() => updateQty(idx, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center font-black">−</button>
                                            <span className="w-5 text-center font-black text-sm">{item.quantity}</span>
                                            <button type="button" onClick={() => updateQty(idx, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center font-black">+</button>
                                        </div>
                                        <div className="font-black text-sm w-20 text-right">${(item.quantity * item.price).toFixed(2)}</div>
                                        <button type="button" onClick={() => removeItem(idx)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"><Trash2 size={13} /></button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {data.items.length === 0 && (
                                <div className="py-8 border-2 border-dashed border-[var(--color-border)]/40 rounded-2xl text-center opacity-40 text-sm font-bold italic">Busca y agrega productos arriba</div>
                            )}
                        </div>
                        {data.items.length > 0 && (
                            <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)]/50">
                                <span className="font-bold opacity-60 text-sm">Total</span>
                                <span className="text-2xl font-black text-[var(--color-primary)]">${total.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2 border-t border-[var(--color-border)]">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl border border-[var(--color-border)] font-bold hover:bg-[var(--color-bg-tertiary)] transition-colors">Cancelar</button>
                        <button type="submit" disabled={processing || data.items.length === 0}
                            className="flex-1 py-3 rounded-2xl bg-[var(--color-primary)] text-black font-black shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2">
                            <Check size={15} /> {processing ? 'Creando…' : 'Crear Orden'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ── Compact row ───────────────────────────────────────────────────────────────
function OrderRow({ order, onStatusUpdate, onClick }: {
    order: Order; onStatusUpdate: (id: number, s: string) => void; onClick: () => void;
}) {
    const cfg = sc(order.status);
    return (
        <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.18 }}
            className="grid gap-3 px-5 py-3.5 items-center hover:bg-[var(--color-bg-primary)]/50 transition-colors cursor-pointer group"
            style={{ gridTemplateColumns: '48px 1fr 120px 160px 100px' }}
            onClick={onClick}>
            <div className="text-center font-black text-sm opacity-35 group-hover:opacity-60 transition-opacity">#{order.id}</div>
            <div className="min-w-0 space-y-0.5">
                <div className="font-bold text-sm truncate flex items-center gap-2">
                    <User size={11} className="opacity-40 flex-shrink-0" />
                    <span className="truncate">{order.customer_name || '—'}</span>
                    {order.is_manual && <ManualBadge label={order.manual_label} />}
                </div>
                <div className="text-xs opacity-40 truncate">{order.customer_email}</div>
                {order.items?.length > 0 && (
                    <div className="text-xs opacity-50 truncate">
                        {order.items.slice(0, 2).map(i => `${i.quantity}× ${i.product?.name ?? '?'}`).join(', ')}
                        {order.items.length > 2 && ` +${order.items.length - 2} más`}
                    </div>
                )}
            </div>
            <div className="font-black text-sm">${parseFloat(order.total).toFixed(2)}</div>
            <div onClick={e => e.stopPropagation()}>
                <Dropdown>
                    <Dropdown.Trigger>
                        <button className="w-full px-3 py-2 rounded-xl text-xs font-bold border-0 hover:brightness-110 active:scale-95 transition-all flex items-center justify-between gap-2"
                            style={{ background: cfg.bg, color: cfg.text }}>
                            <span className="truncate">{order.status}</span>
                            <MoreHorizontal size={12} className="opacity-60 flex-shrink-0" />
                        </button>
                    </Dropdown.Trigger>
                    <Dropdown.Content align="left" width="48" contentClasses="bg-[var(--color-bg-secondary)] py-1.5 shadow-2xl border border-[var(--color-border)] rounded-2xl z-50">
                        {STATUSES.map(s => (
                            <button key={s} onClick={() => onStatusUpdate(order.id, s)} disabled={s === order.status}
                                className={`w-full text-left px-4 py-2.5 hover:bg-[var(--color-bg-primary)]/60 transition-colors text-sm font-bold flex items-center gap-3 ${s === order.status ? 'opacity-40 cursor-default' : ''}`}>
                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: sc(s).bg }} />
                                {s}
                            </button>
                        ))}
                    </Dropdown.Content>
                </Dropdown>
            </div>
            <div className="flex items-center justify-end gap-1.5 text-xs opacity-35 font-bold">
                {fmtShort(order.created_at)}
                <ChevronRight size={13} className="opacity-0 group-hover:opacity-60 transition-opacity" />
            </div>
        </motion.div>
    );
}

// ── Collapsible Group ─────────────────────────────────────────────────────────
function OrderGroup({ status, orders, onStatusUpdate, onOpenOrder, isSearching }: {
    status: string; orders: Order[];
    onStatusUpdate: (id: number, s: string) => void;
    onOpenOrder: (o: Order) => void;
    isSearching: boolean;
}) {
    const [open, setOpen] = useState(true);
    const cfg = sc(status);

    useEffect(() => { if (isSearching) setOpen(orders.length > 0); }, [isSearching, orders.length]);
    if (isSearching && orders.length === 0) return null;

    return (
        <div>
            <button onClick={() => setOpen(v => !v)}
                className="w-full flex items-center gap-4 group py-2.5 rounded-xl hover:bg-[var(--color-bg-secondary)]/40 px-2 -mx-2 transition-colors">
                <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }} className="opacity-50 group-hover:opacity-100">
                    <ChevronDown size={18} />
                </motion.div>
                <span className="px-4 py-1.5 rounded-full font-black uppercase tracking-wider text-sm shadow-sm flex-shrink-0"
                    style={{ background: cfg.bg, color: cfg.text }}>{status}</span>
                <span className="opacity-40 font-bold text-sm flex-shrink-0">{orders.length} {orders.length === 1 ? 'Orden' : 'Órdenes'}</span>
                <div className="h-px bg-[var(--color-border)] flex-1 opacity-30" />
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
                        <div className="pt-3">
                            <Surface variant="secondary" className="rounded-3xl border border-[var(--color-border)] shadow-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <div style={{ minWidth: '620px' }}>
                                        <div className="grid gap-3 px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/50 text-[10px] font-black uppercase tracking-widest opacity-50"
                                            style={{ gridTemplateColumns: '48px 1fr 120px 160px 100px' }}>
                                            <div className="text-center">ID</div><div>Cliente</div><div>Total</div><div>Estado</div><div className="text-right">Fecha</div>
                                        </div>
                                        <div className="divide-y divide-[var(--color-border)]/40">
                                            <AnimatePresence>
                                                {orders.length === 0
                                                    ? <div className="py-10 text-center opacity-30 font-bold italic text-sm">No hay órdenes</div>
                                                    : orders.map(o => <OrderRow key={o.id} order={o} onStatusUpdate={onStatusUpdate} onClick={() => onOpenOrder(o)} />)
                                                }
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </Surface>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Index({ orders: initialOrders, products }: { orders: Order[]; products: Product[] }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        if ((window as any).Echo) {
            (window as any).Echo.private('admin.orders')
                .listen('OrderCreated', (e: any) => setOrders(prev => [e.order, ...prev]))
                .listen('OrderStatusUpdated', (e: any) => {
                    setOrders(prev => prev.map(o => o.id === e.order.id ? { ...o, status: e.order.status } : o));
                    setSelectedOrder(prev => prev?.id === e.order.id ? ({ ...prev, status: e.order.status } as Order) : prev);
                });
        }
        return () => { if ((window as any).Echo) (window as any).Echo.leave('admin.orders'); };
    }, []);

    const handleStatusUpdate = (orderId: number, newStatus: string) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        setSelectedOrder(prev => prev?.id === orderId ? ({ ...prev, status: newStatus } as Order) : prev);
        router.patch(route('admin.orders.update-status', orderId), { status: newStatus }, {
            preserveScroll: true, onError: () => router.reload({ only: ['orders'] }),
        });
    };

    const q = search.trim().toLowerCase();
    const filteredOrders = useMemo(() => {
        if (!q) return orders;
        return orders.filter(o =>
            String(o.id).includes(q) ||
            (o.customer_name ?? '').toLowerCase().includes(q) ||
            (o.customer_email ?? '').toLowerCase().includes(q) ||
            (o.customer_phone ?? '').toLowerCase().includes(q)
        );
    }, [orders, q]);

    const groupedOrders = useMemo(() =>
        STATUSES.map(status => ({ status, orders: filteredOrders.filter(o => o.status === status) })),
        [filteredOrders]);

    return (
        <AuthenticatedLayout>
            <Head title="CRM de Órdenes" />

            <AnimatePresence>
                {selectedOrder && (
                    <OrderDialog key={selectedOrder.id} order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={handleStatusUpdate} />
                )}
            </AnimatePresence>

            <CreateOrderModal open={showCreate} onClose={() => setShowCreate(false)} products={products} />

            <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end gap-6 justify-between">
                    <div>
                        <Typography variant="h1" className="text-4xl md:text-5xl font-black mb-2 tracking-tight">CRM de Órdenes</Typography>
                        <Typography variant="muted" className="opacity-60">
                            {orders.length} orden{orders.length !== 1 ? 'es' : ''} · tiempo real
                        </Typography>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                            </span>
                            En vivo
                        </div>
                        <button onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--color-primary)] text-black font-black text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all">
                            <Plus size={15} /> Nueva Orden
                        </button>
                    </div>
                </div>

                <div className="relative max-w-xl">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none"><Search size={17} /></div>
                    <input id="order-search" type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por ID, nombre, email o teléfono…"
                        className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm font-medium placeholder:opacity-30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all shadow-sm" />
                    {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"><X size={15} /></button>}
                </div>

                <div className="space-y-8">
                    {groupedOrders.map(g => (
                        <OrderGroup key={g.status} status={g.status} orders={g.orders}
                            onStatusUpdate={handleStatusUpdate}
                            onOpenOrder={o => setSelectedOrder(orders.find(x => x.id === o.id) ?? o)}
                            isSearching={q.length > 0} />
                    ))}
                    {q.length > 0 && filteredOrders.length === 0 && (
                        <div className="py-32 text-center border-4 border-dashed border-[var(--color-border)]/30 rounded-[4rem]">
                            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-[var(--color-primary)] opacity-20" />
                            <Typography variant="h2" className="text-xl font-black opacity-50">Sin resultados</Typography>
                            <button onClick={() => setSearch('')} className="mt-4 px-5 py-2 rounded-full border-2 border-[var(--color-border)] text-sm font-bold">Limpiar</button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
