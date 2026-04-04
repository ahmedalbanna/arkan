'use client';

import React from 'react';
import { CollapsibleSidePanel } from '@/components/ui/CollapsibleSidePanel';
import { cn } from '@/infrastructure/utils/cn';
import { BuilderSidebarProps } from './types';

export const BuilderSidebar = React.forwardRef<HTMLDivElement, BuilderSidebarProps>((
    {
        panels,
        activeKey,
        onActiveKeyChange,
        side,
        className,
    },
    ref
) => {
    const isCollapsed = !activeKey;

    return (
        <div
            ref={ref}
            className={cn(
                'flex flex-col h-full bg-background/40 backdrop-blur-3xl transition-all duration-500 ease-[0.22,1,0.36,1] relative overflow-hidden z-20',
                'border border-primary/10 shadow-[0_8px_40px_rgba(0,0,0,0.08)] rounded-[32px]',
                isCollapsed ? 'w-[72px]' : 'w-[400px]',
                className
            )}
        >
            {/* Dot-grid atmosphere — aligned with BuilderCanvas & BuilderHeader (28px, 1.5px center) */}
            <div
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                }}
            />

            <div className="h-full w-full min-w-0 flex flex-col relative z-10">
                <CollapsibleSidePanel
                    panels={panels}
                    activeKey={activeKey}
                    onActiveKeyChange={onActiveKeyChange}
                    side={side}
                    className="rounded-none border-none bg-transparent shadow-none h-full"
                />
            </div>
        </div>
    );
});

BuilderSidebar.displayName = 'BuilderSidebar';
