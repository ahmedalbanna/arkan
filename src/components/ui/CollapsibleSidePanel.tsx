
'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMobile } from '@/hooks';
import { cn } from '@/infrastructure/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { type ReactElement, type ReactNode } from 'react';

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
  const isMobile = useMobile();
  const activePanel = panels.find((p) => p.key === activeKey);

  if (!panels || panels.length === 0) {
    return null;
  }

  const isLeft = side === 'left';

  return (
    <div className={cn(
      "flex bg-background/40 backdrop-blur-xl border border-primary/10 rounded-[28px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500",
      isLeft ? "flex-row" : "flex-row-reverse",
      isMobile && "mb-16",
      className
    )}>
      {/* Sidebar HUD - Technical Control Bar */}
      <div className={cn(
        "flex flex-col gap-4 bg-muted/5 p-3.5 relative",
        isLeft ? "border-r border-primary/5 shadow-[2px_0_15px_rgba(0,0,0,0.02)]" : "border-l border-primary/5 shadow-[-2px_0_15px_rgba(0,0,0,0.02)]"
      )}>
        {/* Vertical Depth Accent */}
        <div className={cn(
            "absolute inset-y-0 w-0.5 bg-gradient-to-b from-transparent via-primary/20 to-transparent opacity-40",
            isLeft ? "right-0" : "left-0"
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
                    onClick={() => onActiveKeyChange(isActive ? '' : panel.key)} 
                    aria-label={panel.title} 
                    className={cn(
                        "h-11 w-11 rounded-[14px] transition-all duration-500 relative group/icon",
                        isActive 
                            ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.4)] scale-[1.05] ring-2 ring-white/20" 
                            : "text-muted-foreground hover:bg-primary/10 hover:text-primary hover:scale-110"
                    )}
                  >
                    <div className="relative z-10 transition-transform duration-500 group-hover/icon:scale-110">
                        {panel.icon}
                    </div>
                    {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-[14px] opacity-40" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={isLeft ? "right" : "left"} className="bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl py-2 px-4 rounded-xl">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">{panel.title}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Content Area - Intelligence Feed */}
      <AnimatePresence mode="wait">
        {activeKey && (
          <motion.div 
            key="content-area"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="flex-1 overflow-hidden relative border-none"
          >
            <div className="h-full w-full min-w-[300px] overflow-auto custom-scrollbar bg-radial-gradient from-primary/[0.02] to-transparent">
                <motion.div 
                    key={activeKey} 
                    initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className={cn(
                        "p-8 md:p-10 min-w-0",
                    )}
                >
                    {activePanel?.content}
                </motion.div>
            </div>
            
            {/* Subtle Content Edge Decoration */}
            <div className={cn(
                "absolute inset-y-0 pointer-events-none w-px opacity-10",
                isLeft ? "right-0 bg-gradient-to-b from-transparent via-primary to-transparent" : "left-0 bg-gradient-to-b from-transparent via-primary to-transparent"
            )} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
