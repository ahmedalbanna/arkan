
import { cn } from '@/lib/utils/cn';
import { SidePanelContent, type PanelItem } from './SidePanelContent';
import { useMobile } from '@/hooks';

interface CollapsibleSidePanelProps {
  /**
   * An array of panel objects to display as tabs.
   */
  panels: PanelItem[];
  /**
   * The key of the panel to be active by default. If not provided, the first panel is active.
   */
  defaultActiveKey?: string;
  /**
   * Optional class name for the root container.
   */
  className?: string;
}

/**
 * A side panel that displays multiple, switchable tool panels.
 */
export function CollapsibleSidePanel({
  panels,
  defaultActiveKey,
  className,
}: CollapsibleSidePanelProps) {
    const isMobile = useMobile();
  return (
    <div className={cn(
        "lg:sticky lg:top-24 self-start",
        isMobile && "mb-16", // Add margin-bottom on mobile to avoid overlap with bottom nav
        className
    )}>
      <SidePanelContent panels={panels} defaultActiveKey={defaultActiveKey} />
    </div>
  );
}
