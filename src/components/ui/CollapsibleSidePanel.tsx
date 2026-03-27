
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
      "self-start flex bg-background border rounded-lg shadow-sm h-full",
      isLeft ? "flex-row" : "flex-row-reverse",
      isMobile && "mb-16",
      className
    )}>
      <div className={cn(
        "flex flex-col gap-2 bg-muted/10 p-2",
        isLeft ? "border-r border-border/60" : "border-l border-border/60"
      )}>
        <TooltipProvider>
          {panels.map((panel) => (
            <Tooltip key={panel.key} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant={activeKey === panel.key ? 'secondary' : 'ghost'} size="icon" onClick={() => onActiveKeyChange(panel.key)} aria-label={panel.title} className="h-9 w-9">
                  {panel.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isLeft ? "right" : "left"}>
                <p>{panel.title}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
      <div className="flex-1 p-4 sm:p-5 w-px overflow-auto h-full">
        {activePanel?.content}
      </div>
    </div>
  );
}
