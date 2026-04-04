'use client';

import React from 'react';
import { FileText, Presentation, CheckCircle2, ChevronRight, Layout } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';
import { Badge } from '@/components/ui/badge';

/**
 * FormatSelector — High-fidelity selection card for document production formats.
 * Features technical metadata, template state awareness, and Intelligence Suite styling.
 */

interface FormatSelectorProps {
    type: 'docx' | 'pptx';
    title: string;
    description: string;
    isSelected: boolean;
    onSelect: () => void;
    templateName?: string;
    specs: string[];
}

export function FormatSelector({
    type,
    title,
    description,
    isSelected,
    onSelect,
    templateName,
    specs
}: FormatSelectorProps) {
    const Icon = type === 'docx' ? FileText : Presentation;

    return (
        <div 
            onClick={onSelect}
            className={cn(
                "group relative p-5 rounded-[24px] border transition-all duration-500 cursor-pointer overflow-hidden",
                isSelected 
                    ? "bg-primary/[0.03] border-primary/30 shadow-[0_8px_32px_rgba(var(--primary),0.12)] ring-1 ring-primary/20" 
                    : "bg-muted/5 border-border/40 hover:border-primary/20 hover:bg-muted/8"
            )}
        >
            {/* Selection indicator HUD */}
            <div className={cn(
                "absolute top-4 right-4 transition-all duration-500",
                isSelected ? "opacity-100 scale-100" : "opacity-0 scale-50"
            )}>
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20 ring-4 ring-primary/5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
            </div>

            <div className="flex flex-col gap-5 relative z-10">
                {/* Format Identity */}
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-500",
                        isSelected 
                            ? "bg-primary/10 border-primary/20 shadow-inner text-primary" 
                            : "bg-background border-border/40 text-muted-foreground/40 group-hover:border-primary/20 group-hover:text-primary/60"
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5">
                        <h4 className={cn(
                            "text-[14px] font-black uppercase tracking-tight transition-colors duration-500",
                            isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80"
                        )}>
                            {title}
                        </h4>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="h-4 text-[7px] font-black uppercase border-primary/10 bg-primary/5 text-primary/60 px-1.5 rounded-sm tabular-nums">
                                {type.toUpperCase()} CORE
                            </Badge>
                            {templateName && (
                                <span className="text-[9px] font-bold text-primary/40 uppercase tracking-widest">{templateName}</span>
                            )}
                        </div>
                    </div>
                </div>

                <p className="text-[11px] text-muted-foreground/70 leading-relaxed font-medium line-clamp-2 italic">
                    {description}
                </p>

                {/* Technical Specs HUD */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 border-t border-primary/5">
                    {specs.map((spec, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 opacity-40 group-hover:opacity-60 transition-opacity">
                            <div className="h-1 w-1 rounded-full bg-primary/60" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{spec}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Atmospheric Background Decoration */}
            <div className={cn(
                "absolute -bottom-4 -right-4 opacity-[0.02] transition-all duration-700 pointer-events-none group-hover:opacity-[0.05] group-hover:scale-110",
                isSelected && "opacity-[0.08] scale-110"
            )}>
                <Icon className="h-24 w-24" />
            </div>
        </div>
    );
}
