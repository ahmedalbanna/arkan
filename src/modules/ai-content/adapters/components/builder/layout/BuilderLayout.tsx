'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/infrastructure/utils/cn';

/**
 * BuilderLayout — High-fidelity structural foundation for the AI workspace.
 * Orchestrates the relationship between sidebars, canvas, and project header.
 * 
 * DEFENSIVE MEASURES:
 * 1. Flush Integration: Removes sidebar padding to achieve edge-to-edge "Neural Matrix" look.
 * 2. Dynamic Dimensions: Implements CSS variables for robust viewport scaling.
 * 3. Motion Transitions: Uses Framer Motion to handle layout shifts without jumping.
 * 4. Isolation: Strictly separates layout concerns from domain logic.
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
                "relative flex-grow flex flex-col bg-background overflow-hidden", 
                "h-[calc(100vh-64px)] md:h-[var(--workspace-h,calc(100vh-64px))]",
                className
            )}
            style={{ 
                '--workspace-h': 'calc(100vh - 64px)',
                '--sidebar-w': '400px',
                '--sidebar-w-left': '320px'
            } as React.CSSProperties}
        >
            {/* 1. PROJECT HEADER ZONE */}
            {header && (
                <header className="flex-shrink-0 z-30 relative border-b border-primary/10">
                    {header}
                </header>
            )}

            {/* 2. PRODUCTION CORE — Edge-to-Edge Sidebar Integration */}
            <main className="flex-1 flex min-h-0 relative z-10">
                {/* Left Sidebar — Navigator & Ingestion */}
                <AnimatePresence mode="popLayout">
                    {leftSidebar && (
                        <motion.aside
                            initial={{ x: -24, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -24, opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="flex-shrink-0 h-full relative z-20"
                        >
                            {leftSidebar}
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Central Canvas — Neural Workspace */}
                <motion.div 
                    layout
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="flex-1 min-w-0 h-full overflow-hidden relative z-10"
                >
                    {canvas}
                </motion.div>

                {/* Right Sidebar — Synthesis & Parameter Tuning */}
                <AnimatePresence mode="popLayout">
                    {rightSidebar && (
                        <motion.aside
                            initial={{ x: 24, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 24, opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="flex-shrink-0 h-full relative z-20"
                        >
                            {rightSidebar}
                        </motion.aside>
                    )}
                </AnimatePresence>
            </main>

            {/* Atmospheric Decoration — Global Matrix */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.01] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:40px_40px] z-0" />
        </div>
    );
};
