'use client';

import React from 'react';
import { CollapsibleSidePanel } from '@/components/ui/CollapsibleSidePanel';
import { cn } from '@/infrastructure/utils/cn';
import { BuilderSidebarProps } from './types';
import { ShieldCheck } from 'lucide-react';
import { AtmosphericGrid } from '@/components/shared/AtmosphericGrid';

/**
 * BuilderSidebar — Side panel orchestrator for the builder environment.
 * Manages modular panels for navigation and project configuration.
 */

export const BuilderSidebar = React.forwardRef<HTMLDivElement, BuilderSidebarProps>(
  ({ panels = [], activeKey, onActiveKeyChange, side, className }, ref) => {
    const safeActiveKey = activeKey && panels.some((p) => p.key === activeKey) ? activeKey : '';
    const isCollapsed = !safeActiveKey;
    const isLeft = side === 'left';

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col h-full bg-background transition-all duration-500 ease-[0.22,1,0.36,1] relative overflow-hidden z-20',
          isLeft ? 'border-r border-primary/10' : 'border-l border-primary/10',
          isCollapsed
            ? 'w-[72px]'
            : isLeft
            ? 'w-[var(--sidebar-w-left,320px)]'
            : 'w-[var(--sidebar-w,400px)]',
          className
        )}
      >
        {/* Background Grid */}
        <AtmosphericGrid opacity={0.02} size={28} />

        <div className="h-full w-full min-w-0 flex flex-col relative z-10">
          <CollapsibleSidePanel
            panels={panels}
            activeKey={safeActiveKey}
            onActiveKeyChange={onActiveKeyChange}
            side={side}
            className="border-none bg-transparent shadow-none h-full rounded-none"
          />
        </div>

        {/* Panel Footer */}
        <footer
          className={cn(
            'absolute bottom-0 left-0 right-0 h-10 border-t border-primary/5 bg-muted/5 flex items-center justify-between px-5 transition-opacity duration-500',
            isCollapsed ? 'opacity-0' : 'opacity-100'
          )}
        >
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary/30" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 truncate">
              {isLeft ? 'Navigation' : 'Parameters'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <ShieldCheck className="h-2.5 w-2.5 text-primary/30" />
              <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums">
                Validated
              </span>
            </div>
          </div>
        </footer>
      </div>
    );
  }
);

BuilderSidebar.displayName = 'BuilderSidebar';
