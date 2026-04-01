'use client';

import React from 'react';
import { CollapsibleSidePanel } from '@/components/ui/CollapsibleSidePanel';
import { ResizablePanel } from '@/components/ui/resizable';
import { cn } from '@/infrastructure/utils/cn';
import { BuilderSidebarProps } from './types';

export const BuilderSidebar = React.forwardRef<any, BuilderSidebarProps>(({
    panels,
    activeKey,
    onActiveKeyChange,
    side,
    defaultSize = 22,
    className
}, ref) => {
    const isLeft = side === 'left';
    const isCollapsed = !activeKey;

    // Intelligence Suite: Dynamically adjust panel constraints to force HUD mode when collapsed
    // This creates a smooth "shrink to icons" effect
    const minSize = isCollapsed ? 4.5 : 15;
    const maxSize = isCollapsed ? 4.5 : 40;

    return (
        <ResizablePanel 
            ref={ref}
            defaultSize={isCollapsed ? 4.5 : defaultSize} 
            minSize={minSize} 
            maxSize={maxSize} 
            collapsible={false}
            className={cn(
                "flex flex-col h-full bg-background/40 backdrop-blur-2xl transition-all duration-500 ease-[0.22,1,0.36,1] relative group/sidebar overflow-hidden z-20",
                isLeft ? "border-e border-border/10" : "border-s border-border/10",
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
