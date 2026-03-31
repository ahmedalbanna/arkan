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
    defaultSize = 25,
    className
}, ref) => {
    const isLeft = side === 'left';

    return (
        <ResizablePanel 
            ref={ref}
            defaultSize={defaultSize} 
            minSize={4} 
            maxSize={40} 
            className={cn(
                "flex flex-col h-full bg-background transition-all duration-700 ease-in-out relative group/sidebar",
                isLeft ? "border-r border-border/40" : "border-l border-border/40",
                className
            )}
        >
            <CollapsibleSidePanel 
                panels={panels}
                activeKey={activeKey}
                onActiveKeyChange={onActiveKeyChange}
                side={side}
            />
        </ResizablePanel>
    );
});

BuilderSidebar.displayName = 'BuilderSidebar';
