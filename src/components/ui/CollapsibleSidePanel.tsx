
'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMobile } from '@/hooks';
import { cn } from '@/infrastructure/utils/cn';
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
      "self-start flex bg-card border border-border/40 rounded-[24px] shadow-2xl shadow-primary/5 h-full overflow-hidden",
      isLeft ? "flex-row" : "flex-row-reverse",
      isMobile && "mb-16",
      className
    )}>
      {/* Sidebar HUD */}
      <div className={cn(
        "flex flex-col gap-3 bg-muted/5 p-3 backdrop-blur-sm",
        isLeft ? "border-r border-border/40 shadow-[1px_0_10px_rgba(0,0,0,0.02)]" : "border-l border-border/40 shadow-[-1px_0_10px_rgba(0,0,0,0.02)]"
      )}>
        <TooltipProvider>
          {panels.map((panel) => {
            const isActive = activeKey === panel.key;
            return (
              <Tooltip key={panel.key} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onActiveKeyChange(panel.key)} 
                    aria-label={panel.title} 
                    className={cn(
                        "h-10 w-10 rounded-xl transition-all duration-300",
                        isActive 
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.05]" 
                            : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    {panel.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={isLeft ? "right" : "left"} className="bg-background/80 backdrop-blur-md border border-white/20 shadow-xl py-1.5 px-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest">{panel.title}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden h-full relative">
        <div className="h-full w-full overflow-auto custom-scrollbar">
            <div 
                key={activeKey} 
                className={cn(
                    "p-6 md:p-8 h-full min-w-0 animate-in fade-in duration-500",
                    isLeft ? "slide-in-from-left-2" : "slide-in-from-right-2"
                )}
            >
                {activePanel?.content}
            </div>
        </div>
        
        {/* Subtle Edge Decoration */}
        <div className={cn(
            "absolute inset-y-0 pointer-events-none w-px opacity-20",
            isLeft ? "right-0 bg-gradient-to-b from-transparent via-primary to-transparent" : "left-0 bg-gradient-to-b from-transparent via-primary to-transparent"
        )} />
      </div>
    </div>
  );
}
