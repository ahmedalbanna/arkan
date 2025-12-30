'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMobile } from '@/hooks';
import { cn } from '@/lib/utils/cn';
import { useState, type ReactElement, type ReactNode } from 'react';

export interface PanelItem {
  key: string;
  title: string;
  icon: ReactElement;
  content: ReactNode;
}

interface CollapsibleSidePanelProps {
  panels: PanelItem[];
  defaultActiveKey?: string;
  className?: string;
}

export function CollapsibleSidePanel({
  panels,
  defaultActiveKey,
  className,
}: CollapsibleSidePanelProps) {
  const isMobile = useMobile();
  const [activeKey, setActiveKey] = useState<string | undefined>(defaultActiveKey ?? panels[0]?.key);
  const activePanel = panels.find((p) => p.key === activeKey);

  if (!panels || panels.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "self-start flex flex-row bg-background border rounded-lg",
      isMobile && "mb-16",
      className
    )}>
      <div className="flex flex-col gap-2 border-r p-2">
        <TooltipProvider>
          {panels.map((panel) => (
            <Tooltip key={panel.key} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant={activeKey === panel.key ? 'secondary' : 'ghost'} size="icon" onClick={() => setActiveKey(panel.key)} aria-label={panel.title}>
                  {panel.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{panel.title}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
      <div className="flex-1 p-4 w-px">
        {activePanel?.content}
      </div>
    </div>
  );
}
