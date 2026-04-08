'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/infrastructure/utils/cn';
import { PANEL_TRANSITION, SPRING_EASE } from './motion';
import { AtmosphericGrid } from '@/components/shared/AtmosphericGrid';

/**
 * BuilderLayout — Structural foundation for the builder workspace.
 * Orchestrates the relationship between sidebars, canvas, and project header.
 */

interface BuilderLayoutProps {
  header: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  canvas: React.ReactNode;
  className?: string;
}

export const BuilderLayout: React.FC<BuilderLayoutProps> = ({
  header,
  leftSidebar,
  rightSidebar,
  canvas,
  className,
}) => {
  return (
    <div
      className={cn(
        'relative flex-grow flex flex-col bg-background overflow-hidden',
        'h-[var(--workspace-h,calc(100vh-64px))]',
        className
      )}
    >
      {/* 1. HEADER ZONE */}
      {header && (
        <header className="flex-shrink-0 z-30 relative border-b border-primary/10">
          {header}
        </header>
      )}

      {/* 2. CONTENT CORE — Edge-to-Edge Integration */}
      <main className="flex-1 flex min-h-0 relative z-10">
        {/* Left Sidebar */}
        <AnimatePresence mode="wait">
          {leftSidebar && (
            <motion.aside
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={PANEL_TRANSITION}
              className="flex-shrink-0 h-full relative z-20"
            >
              {leftSidebar}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Central Canvas */}
        <motion.div
          layout
          transition={{ duration: 0.6, ease: SPRING_EASE }}
          className="flex-1 min-w-0 h-full overflow-hidden relative z-10"
        >
          {canvas}
        </motion.div>

        {/* Right Sidebar */}
        <AnimatePresence mode="wait">
          {rightSidebar && (
            <motion.aside
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={PANEL_TRANSITION}
              className="flex-shrink-0 h-full relative z-20"
            >
              {rightSidebar}
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      {/* Global Background Grid */}
      <AtmosphericGrid opacity={0.01} size={40} className="z-0" />
    </div>
  );
};
