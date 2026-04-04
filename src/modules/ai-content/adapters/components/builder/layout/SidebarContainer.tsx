'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/infrastructure/utils/cn';

/**
 * SidebarContainer — A modular high-fidelity wrapper for sidebar panels.
 * Implements glassmorphism, technical headers, and atmospheric backgrounds.
 */

interface SidebarContainerProps {
    title: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    noScroll?: boolean;
}

export const SidebarContainer = ({
    title,
    icon,
    actions,
    children,
    className,
    noScroll = false
}: SidebarContainerProps) => {
    return (
        <div className={cn(
            "flex flex-col h-full bg-background/40 backdrop-blur-3xl relative overflow-hidden",
            className
        )}>
            {/* Dot-grid atmosphere — Standardized Workspace Alignment (28px) */}
            <div
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                }}
            />

            {/* Inner premium highlights */}
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 dark:ring-white/5 rounded-none" />

            {/* Sticky Technical Header — Intelligence Suite standard */}
            <header className="h-12 shrink-0 px-5 flex items-center justify-between border-b border-primary/10 bg-background/50 backdrop-blur-2xl relative z-20 overflow-hidden group/header">
                {/* Tactical left accent line */}
                <div className="absolute left-0 inset-y-2 w-[2px] rounded-full bg-primary/30 group-hover/header:bg-primary/60 transition-colors duration-500" aria-hidden />

                <div className="flex items-center gap-2.5 min-w-0">
                    {icon && (
                        <span className="text-primary/40 shrink-0 group-hover/header:text-primary/60 transition-colors duration-500">
                            {icon}
                        </span>
                    )}
                    <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/60 group-hover/header:text-foreground/90 transition-colors duration-500 truncate">
                        {title}
                    </h2>
                </div>

                {actions && (
                    <div className="flex items-center gap-1.5 shrink-0 ml-2 relative z-10">
                        {actions}
                    </div>
                )}
            </header>

            {/* Content Implementation */}
            {noScroll ? (
                <div className="flex-1 relative z-10 p-5 flex flex-col gap-6">
                    {children}
                </div>
            ) : (
                <ScrollArea className="flex-1 min-h-0 relative z-10">
                    <div className="p-5 flex flex-col gap-6 pb-20">
                        {children}
                    </div>
                </ScrollArea>
            )}

            {/* Bottom ambient fade */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/60 to-transparent pointer-events-none z-20" />
        </div>
    );
};
