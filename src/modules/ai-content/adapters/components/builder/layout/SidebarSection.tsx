'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';

/**
 * SidebarSection — A reusable collapsible grouping for side panels.
 * Features a high-density VSCode-style technical header and animated expansion.
 */

interface SidebarSectionProps {
  title: string;
  defaultOpen?: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SidebarSection({
  title,
  defaultOpen = true,
  actions,
  children,
  className,
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Group Header — High-Density Technical Look */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={cn(
          'flex w-full items-center gap-2 px-3 py-2 text-start transition-all duration-300',
          'border-b border-primary/10 bg-primary/[0.02] hover:bg-primary/[0.05]',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 group/section'
        )}
      >
        <ChevronRight
          className={cn(
            'h-3 w-3 shrink-0 text-muted-foreground/40 transition-transform duration-500 ease-[0.22,1,0.36,1]',
            isOpen && 'rotate-90 text-primary/60'
          )}
        />
        
        {/* Technical Label */}
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/70 flex-1 group-hover/section:text-primary/80 transition-colors">
          {title}
        </span>

        {/* Action HUD */}
        {actions ? (
            <div className="flex items-center gap-1 shrink-0">
                {actions}
            </div>
        ) : (
            <MoreHorizontal className="h-3 w-3 text-muted-foreground/20 group-hover/section:text-primary/30 transition-colors" />
        )}
      </button>

      {/* Animated Content Slot */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="section-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-4 relative">
              {/* Subtle vertical architectural line */}
              <div className="absolute left-3.5 inset-y-0 w-px bg-primary/[0.03]" aria-hidden />
              
              <div className="relative z-10">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
