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
        <div className={cn("flex flex-col h-full bg-background/40 backdrop-blur-2xl relative overflow-hidden", className)}>
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

            {/* Sticky Technical Header */}
            <header className="h-12 shrink-0 px-6 flex items-center justify-between border-b border-border/40 bg-background/60 backdrop-blur-xl z-20">
                <div className="flex items-center gap-2.5 min-w-0">
                    {icon && <div className="text-primary/60">{icon}</div>}
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/80 truncate">
                        {title}
                    </h2>
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </header>

            {/* Scrollable Content Area */}
            <ScrollArea className="flex-1 min-h-0 relative z-10">
                <div className="p-6 flex flex-col gap-8 pb-20">
                    {children}
                </div>
            </ScrollArea>

            {/* Subtle Gradient Shadow (Bottom) */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none z-20 opacity-60" />
        </div>
    );
};
