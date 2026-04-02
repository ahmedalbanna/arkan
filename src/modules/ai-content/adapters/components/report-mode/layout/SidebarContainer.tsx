'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/infrastructure/utils/cn';

interface SidebarContainerProps {
    title: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export const SidebarContainer = ({
    title,
    icon,
    actions,
    children,
    className
}: SidebarContainerProps) => {
    return (
        <div className={cn(
            "flex flex-col h-full bg-background/40 backdrop-blur-2xl relative overflow-hidden",
            className
        )}>
            {/* Dot-grid atmosphere — aligned with BuilderCanvas (28px, 1.5px center) */}
            <div
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                }}
            />

            {/* Sticky Technical Header */}
            <header className="h-11 shrink-0 px-5 flex items-center justify-between border-b border-border/40 bg-background/50 backdrop-blur-2xl relative z-20">
                {/* Subtle left accent line */}
                <div className="absolute left-0 inset-y-2 w-[2px] rounded-full bg-primary/20" aria-hidden />

                <div className="flex items-center gap-2 min-w-0">
                    {icon && (
                        <span className="text-primary/50 shrink-0">
                            {icon}
                        </span>
                    )}
                    <h2 className="text-[10px] font-black uppercase tracking-[0.22em] text-foreground/70 truncate">
                        {title}
                    </h2>
                </div>

                {actions && (
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                        {actions}
                    </div>
                )}
            </header>

            {/* Scrollable Content Area */}
            <ScrollArea className="flex-1 min-h-0 relative z-10">
                <div className="p-5 flex flex-col gap-6 pb-20">
                    {children}
                </div>
            </ScrollArea>

            {/* Bottom fade — matches canvas gradient style */}
            <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background/60 to-transparent pointer-events-none z-20" />
        </div>
    );
};
