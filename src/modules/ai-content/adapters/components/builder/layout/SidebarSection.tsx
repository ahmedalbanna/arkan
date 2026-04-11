'use client';

import { useMobile } from '@/hooks/util/use-mobile';
import { cn } from '@/infrastructure/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { Binary, ChevronRight } from 'lucide-react';
import React, { useCallback, useEffect, useId, useState } from 'react';
import { SECTION_TRANSITION } from './motion';

interface SidebarSectionProps {
  title: string;
  defaultOpen?: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  persistState?: boolean;
  sectionId?: string;
}

export function SidebarSection({
  title,
  defaultOpen = true,
  actions,
  children,
  className,
  persistState = true,
  sectionId,
}: SidebarSectionProps) {
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  // Load persisted state from localStorage
  useEffect(() => {
    if (persistState && sectionId && !isMobile) {
      const savedState = localStorage.getItem(`sidebar-section-${sectionId}`);
      if (savedState !== null) {
        setIsOpen(savedState === 'true');
      }
    }
  }, [persistState, sectionId, isMobile]);

  // Save state to localStorage
  const handleToggle = useCallback(() => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (persistState && sectionId && !isMobile) {
      localStorage.setItem(`sidebar-section-${sectionId}`, newState.toString());
    }
  }, [isOpen, persistState, sectionId, isMobile]);

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Group Header */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className={cn(
          'flex w-full items-center gap-2 px-3 py-2.5 text-start transition-all duration-300',
          'border-b border-primary/10 bg-primary/[0.02] hover:bg-primary/[0.05]',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 group/section',
          isMobile && 'active:bg-primary/10'
        )}
      >
        <ChevronRight
          className={cn(
            'h-3 w-3 shrink-0 text-muted-foreground/40 transition-all duration-500 ease-[0.22,1,0.36,1]',
            isOpen && 'rotate-90 text-primary/60'
          )}
        />

        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/70 flex-1 group-hover/section:text-primary/80 transition-colors truncate">
          {title}
        </span>

        {actions ? (
          <div className="flex items-center gap-1 shrink-0 relative z-10" onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        ) : (
          <Binary
            className="h-2.5 w-2.5 text-muted-foreground/10 group-hover/section:text-primary/20 transition-colors"
            aria-hidden="true"
          />
        )}
      </button>

      {/* Animated Content Slot with performance optimizations */}
      <AnimatePresence initial={false} mode="wait">
        {isOpen && (
          <motion.div
            id={contentId}
            key="section-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SECTION_TRANSITION}
            className="overflow-hidden will-change-transform"
          >
            <div className="p-5 flex flex-col gap-5 relative">
              {/* Vertical accent line - hidden on mobile for performance */}
              <div
                className={cn(
                  'absolute left-3.5 inset-y-0 w-[1.5px] rounded-full bg-primary/5',
                  !isMobile && 'hidden lg:block'
                )}
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
