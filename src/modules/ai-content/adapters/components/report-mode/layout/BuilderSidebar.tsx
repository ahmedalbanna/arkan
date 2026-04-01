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
                "flex flex-col h-full bg-background/40 backdrop-blur-2xl transition-all duration-700 ease-[0.22,1,0.36,1] relative group/sidebar overflow-hidden",
                isLeft ? "border-r border-border/40" : "border-l border-border/40",
                !activeKey && (isLeft ? "w-[4.5%] min-w-[64px]" : "w-[4.5%] min-w-[64px]"),
                className
            )}
        >
            <CollapsibleSidePanel 
                panels={panels}
                activeKey={activeKey}
                onActiveKeyChange={onActiveKeyChange}
                side={side}
                className="rounded-none border-none bg-transparent shadow-none"
            />
        </ResizablePanel>
    );
});

BuilderSidebar.displayName = 'BuilderSidebar';
