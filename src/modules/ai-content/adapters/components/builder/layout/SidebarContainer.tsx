'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/infrastructure/utils/cn';
import { AtmosphericGrid } from '@/components/shared/AtmosphericGrid';

/**
 * SidebarContainer — Modular wrapper for sidebar panels.
 * Implements standard headers and atmospheric backgrounds.
 */

interface SidebarContainerProps {
  title: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noScroll?: boolean;
}

export const SidebarContainer = ({
  title,
  icon,
  actions,
  children,
  className,
  noScroll = false,
}: SidebarContainerProps) => {
  return (
    <div className={cn('flex flex-col h-full bg-background relative overflow-hidden', className)}>
      {/* Background Grid */}
      <AtmosphericGrid opacity={0.02} size={28} />

      {/* Sticky Header */}
      <header className="h-12 shrink-0 px-5 flex items-center justify-between border-b border-primary/10 bg-background relative z-20 overflow-hidden group/header transition-all duration-500">
        {/* Left accent line */}
        <div
          className="absolute left-0 inset-y-2.5 w-[2.5px] rounded-full bg-primary/30 group-hover/header:bg-primary/60 transition-all duration-500"
          aria-hidden="true"
        />

        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <span className="text-primary/40 shrink-0 group-hover/header:text-primary/60 transition-all duration-500 group-hover/header:scale-110">
              {icon}
            </span>
          )}
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 group-hover/header:text-foreground/90 transition-all duration-500 truncate">
            {title}
          </h2>
        </div>

        {actions && (
          <div className="flex items-center gap-1.5 shrink-0 ml-2 relative z-10">{actions}</div>
        )}
      </header>

      {/* Content Implementation */}
      {noScroll ? (
        <div className="flex-1 relative z-10 p-5 flex flex-col gap-6">{children}</div>
      ) : (
        <ScrollArea className="flex-1 min-h-0 relative z-10 custom-scrollbar">
          <div className="p-5 flex flex-col gap-6 pb-24 w-max min-w-full">{children}</div>
        </ScrollArea>
      )}
    </div>
  );
};
