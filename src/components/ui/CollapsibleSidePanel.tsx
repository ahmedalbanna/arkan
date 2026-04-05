'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/infrastructure/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { type ReactElement, type ReactNode } from 'react';

/**
 * CollapsibleSidePanel — Atomic panel orchestrator for high-density workspace HUDs.
 * Features a vertical control bar and an expandable intelligence feed.
 * 
 * DEFENSIVE MEASURES:
 * 1. Flush Integration: Optimized for edge-to-edge layouts with zero internal rounding.
 * 2. Motion Transitions: 60fps width orchestration using Framer Motion.
 * 3. UX Integrity: Responsive tooltips and high-fidelity active states.
 */

export interface PanelItem {
  key: string;
  title: string;
  icon: ReactElement;
  content: ReactNode;
}

interface CollapsibleSidePanelProps {
  panels: PanelItem[];
  activeKey: string;
  onActiveKeyChange: (key: string) => void;
  className?: string;
  side?: 'left' | 'right';
}

export function CollapsibleSidePanel({
  panels,
  activeKey,
  onActiveKeyChange,
  className,
  side = 'left',
}: CollapsibleSidePanelProps) {
  const isLeft = side === 'left';
  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

  if (!panels || panels.length === 0) return null;

  const activePanel = panels.find((p) => p.key === activeKey);

  const handlePanelToggle = (key: string) => {
    onActiveKeyChange(activeKey === key ? '' : key);
  };

  return (
    <div className={cn(
      "flex h-full bg-transparent overflow-hidden transition-all duration-500",
      isLeft ? "flex-row" : "flex-row-reverse",
      className
    )}>
      {/* 1. SIDEBAR HUD - Technical Control Bar */}
      <div className={cn(
        "flex flex-col gap-4 bg-muted/5 p-3.5 relative shrink-0",
        isLeft ? "border-e border-primary/5" : "border-s border-primary/5"
      )}>
        {/* Vertical Depth Accent */}
        <div className={cn(
            "absolute inset-y-0 w-0.5 bg-gradient-to-b from-transparent via-primary/20 to-transparent opacity-40",
            isLeft ? "end-0" : "start-0"
        )} />

        <TooltipProvider>
          {panels.map((panel) => {
            const isActive = activeKey === panel.key;
            return (
              <Tooltip key={panel.key} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handlePanelToggle(panel.key)} 
                    aria-label={panel.title} 
                    className={cn(
                        "h-11 w-11 rounded-xl transition-all duration-500 relative group/icon",
                        isActive 
                            ? "bg-primary text-primary-foreground scale-[1.05]" 
                            : "text-muted-foreground hover:bg-primary/10 hover:text-primary hover:scale-110"
                    )}
                  >
                    <div className="relative z-10 transition-transform duration-500 group-hover/icon:scale-110">
                        {panel.icon}
                    </div>
                    {/* Removed highlight overlay */}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={isLeft ? "right" : "left"} className="bg-background border border-primary/20 py-2 px-4 rounded-xl">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">{panel.title}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* 2. CONTENT AREA - Intelligence Feed */}
      <AnimatePresence mode="wait">
        {activeKey && (
          <motion.div 
            key="content-area"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 overflow-hidden relative border-none"
          >
            <div className="h-full w-full min-w-[320px] lg:min-w-[360px] overflow-auto custom-scrollbar">
                <motion.div 
                    key={activeKey} 
                    initial={{ opacity: 0, x: isLeft ? (isRtl ? 10 : -10) : (isRtl ? -10 : 10) }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                    className="p-6 md:p-7 min-w-0 flex flex-col min-h-full"
                >
                    {activePanel?.content}
                </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
