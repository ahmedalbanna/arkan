'use client';

import { cn } from '@/infrastructure/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { PANEL_TRANSITION, SPRING_EASE } from './motion';

interface BuilderLayoutProps {
  header: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  canvas: React.ReactNode;
  className?: string;
  sidebarState?: { left: boolean; right: boolean };
  onSidebarToggle?: (side: 'left' | 'right') => void;
}

/**
 * BuilderLayout — Desktop-only three-column layout.
 * Header + [LeftSidebar | Canvas | RightSidebar]
 * No mobile conditionals. No keyboard shortcuts.
 */
export const BuilderLayout: React.FC<BuilderLayoutProps> = ({
  header,
  leftSidebar,
  rightSidebar,
  canvas,
  className,
  sidebarState = { left: true, right: true },
}) => {
  return (
    <div
      className={cn(
        'relative flex-grow flex flex-col bg-background overflow-hidden',
        'h-[var(--workspace-h,calc(100vh-64px))]',
        'transform-gpu',
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
        {/* Left Sidebar */}
        <AnimatePresence mode="wait">
          {leftSidebar && sidebarState.left && (
            <motion.aside
              key="left-sidebar"
              initial={{ x: -16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -16, opacity: 0 }}
              transition={{ ...PANEL_TRANSITION, duration: 0.2 }}
              className="flex-shrink-0 h-full relative z-20 overflow-hidden"
            >
              {leftSidebar}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Canvas */}
        <motion.div
          layout
          transition={{ duration: 0.3, ease: SPRING_EASE }}
          className="flex-1 min-w-0 h-full overflow-hidden relative z-10"
        >
          {canvas}
        </motion.div>

        {/* Right Sidebar */}
        <AnimatePresence mode="wait">
          {rightSidebar && sidebarState.right && (
            <motion.aside
              key="right-sidebar"
              initial={{ x: 16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 16, opacity: 0 }}
              transition={{ ...PANEL_TRANSITION, duration: 0.2 }}
              className="flex-shrink-0 h-full relative z-20 overflow-hidden"
            >
              {rightSidebar}
            </motion.aside>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
