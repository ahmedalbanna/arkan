'use client';

import { CollapsibleSidePanel } from '@/components/ui/CollapsibleSidePanel';
import { cn } from '@/infrastructure/utils/cn';
import React, { useCallback, useState } from 'react';
import { BuilderSidebarProps } from './types';

const MIN_WIDTH = { left: 240, right: 320 };
const MAX_WIDTH = { left: 480, right: 600 };
const DEFAULT_WIDTH = { left: 320, right: 400 };

/**
 * BuilderSidebar — Desktop-only resizable sidebar wrapper.
 * Delegates panel rendering to CollapsibleSidePanel.
 * Width is controlled via inline style (no dynamic Tailwind).
 */
export const BuilderSidebar = React.forwardRef<HTMLDivElement, BuilderSidebarProps>(
  ({ panels = [], activeKey, onActiveKeyChange, side, width, onWidthChange, className }, ref) => {
    const isLeft = side === 'left';
    const safeActiveKey = activeKey && panels.some((p) => p.key === activeKey) ? activeKey : '';
    const isCollapsed = !safeActiveKey;

    const sidebarWidth = width ?? DEFAULT_WIDTH[side];
    const [isResizing, setIsResizing] = useState(false);

    const handleResizeStart = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);

        const startX = e.clientX;
        const startWidth = sidebarWidth;

        const handleMouseMove = (moveEvent: MouseEvent) => {
          const delta = isLeft ? moveEvent.clientX - startX : startX - moveEvent.clientX;
          const newWidth = Math.min(
            MAX_WIDTH[side],
            Math.max(MIN_WIDTH[side], startWidth + delta)
          );
          onWidthChange?.(newWidth);
        };

        const handleMouseUp = () => {
          setIsResizing(false);
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          document.body.style.userSelect = '';
          document.body.style.cursor = '';
        };

        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'ew-resize';
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      },
      [isLeft, side, sidebarWidth, onWidthChange]
    );

    return (
      <div
        ref={ref}
        style={!isCollapsed ? { width: sidebarWidth } : undefined}
        className={cn(
          'flex flex-col h-full bg-background relative overflow-hidden z-20',
          isLeft ? 'border-r border-primary/10' : 'border-l border-primary/10',
          isCollapsed && 'w-[56px]',
          isResizing && 'transition-none cursor-ew-resize',
          !isResizing && 'transition-[width] duration-300 ease-[0.22,1,0.36,1]',
          className
        )}
      >
        {/* Panel content */}
        <div className="h-full w-full min-w-0 flex flex-col relative z-10">
          <CollapsibleSidePanel
            panels={panels}
            activeKey={safeActiveKey}
            onActiveKeyChange={onActiveKeyChange}
            side={side}
            className="border-none bg-transparent shadow-none h-full rounded-none"
          />
        </div>

        {/* Resize Handle */}
        {!isCollapsed && (
          <div
            className={cn(
              'absolute top-0 bottom-0 w-1.5 cursor-ew-resize z-30 group/resize',
              'hover:bg-primary/20 active:bg-primary/30 transition-colors',
              isLeft ? 'right-0' : 'left-0'
            )}
            onMouseDown={handleResizeStart}
            role="separator"
            aria-label={`Resize ${side} sidebar`}
          >
            <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full bg-primary/0 group-hover/resize:bg-primary/40 transition-all" />
          </div>
        )}
      </div>
    );
  }
);

BuilderSidebar.displayName = 'BuilderSidebar';
