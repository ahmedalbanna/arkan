'use client';

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

/**
 * SidebarSection — Collapsible section within a sidebar panel.
 * Desktop-only. Persists open/close state to localStorage.
 */
export function SidebarSection({
  title,
  defaultOpen = true,
  actions,
  children,
  className,
  persistState = true,
  sectionId,
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  // Load persisted state
  useEffect(() => {
    if (persistState && sectionId) {
      const savedState = localStorage.getItem(`sidebar-section-${sectionId}`);
      if (savedState !== null) {
        setIsOpen(savedState === 'true');
      }
    }
  }, [persistState, sectionId]);

  const handleToggle = useCallback(() => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (persistState && sectionId) {
      localStorage.setItem(`sidebar-section-${sectionId}`, newState.toString());
    }
  }, [isOpen, persistState, sectionId]);

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Section Header */}
      <button
        type="button"
        onClick={handleToggle}
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
            'h-3 w-3 shrink-0 text-muted-foreground/40 transition-all duration-300 ease-[0.22,1,0.36,1]',
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

      {/* Animated Content */}
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
            <div className="p-3 flex flex-col gap-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
