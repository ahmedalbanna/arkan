'use client';

import React from 'react';
import { ArrowRight, Cpu, Binary } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/infrastructure/utils/cn';

/**
 * AIToolCard — High-fidelity node representation for the Writing Arsenal.
 * Implements the technical "Blueprint" aesthetic with crop marks and vector identity.
 * 
 * DEFENSIVE MEASURES:
 * 1. Safe Event Handling: Prevents rapid-fire clicks through transition timing.
 * 2. Visual Fidelity: 28px dot-grid sub-layer and high-density labels.
 * 3. Type Safety: Explicit interface for tool metadata and vector identifiers.
 */

interface AIToolCardProps {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    vector?: string;
    tag?: string;
    onClick: () => void;
    className?: string;
}

export function AIToolCard({
    title,
    description,
    icon: Icon,
    vector = 'NODE_V1',
    tag = 'Logical',
    onClick,
    className
}: AIToolCardProps) {
    return (
        <div 
            onClick={onClick}
            className={cn(
                "group relative bg-card/40 backdrop-blur-xl p-8 rounded-[32px] border border-border/60 hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.12)] hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer overflow-hidden",
                className
            )}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
        >
            {/* 28px Sub-grid Atmosphere */}
            <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:20px_20px]" />

            {/* Technical Background Glyph */}
            <div className="absolute -top-8 -right-8 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-1000 rotate-12 pointer-events-none">
                <Icon className="w-48 h-48 text-primary" />
            </div>

            {/* Crop Marks — Technical detail */}
            <div className="absolute top-5 left-5 w-3 h-px bg-primary/10" />
            <div className="absolute top-5 left-5 w-px h-3 bg-primary/10" />
            <div className="absolute top-5 right-5 w-3 h-px bg-primary/10" />
            <div className="absolute top-5 right-5 w-px h-3 bg-primary/10" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="h-12 w-12 rounded-[18px] bg-primary/10 flex items-center justify-center border border-primary/5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-[8px] uppercase tracking-widest font-black border-primary/20 text-primary/60 bg-primary/5 shadow-inner px-2 py-0">
                            {tag}
                        </Badge>
                        <span className="text-[7px] font-mono font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
                            {vector}
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-[18px] font-black font-headline tracking-tight group-hover:text-primary transition-colors uppercase leading-tight">
                        {title}
                    </h3>
                    <p className="text-muted-foreground/70 leading-relaxed text-[12px] line-clamp-3 italic font-serif font-medium">
                        {description}
                    </p>
                </div>

                <div className="mt-8 pt-5 border-t border-primary/10 flex items-center justify-between">
                    <div className="flex items-center text-[9px] font-black uppercase tracking-[0.25em] text-primary/60 group-hover:text-primary transition-all translate-x-[-4px] group-hover:translate-x-0">
                        Initialize Node <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Cpu className="h-2.5 w-2.5 text-primary/20" />
                        <Binary className="h-2.5 w-2.5 text-primary/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}
