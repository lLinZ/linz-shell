import React, { useState, useMemo } from 'react';
import Modal from '@/Components/Modal';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { Search, Palette, X } from 'lucide-react';
import TextInput from '@/Components/TextInput';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

// Filter valid icon component names
const validIcons = Object.keys(LucideIcons).filter(
    (key) => typeof (LucideIcons as any)[key] === 'object' || typeof (LucideIcons as any)[key] === 'function'
).filter(key => key !== 'createLucideIcon' && key !== 'default' && key !== 'IconNode' && key !== 'LucideProps');

interface IconBrowserProps {
    show: boolean;
    onClose: () => void;
    onSelect: (iconName: string) => void;
    currentIcon?: string;
}

export default function IconBrowser({ show, onClose, onSelect, currentIcon }: IconBrowserProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredIcons = useMemo(() => {
        if (!searchQuery) {
            // Return first 200 icons to prevent performance issues if no search
            return validIcons.slice(0, 200);
        }
        return validIcons.filter(icon => icon.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 200);
    }, [searchQuery]);

    return (
        <Modal show={show} onClose={onClose} maxWidth="4xl" zIndex={60}>
            <div className="flex flex-col h-[85vh] bg-[var(--color-bg-primary)] overflow-hidden rounded-[2.5rem] border border-[var(--color-border)] shadow-2xl">
                {/* Header */}
                <div className="p-8 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-secondary)]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--color-primary)]/10 rounded-2xl text-[var(--color-primary)]">
                            <Palette className="w-6 h-6" />
                        </div>
                        <div>
                            <Typography variant="h3" className="font-black">Biblioteca de Iconos</Typography>
                            <Typography variant="muted" className="text-xs font-bold uppercase tracking-widest opacity-60">Selecciona el icono perfecto</Typography>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-xl transition-colors"
                    >
                        <X className="w-6 h-6 text-[var(--color-text-muted)]" />
                    </button>
                </div>

                <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]">
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                        <TextInput
                            placeholder="Buscar iconos... (ej. User, Home, Star)"
                            className="w-full h-14 pl-12 pr-6 bg-[var(--color-bg-tertiary)]/50 border-[var(--color-border)] rounded-2xl focus:ring-2 focus:ring-[var(--color-primary)]/40 text-lg transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Body - Grid de Iconos */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                        {filteredIcons.map((iconName) => {
                            const IconComponent = (LucideIcons as any)[iconName];
                            if (!IconComponent) return null;

                            const isSelected = currentIcon === iconName;

                            return (
                                <button
                                    key={iconName}
                                    type="button"
                                    onClick={() => {
                                        onSelect(iconName);
                                        onClose();
                                    }}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 group relative",
                                        isSelected
                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.2)]"
                                            : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-primary)]/50 text-[var(--color-text-primary)] hover:scale-105"
                                    )}
                                    title={iconName}
                                >
                                    <IconComponent className="w-8 h-8 mb-2 group-hover:text-[var(--color-primary)] transition-colors" />
                                    <span className="text-[9px] font-bold truncate w-full text-center opacity-70 group-hover:opacity-100">
                                        {iconName}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    {filteredIcons.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-muted)]">
                            <Search className="w-16 h-16 mb-4 opacity-20" />
                            <Typography variant="h4" className="font-bold opacity-50">No se encontraron iconos</Typography>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
