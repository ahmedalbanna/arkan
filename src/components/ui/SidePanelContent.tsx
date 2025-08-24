import { useState, type ReactNode, type ReactElement } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface PanelItem {
  key: string;
  title: string;
  icon: ReactElement;
  content: ReactNode;
}

interface SidePanelContentProps {
  panels: PanelItem[];
  defaultActiveKey?: string;
}

/**
 * Renders a set of tabbed panels with vertical icon-based navigation.
 * This component is designed to be used inside a collapsible container.
 */
export function SidePanelContent({ panels, defaultActiveKey }: SidePanelContentProps) {
  const [activeKey, setActiveKey] = useState<string | undefined>(defaultActiveKey ?? panels[0]?.key);

  const activePanel = panels.find((p) => p.key === activeKey);

  if (!panels || panels.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-row bg-background border rounded-r-lg">
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
      <div className="flex-1 p-4">
        {activePanel?.content}
      </div>
    </div>
  );
}
