'use client';

import React from 'react';
import { cn } from '@/infrastructure/utils/cn';
import { PROSE_CLASSES } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';

/**
 * A4Page — Standardized high-fidelity document container.
 * Mimics physical A4 dimensions with technical atmospheric decorations.
 * 
 * DEFENSIVE MEASURES:
 * 1. Style Robustness: Fallback for zoom scale to prevent NaN/undefined transform.
 * 2. Overflow Protection: flex-1 min-h-0 pattern to contain massive markdown prose.
 * 3. Responsive Scaling: Standardized transform-origin for predictable zoom vectors.
 */

interface A4PageProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    viewMode?: 'single' | 'continuous' | 'carousel';
}

export const A4Page = ({ children, title, className, viewMode = 'single' }: A4PageProps) => {
    // 1. STYLE FALLBACKS — Safeguard against missing zoom variables
    const zoomScale = 'var(--zoom-scale, 1)';

    return (
        <div
            className={cn(
                "relative group bg-background p-16 md:p-20 mx-auto flex flex-col transition-all duration-500 ease-out",
                viewMode !== 'carousel' && 'shadow-[0_0_80px_-20px_rgba(0,0,0,0.15),0_0_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_0_100px_-20px_rgba(0,0,0,0.2),0_0_50px_-10px_rgba(var(--primary),0.05)] my-12 rounded-sm',
                viewMode === 'single' && 'w-full max-w-[210mm] min-h-[297mm] box-border border border-border/40 dark:border-border/20',
                viewMode === 'continuous' && 'w-full max-w-5xl shadow-none border-none rounded-none p-0 md:p-0',
                viewMode === 'carousel' && 'w-full h-full shadow-2xl box-border border border-border/40 dark:border-border/20',
                className
            )}
            style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: 'top center',
            }}
        >
            {/* Technical Crop Marks — Intelligence Suite Detail */}
            <div className="absolute top-4 left-4 w-8 h-px bg-primary/10" />
            <div className="absolute top-4 left-4 w-px h-8 bg-primary/10" />
            <div className="absolute top-4 right-4 w-8 h-px bg-primary/10" />
            <div className="absolute top-4 right-4 w-px h-8 bg-primary/10" />
            <div className="absolute bottom-4 left-4 w-8 h-px bg-primary/10" />
            <div className="absolute bottom-4 left-4 w-px h-8 bg-primary/10" />
            <div className="absolute bottom-4 right-4 w-8 h-px bg-primary/10" />
            <div className="absolute bottom-4 right-4 w-px h-8 bg-primary/10" />

            {/* Premium Lighting Gradient */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,_white_0%,_transparent_100%)] opacity-[0.02] dark:opacity-[0.01]" />

            {/* Page Edge Decoration */}
            <div className="absolute inset-0 pointer-events-none border-[0.5px] border-black/5 dark:border-white/5 rounded-sm ring-1 ring-black/[0.02] dark:ring-white/[0.02]" />

            {title && (
                <div className="relative mb-12 group/title">
                    <div className="flex items-center gap-3 mb-2 opacity-40 group-hover/title:opacity-100 transition-opacity duration-500">
                        <div className="h-px w-6 bg-primary/40" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Node Identity</span>
                    </div>
                    <h2 className="text-4xl font-black font-headline text-foreground tracking-tighter leading-none mb-4">{title}</h2>
                    <div className="h-1.5 w-16 bg-gradient-to-r from-primary via-primary/60 to-transparent rounded-full group-hover:w-32 transition-all duration-700 ease-in-out" />
                </div>
            )}

            {/* 2. OVERFLOW CONTAINMENT — Handle extreme content volumes */}
            <div className={cn(PROSE_CLASSES, "flex-grow min-h-0 overflow-visible selection:bg-primary/20")}>
                {children || (
                    <div className="flex flex-col items-center justify-center py-32 opacity-20 italic text-[11px] font-medium tracking-widest uppercase">
                        Zero payload detected in document core.
                    </div>
                )}
            </div>

            {/* Page Footer */}
            <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-end text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] group-hover:text-primary transition-colors duration-500">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_rgba(var(--primary),0.4)]" />
                        <span className="tracking-[0.25em]">Arkan Neural Suite</span>
                    </div>
                    <span className="opacity-40 font-bold ml-3.5 tracking-widest">Manifest v2.4.0-STABLE</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="opacity-40 font-bold tracking-widest">A4 MATRIX</span>
                    <div className="px-3 py-1 bg-muted/20 border border-border/40 rounded-lg min-w-[44px] text-center tabular-nums shadow-inner">
                        INDEX 01
                    </div>
                </div>
            </div>
        </div>
    );
}

export default A4Page;
