'use client';

import React, { useRef } from 'react';
import { CollapsibleSidePanel } from '@/components/ui/CollapsibleSidePanel';
import { ResizablePanel } from '@/components/ui/resizable';
import { cn } from '@/infrastructure/utils/cn';
import { BuilderSidebarProps } from './types';

/** Below this % width the sidebar auto-collapses to icon-HUD mode */
const AUTO_COLLAPSE_THRESHOLD = 12;

export const BuilderSidebar = React.forwardRef<any, BuilderSidebarProps>((
    {
        panels,
        activeKey,
        onActiveKeyChange,
        side,
        defaultSize = 22,
        className,
        onResize,
    },
    ref
) => {
    const isLeft = side === 'left';
    const isCollapsed = !activeKey;

    // Remember the last open panel key so we can restore it on expand
    const lastActiveKeyRef = useRef<string>(activeKey || (panels[0]?.key ?? ''));
    if (activeKey) {
        lastActiveKeyRef.current = activeKey;
    }

    // Intelligence Suite: Dynamically adjust panel constraints to force HUD mode when collapsed
    const minSize = isCollapsed ? 4.5 : 15;
    const maxSize = isCollapsed ? 4.5 : 40;

    const handleResize = (size: number) => {
        onResize?.(size);

        if (size < AUTO_COLLAPSE_THRESHOLD && activeKey) {
            // User dragged the panel narrower than the threshold — collapse to icon-HUD
            onActiveKeyChange('');
        } else if (size >= AUTO_COLLAPSE_THRESHOLD && !activeKey) {
            // User dragged the panel wider than the threshold — restore last open panel
            onActiveKeyChange(lastActiveKeyRef.current);
        }
    };

    return (
        <ResizablePanel
            ref={ref}
            defaultSize={isCollapsed ? 4.5 : defaultSize}
            minSize={minSize}
            maxSize={maxSize}
            collapsible={false}
            onResize={handleResize}
            className={cn(
                'flex flex-col h-full bg-background/40 backdrop-blur-2xl transition-all duration-500 ease-[0.22,1,0.36,1] relative group/sidebar overflow-hidden z-20',
                isLeft ? 'border-e border-border/10' : 'border-s border-border/10',
                className
            )}
        >
            <div className="h-full w-full min-w-0 flex flex-col">
                <CollapsibleSidePanel
                    panels={panels}
                    activeKey={activeKey}
                    onActiveKeyChange={onActiveKeyChange}
                    side={side}
                    className="rounded-none border-none bg-transparent shadow-none h-full"
                />
            </div>
        </ResizablePanel>
    );
});

BuilderSidebar.displayName = 'BuilderSidebar';
