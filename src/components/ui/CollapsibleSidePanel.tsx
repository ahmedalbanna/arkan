'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMobile } from '@/hooks/util/use-mobile';
import { cn } from '@/infrastructure/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { type ReactElement, type ReactNode } from 'react';

export interface PanelItem {
  key: string;
  title: string;
  icon: ReactElement;
  content: ReactNode;
  shortcut?: string;
  badge?: number;
}

interface CollapsibleSidePanelProps {
  panels: PanelItem[];
  activeKey: string;
  onActiveKeyChange: (key: string) => void;
  className?: string;
  side?: 'left' | 'right';
}

/**
 * CollapsibleSidePanel - Controlled panel orchestrator for workspace HUDs.
 * Visibility and active state are fully controlled by parent via props.
 * No internal persisted state to avoid conflicts with BuilderSidebar/useDesktopBreakpoint.
 */
export function CollapsibleSidePanel({
  panels,
  activeKey,
  onActiveKeyChange,
  className,
  side = 'left',
}: CollapsibleSidePanelProps) {
  const isMobile = useMobile();
  const isDesktop = !isMobile;
  const isLeft = side === 'left';
  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

  if (!panels || panels.length === 0) return null;

  const activePanel = panels.find((p) => p.key === activeKey);

  const handlePanelToggle = (key: string) => {
    onActiveKeyChange(activeKey === key ? '' : key);
  };

  return (
    <div
      className={cn(
        "flex h-full bg-transparent overflow-hidden",
        isLeft ? "flex-row" : "flex-row-reverse",
        className
      )}
    >
      {/* Icon Bar */}
      <div className={cn(
        "flex flex-col gap-2 bg-background p-2 relative shrink-0",
        isLeft ? "border-r border-primary/10" : "border-l border-primary/10"
      )}>
        {/* Vertical accent */}
        <div className={cn(
          "absolute inset-y-0 w-0.5 bg-gradient-to-b from-primary/40 via-primary/60 to-primary/40",
          isLeft ? "right-0" : "left-0"
        )} />

        <TooltipProvider delayDuration={200}>
          {panels.map((panel, index) => {
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
                      "h-10 w-10 rounded-lg transition-all duration-200 relative group/icon",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                    )}
                  >
                    <div className="relative z-10 transition-transform duration-200 group-hover/icon:scale-110">
                      {panel.icon}
                    </div>
                    {panel.badge && panel.badge > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-[8px] font-black text-primary-foreground flex items-center justify-center">
                        {panel.badge > 9 ? '9+' : panel.badge}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={isLeft ? "right" : "left"} className="bg-background border border-primary/20 py-2 px-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                      {panel.title}
                    </span>
                    {panel.shortcut && (
                      <kbd className="text-[8px] font-mono text-muted-foreground/60 bg-muted/50 px-1 rounded">
                        {panel.shortcut}
                      </kbd>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeKey && activePanel && (
          <motion.div
            key="content-area"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
              opacity: { duration: 0.2 }
            }}
            className="flex-1 overflow-hidden relative bg-background/50"
          >
            <div className="h-full w-full min-w-[320px] lg:min-w-[380px] overflow-auto custom-scrollbar">
              <motion.div
                key={activeKey}
                initial={{ opacity: 0, x: isLeft ? (isRtl ? 10 : -10) : (isRtl ? -10 : 10) }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="p-5 min-w-0 flex flex-col min-h-full"
              >
                {activePanel.content}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
