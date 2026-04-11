'use client';

import { AtmosphericGrid } from '@/components/shared/AtmosphericGrid';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMobile } from '@/hooks/util/use-mobile';
import { cn } from '@/infrastructure/utils/cn';
import { Maximize2, Minimize2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface SidebarContainerProps {
  title: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noScroll?: boolean;
  defaultExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

export const SidebarContainer = ({
  title,
  icon,
  actions,
  children,
  className,
  noScroll = false,
  defaultExpanded = true,
  onExpandChange,
}: SidebarContainerProps) => {
  const isMobile = useMobile();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const isDesktop = !isMobile;

  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const handleExpandToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onExpandChange?.(newState);
  };

  if (!isExpanded && isDesktop) {
    return (
      <div className={cn('flex flex-col h-full bg-background relative overflow-hidden', className)}>
        <AtmosphericGrid opacity={0.02} size={28} />
        <button
          onClick={handleExpandToggle}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 rounded-full bg-primary/5 hover:bg-primary/10 transition-all group"
          aria-label={`Expand ${title}`}
        >
          <Maximize2 className="h-4 w-4 text-primary/40 group-hover:text-primary/60" />
        </button>
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 [writing-mode:vertical-rl]">
            {title}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full bg-background relative overflow-hidden', className)}>
      <AtmosphericGrid opacity={0.02} size={28} />

      {/* Sticky Header with expand/collapse */}
      <header className="h-12 shrink-0 px-5 flex items-center justify-between border-b border-primary/10 bg-background/95 backdrop-blur-sm relative z-20 group/header transition-all duration-500">
        <div
          className="absolute left-0 inset-y-2.5 w-[2.5px] rounded-full bg-primary/30 group-hover/header:bg-primary/60 transition-all duration-500"
          aria-hidden="true"
        />

        <div className="flex items-center gap-3 min-w-0 flex-1">
          {icon && (
            <span className="text-primary/40 shrink-0 group-hover/header:text-primary/60 transition-all duration-500 group-hover/header:scale-110">
              {icon}
            </span>
          )}
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 group-hover/header:text-foreground/90 transition-all duration-500 truncate">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2 relative z-10">
          {actions}
          {isDesktop && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-md opacity-0 group-hover/header:opacity-100 transition-opacity"
              onClick={handleExpandToggle}
              aria-label={`Collapse ${title}`}
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </header>

      {/* Content Implementation with performance optimizations */}
      {noScroll ? (
        <div className="flex-1 relative z-10 p-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      ) : (
        <ScrollArea className="flex-1 min-h-0 relative z-10">
          <div className="p-5 flex flex-col gap-6 pb-24 w-min min-w-full">
            {children}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
