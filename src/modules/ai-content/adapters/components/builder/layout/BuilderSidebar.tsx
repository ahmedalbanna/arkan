'use client';

import React from 'react';
import { CollapsibleSidePanel } from '@/components/ui/CollapsibleSidePanel';
import { cn } from '@/infrastructure/utils/cn';
import { BuilderSidebarProps } from './types';
import { ShieldCheck } from 'lucide-react';

/**
 * BuilderSidebar — High-density side panel for the AI synthesis suite.
 * Orchestrates modular panels for navigation, generation, and source mapping.
 * 
 * DEFENSIVE MEASURES:
 * 1. Edge-to-Edge: Removes rounding and shadows for a flush, integrated feel.
 * 2. Visual Fidelity: 28px dot-grids and high-density status manifests.
 * 3. Atomic Sizing: Dynamic width orchestration with glassmorphism.
 * 4. Purity: Strictly handles panel presentation and transition vectors.
 */

export const BuilderSidebar = React.forwardRef<HTMLDivElement, BuilderSidebarProps>((
    {
        panels = [],
        activeKey,
        onActiveKeyChange,
        side,
        className,
    },
    ref
) => {
    // 1. EXISTENCE GUARDS — Handle stale or missing keys
    const safeActiveKey = activeKey && panels.some(p => p.key === activeKey) ? activeKey : '';
    const isCollapsed = !safeActiveKey;
    const isLeft = side === 'left';

    return (
        <div
            ref={ref}
            className={cn(
                'flex flex-col h-full bg-background transition-all duration-500 ease-[0.22,1,0.36,1] relative overflow-hidden z-20',
                isLeft ? 'border-r border-primary/10' : 'border-l border-primary/10',
                isCollapsed ? 'w-[72px]' : isLeft ? 'w-[var(--sidebar-w-left,320px)]' : 'w-[var(--sidebar-w,400px)]',
                className
            )}
        >
            {/* Dot-grid atmosphere — Aligned with BuilderCanvas (28px) */}
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
                    activeKey={safeActiveKey}
                    onActiveKeyChange={onActiveKeyChange}
                    side={side}
                    className="border-none bg-transparent shadow-none h-full rounded-none"
                />
            </div>

            {/* 2. STABLE MANIFEST FOOTER — Integrated Technical Identity */}
            <footer className={cn(
                "absolute bottom-0 left-0 right-0 h-10 border-t border-primary/5 bg-muted/5 flex items-center justify-between px-5 transition-opacity duration-500",
                isCollapsed ? "opacity-0" : "opacity-100"
            )}>
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary/30" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 truncate">
                        Registry Node {isLeft ? '01' : '02'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-2.5 w-2.5 text-primary/30" />
                        <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums">V2.4.0-S</span>
                    </div>
                </div>
            </footer>
        </div>
    );
});

BuilderSidebar.displayName = 'BuilderSidebar';
