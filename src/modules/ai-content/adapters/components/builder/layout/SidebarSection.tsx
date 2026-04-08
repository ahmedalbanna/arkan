'use client';

import React, { useState, useId } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Binary } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';
import { SECTION_TRANSITION } from './motion';

/**
 * SidebarSection — A collapsible grouping for sidebar panels.
 * Features a high-density header and animated expansion.
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
  const contentId = useId();

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Group Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className={cn(
          'flex w-full items-center gap-2 px-3 py-2.5 text-start transition-all duration-300',
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

        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/70 flex-1 group-hover/section:text-primary/80 transition-colors">
          {title}
        </span>

        {actions ? (
          <div className="flex items-center gap-1 shrink-0 relative z-10">{actions}</div>
        ) : (
          <Binary
            className="h-2.5 w-2.5 text-muted-foreground/10 group-hover/section:text-primary/20 transition-colors"
            aria-hidden="true"
          />
        )}
      </button>

      {/* Animated Content Slot */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={contentId}
            key="section-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SECTION_TRANSITION}
            className="overflow-hidden"
          >
            <div className="p-5 flex flex-col gap-5 relative">
              {/* Vertical accent line */}
              <div
                className="absolute left-3.5 inset-y-0 w-[1.5px] rounded-full bg-primary/5"
                aria-hidden="true"
              />

              <div className="relative z-10">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
