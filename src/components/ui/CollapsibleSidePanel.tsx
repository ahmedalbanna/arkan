
'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMobile } from '@/hooks';
import { cn } from '@/lib/utils/cn';
import { type ReactElement, type ReactNode, useRef } from 'react';
import { ScrollIndicator } from './scroll-utilities';

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
}

export function CollapsibleSidePanel({
  panels,
  activeKey,
  onActiveKeyChange,
  className,
}: CollapsibleSidePanelProps) {
  const isMobile = useMobile();
  const activePanel = panels.find((p) => p.key === activeKey);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!panels || panels.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "self-start flex flex-row bg-background border rounded-lg overflow-hidden",
      isMobile && "mb-16",
      className
    )}>
      {/* Vertical Divider */}
      <div className="flex flex-col gap-2 border-r p-2 flex-shrink-0">
        <TooltipProvider>
          {panels.map((panel) => (
            <Tooltip key={panel.key} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button 
                  variant={activeKey === panel.key ? 'secondary' : 'ghost'} 
                  size="icon" 
                  onClick={() => onActiveKeyChange(panel.key)} 
                  aria-label={panel.title}
                  className="transition-all duration-200"
                >
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

      {/* Content Panel with Scroll Area */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        <ScrollIndicator containerRef={scrollRef} />
        <ScrollArea className="h-full w-full">
          <div 
            ref={scrollRef}
            className="p-4 w-full scroll-smooth"
          >
            {activePanel?.content}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
