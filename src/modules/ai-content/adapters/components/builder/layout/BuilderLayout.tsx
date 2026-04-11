'use client';

import { AtmosphericGrid } from '@/components/shared/AtmosphericGrid';
import { Button } from '@/components/ui/button';
import { useMobile } from '@/hooks/util/use-mobile';
import { cn } from '@/infrastructure/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { PANEL_TRANSITION, SPRING_EASE } from './motion';

interface BuilderLayoutProps {
  header: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  canvas: React.ReactNode;
  className?: string;
  isDesktop?: boolean;
  sidebarState?: { left: boolean; right: boolean };
  onSidebarToggle?: (side: 'left' | 'right') => void;
}

export const BuilderLayout: React.FC<BuilderLayoutProps> = ({
  header,
  leftSidebar,
  rightSidebar,
  canvas,
  className,
  isDesktop = false,
  sidebarState = { left: true, right: true },
  onSidebarToggle,
}) => {
  const isMobile = useMobile();

  // Desktop sidebar widths
  const leftSidebarWidth = isDesktop ? 'w-80' : 'w-72';
  const rightSidebarWidth = isDesktop ? 'w-96' : 'w-80';

  return (
    <div
      className={cn(
        'relative flex-grow flex flex-col bg-background overflow-hidden',
        'h-[var(--workspace-h,calc(100vh-64px))]',
        // Desktop performance optimizations
        isDesktop && 'transform-gpu will-change-transform',
        className
      )}
    >
      {/* Header */}
      {header && (
        <header className="flex-shrink-0 z-30 relative border-b border-primary/10">
          {header}
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex min-h-0 relative z-10">
        {/* Left Sidebar with Toggle Button */}
        <AnimatePresence mode="wait">
          {leftSidebar && (
            <>
              <motion.aside
                initial={isMobile ? { opacity: 0 } : { x: -24, opacity: 0 }}
                animate={
                  isMobile
                    ? { opacity: 1 }
                    : {
                      x: sidebarState.left ? 0 : -24,
                      opacity: sidebarState.left ? 1 : 0,
                      width: sidebarState.left ? 'auto' : 0
                    }
                }
                exit={isMobile ? { opacity: 0 } : { x: -24, opacity: 0 }}
                transition={{ ...PANEL_TRANSITION, duration: 0.2 }}
                className={cn(
                  'flex-shrink-0 h-full relative z-20 overflow-hidden',
                  isDesktop && leftSidebarWidth,
                  !isDesktop && 'w-72',
                  isMobile ? 'absolute inset-0 z-50 bg-background' : '',
                  !sidebarState.left && isDesktop && 'w-0 opacity-0 pointer-events-none'
                )}
              >
                {leftSidebar}
              </motion.aside>

              {/* Desktop Left Sidebar Toggle Button */}
              {isDesktop && onSidebarToggle && (
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 z-30',
                    'h-8 w-8 rounded-r-lg rounded-l-none border-l-0',
                    'bg-background/80 backdrop-blur-sm hover:bg-background',
                    'transition-all duration-200',
                    !sidebarState.left && 'left-0 rounded-l-lg border-l',
                    'shadow-sm'
                  )}
                  onClick={() => onSidebarToggle('left')}
                >
                  <ChevronLeft className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    !sidebarState.left && 'rotate-180'
                  )} />
                </Button>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Canvas */}
        <motion.div
          layout={isDesktop}
          transition={{ duration: 0.3, ease: SPRING_EASE }}
          className={cn(
            'flex-1 min-w-0 h-full overflow-hidden relative z-10',
            // Desktop optimizations
            isDesktop && 'transition-all duration-300'
          )}
        >
          {canvas}
        </motion.div>

        {/* Right Sidebar with Toggle Button */}
        <AnimatePresence mode="wait">
          {rightSidebar && (
            <>
              <motion.aside
                initial={isMobile ? { opacity: 0 } : { x: 24, opacity: 0 }}
                animate={
                  isMobile
                    ? { opacity: 1 }
                    : {
                      x: sidebarState.right ? 0 : 24,
                      opacity: sidebarState.right ? 1 : 0,
                      width: sidebarState.right ? 'auto' : 0
                    }
                }
                exit={isMobile ? { opacity: 0 } : { x: 24, opacity: 0 }}
                transition={{ ...PANEL_TRANSITION, duration: 0.2 }}
                className={cn(
                  'flex-shrink-0 h-full relative z-20 overflow-hidden',
                  isDesktop && rightSidebarWidth,
                  !isDesktop && 'w-80',
                  isMobile ? 'absolute inset-0 z-50 bg-background' : '',
                  !sidebarState.right && isDesktop && 'w-0 opacity-0 pointer-events-none'
                )}
              >
                {rightSidebar}
              </motion.aside>

              {/* Desktop Right Sidebar Toggle Button */}
              {isDesktop && onSidebarToggle && (
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    'absolute right-0 top-1/2 -translate-y-1/2 z-30',
                    'h-8 w-8 rounded-l-lg rounded-r-none border-r-0',
                    'bg-background/80 backdrop-blur-sm hover:bg-background',
                    'transition-all duration-200',
                    !sidebarState.right && 'right-0 rounded-r-lg border-r',
                    'shadow-sm'
                  )}
                  onClick={() => onSidebarToggle('right')}
                >
                  <ChevronRight className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    !sidebarState.right && 'rotate-180'
                  )} />
                </Button>
              )}
            </>
          )}
        </AnimatePresence>
      </main>

      {/* Background Grid - Reduced opacity for desktop performance */}
      <AtmosphericGrid opacity={isDesktop ? 0.005 : 0.01} size={40} className="z-0" />
    </div>
  );
};
