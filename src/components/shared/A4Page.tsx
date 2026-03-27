
'use client';

import { cn } from '@/infrastructure/utils/cn';
import React from 'react';

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
                "relative group bg-background p-12 md:p-16 mx-auto flex flex-col transition-all duration-300",
                viewMode !== 'carousel' && 'shadow-[0_0_50px_-12px_rgba(0,0,0,0.15)] hover:shadow-[0_0_60px_-12px_rgba(0,0,0,0.25)] my-8 rounded-sm',
                viewMode === 'single' && 'w-full max-w-[210mm] min-h-[297mm] box-border border border-border/40 dark:border-border/20',
                viewMode === 'continuous' && 'w-full max-w-4xl shadow-none border-none rounded-none p-0 md:p-0',
                viewMode === 'carousel' && 'w-full h-full shadow-2xl box-border border border-border/40 dark:border-border/20',
                className
            )}
            style={{
                transform: 'scale(var(--zoom-scale, 1))',
                transformOrigin: 'top center',
            }}
        >
            {/* Page Edge Decoration */}
            <div className="absolute inset-0 pointer-events-none border-[0.5px] border-black/5 dark:border-white/5 rounded-sm" />
            
            {title && (
                <div className="relative mb-10 group/title">
                    <h2 className="text-3xl font-bold font-headline text-foreground tracking-tight">{title}</h2>
                    <div className="h-1 w-12 bg-primary mt-3 rounded-full group-hover:w-24 transition-all duration-500" />
                </div>
            )}
            
            <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed flex-grow font-serif selection:bg-primary/10">
                {children}
            </div>

            {/* Subtle Page Footer */}
            <div className="mt-12 pt-6 border-t border-border/40 flex justify-between items-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                <span>Arkan Intelligent Writer</span>
                <span>Page 1</span>
            </div>
        </div>
    );
}

export default A4Page;
