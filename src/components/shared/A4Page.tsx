
'use client';

import { cn } from '@/infrastructure/utils/cn';
import React from 'react';
import { PROSE_CLASSES } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';

interface A4PageProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    viewMode?: 'single' | 'continuous' | 'carousel';
}

export const A4Page = ({ children, title, className, viewMode = 'single' }: A4PageProps) => {
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
                transform: 'scale(var(--zoom-scale, 1))',
                transformOrigin: 'top center',
            }}
        >
            {/* Technical Crop Marks */}
            <div className="absolute top-4 left-4 w-8 h-px bg-primary/10" />
            <div className="absolute top-4 left-4 w-px h-8 bg-primary/10" />
            <div className="absolute top-4 right-4 w-8 h-px bg-primary/10" />
            <div className="absolute top-4 right-4 w-px h-8 bg-primary/10" />
            <div className="absolute bottom-4 left-4 w-8 h-px bg-primary/10" />
            <div className="absolute bottom-4 left-4 w-px h-8 bg-primary/10" />
            <div className="absolute bottom-4 right-4 w-8 h-px bg-primary/10" />
            <div className="absolute bottom-4 right-4 w-px h-8 bg-primary/10" />

            {/* Premium Lighting Gradient */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.02] via-transparent to-black/[0.01] dark:from-white/[0.01] dark:to-transparent" />
            
            {/* Page Edge Decoration */}
            <div className="absolute inset-0 pointer-events-none border-[0.5px] border-black/5 dark:border-white/5 rounded-sm ring-1 ring-black/[0.02] dark:ring-white/[0.02]" />
            
            {title && (
                <div className="relative mb-12 group/title">
                    <div className="flex items-center gap-3 mb-2 opacity-40 group-hover/title:opacity-100 transition-opacity duration-500">
                        <div className="h-px w-6 bg-primary/40" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Manifest Section</span>
                    </div>
                    <h2 className="text-4xl font-black font-headline text-foreground tracking-tighter leading-none mb-4">{title}</h2>
                    <div className="h-1.5 w-16 bg-gradient-to-r from-primary via-primary/60 to-transparent rounded-full group-hover:w-32 transition-all duration-700 ease-in-out" />
                </div>
            )}
            
            <div className={cn(PROSE_CLASSES, "flex-grow")}>
                {children}
            </div>

            {/* High-Fidelity Page Footer */}
            <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-end text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] group-hover:text-primary transition-colors duration-500">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span>Arkan Intelligent Synthesis Engine</span>
                    </div>
                    <span className="opacity-40 font-bold ml-3.5 tracking-widest">Document Artifact v1.0</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="opacity-40 font-bold">A4 Production Standard</span>
                    <div className="px-2 py-1 bg-muted/20 border rounded-md min-w-[40px] text-center tabular-nums">
                        Page 01
                    </div>
                </div>
            </div>
        </div>
    );
}

export default A4Page;
