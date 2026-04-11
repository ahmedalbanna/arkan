'use client';

import { AtmosphericGrid } from '@/components/shared/AtmosphericGrid';
import { CollapsibleSidePanel } from '@/components/ui/CollapsibleSidePanel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMobile } from '@/hooks/util/use-mobile';
import { cn } from '@/infrastructure/utils/cn';
import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import React, { useCallback, useEffect } from 'react';
import { BuilderSidebarProps } from './types';

export const BuilderSidebar = React.forwardRef<HTMLDivElement, BuilderSidebarProps>(
  ({ panels = [], activeKey, onActiveKeyChange, side, className, isResizable = true, onResize }, ref) => {
    const isMobile = useMobile();
    const safeActiveKey = activeKey && panels.some((p) => p.key === activeKey) ? activeKey : '';
    const isCollapsed = !safeActiveKey || (isMobile && !activeKey);
    const isLeft = side === 'left';

    // Desktop sidebar widths with resize support
    const [sidebarWidth, setSidebarWidth] = React.useState(isLeft ? 320 : 400);
    const [isResizing, setIsResizing] = React.useState(false);
    const isDesktop = !isMobile;
    // Load saved width from localStorage
    useEffect(() => {
      if (!isDesktop) return;
      const savedWidth = localStorage.getItem(`sidebar-width-${side}`);
      if (savedWidth) {
        const width = parseInt(savedWidth, 10);
        const minWidth = isLeft ? 240 : 320;
        const maxWidth = isLeft ? 480 : 600;
        setSidebarWidth(Math.min(maxWidth, Math.max(minWidth, width)));
      }
    }, [isDesktop, side, isLeft]);

    // Save width on change
    const handleWidthChange = useCallback((newWidth: number) => {
      setSidebarWidth(newWidth);
      localStorage.setItem(`sidebar-width-${side}`, newWidth.toString());
      onResize?.(newWidth);
    }, [side, onResize]);

    // Handle resize start
    const handleResizeStart = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);

      const startX = e.clientX;
      const startWidth = sidebarWidth;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = isLeft ? moveEvent.clientX - startX : startX - moveEvent.clientX;
        const newWidth = Math.min(
          isLeft ? 480 : 600,
          Math.max(isLeft ? 240 : 320, startWidth + delta)
        );
        handleWidthChange(newWidth);
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
    }, [isLeft, sidebarWidth, handleWidthChange]);


    const mobileWidth = isCollapsed ? 'w-0' : 'w-full fixed inset-0 z-50';
    const desktopWidth = isCollapsed
      ? 'w-[72px]'
      : `w-[${sidebarWidth}px]`;

    // Keyboard shortcuts for desktop
    useEffect(() => {
      if (!isDesktop) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        // Close sidebar on Escape
        if (e.key === 'Escape' && !isCollapsed && !isMobile) {
          onActiveKeyChange?.('');
        }

        // Toggle sidebar with [ and ]
        if (e.key === '[' && isLeft) {
          onActiveKeyChange?.(isCollapsed ? panels[0]?.key || '' : '');
        }
        if (e.key === ']' && !isLeft) {
          onActiveKeyChange?.(isCollapsed ? panels[0]?.key || '' : '');
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDesktop, isCollapsed, isLeft, onActiveKeyChange, panels]);

    return (
      <div
        ref={ref}
        style={!isMobile && !isCollapsed ? { width: sidebarWidth } : undefined}
        className={cn(
          'flex flex-col h-full bg-background transition-all duration-500 ease-[0.22,1,0.36,1] relative overflow-hidden z-20',
          isLeft ? 'border-r border-primary/10' : 'border-l border-primary/10',
          isMobile ? mobileWidth : desktopWidth,
          isResizing && 'transition-none cursor-ew-resize',
          className
        )}
      >
        {/* Background Grid - Reduced opacity for performance */}
        <AtmosphericGrid opacity={isDesktop ? 0.01 : 0.02} size={isDesktop ? 32 : 28} />

        <div className="h-full w-full min-w-0 flex flex-col relative z-10">
          <CollapsibleSidePanel
            panels={panels}
            activeKey={safeActiveKey}
            onActiveKeyChange={onActiveKeyChange}
            side={side}
            className="border-none bg-transparent shadow-none h-full rounded-none"
          />
        </div>

        {/* Resize Handle - Desktop only */}
        {isDesktop && isResizable && !isCollapsed && (
          <div
            className={cn(
              'absolute top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/20 transition-colors z-30',
              isLeft ? 'right-0' : 'left-0'
            )}
            onMouseDown={handleResizeStart}
            role="separator"
            aria-label={`Resize ${side} sidebar`}
          >
            <div className="absolute top-1/2 -translate-y-1/2 w-1 h-12 bg-primary/0 hover:bg-primary/30 rounded-full transition-all" />
          </div>
        )}

        {/* Footer - Enhanced for desktop */}
        <footer
          className={cn(
            'absolute bottom-0 left-0 right-0 border-t border-primary/5 bg-muted/5 backdrop-blur-sm flex items-center justify-between px-5 transition-all duration-500 z-20',
            isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100 h-10',
            isDesktop && !isCollapsed && 'hover:bg-muted/10'
          )}
        >
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary/30" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 truncate">
              {isLeft ? 'Navigation' : 'Parameters'}
            </span>
            {isDesktop && !isCollapsed && (
              <span className="text-[8px] font-mono text-muted-foreground/20">
                {sidebarWidth}px
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help" aria-hidden="true">
                    <ShieldCheck className="h-2.5 w-2.5 text-primary/30" />
                    <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums">
                      Validated
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px]">
                  Session validated & secure
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </footer>

        {/* Collapsed state indicator for desktop */}
        {isDesktop && isCollapsed && (
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-center pointer-events-none">
            <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
              {isLeft ? (
                <ChevronRight className="h-3 w-3 text-primary/30" />
              ) : (
                <ChevronLeft className="h-3 w-3 text-primary/30" />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

BuilderSidebar.displayName = 'BuilderSidebar';
