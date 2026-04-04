'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/infrastructure/utils/cn';
import { GripVertical, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

/**
 * GenerationNodeItem — A shared high-fidelity component for sortable AI nodes.
 * Used for both Chapters and Sections in the GenerationNavigator.
 */

interface GenerationNodeItemProps {
  id: string;
  index: number;
  labelIndex?: string; // e.g. "1.2"
  title: string;
  isActive: boolean;
  isDraggingEnabled?: boolean;
  isGenerating?: boolean;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  level?: 0 | 1;
  onActivate: (id: string, multiSelect?: boolean) => void;
  onToggleSelection?: (id: string) => void;
  extra?: React.ReactNode;
  className?: string;
}

export const GenerationNodeItem = ({
  id,
  index,
  labelIndex,
  title,
  isActive,
  isDraggingEnabled = true,
  isGenerating = false,
  isSelectionMode = false,
  isSelected = false,
  level = 0,
  onActivate,
  onToggleSelection,
  extra,
  className,
}: GenerationNodeItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !isDraggingEnabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative',
  };

  const handleActivate = (e: React.MouseEvent) => {
    onActivate(id, e.shiftKey || e.metaKey || e.ctrlKey);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelection?.(id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group/item relative rounded-xl border transition-all duration-300 ease-out',
        level === 1 && 'ml-4',
        isActive
          ? 'border-primary/30 bg-primary/[0.03] shadow-[0_4px_20px_rgba(var(--primary),0.08)] ring-1 ring-primary/20 -translate-y-[0.5px]'
          : 'border-border/40 bg-card/50 shadow-sm hover:border-primary/20 hover:bg-muted/5 hover:translate-x-0.5',
        className
      )}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
        onClick={handleActivate}
      >
        {/* Selection HUD — Only visible in bulk mode */}
        {isSelectionMode && (
          <div className="shrink-0 mr-1" onClick={handleCheckboxClick}>
            <Checkbox
              checked={isSelected}
              className="h-3.5 w-3.5 rounded-sm border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-300"
            />
          </div>
        )}

        {/* Technical ID + Drag Handle */}
        {isDraggingEnabled && listeners && (
          <div
            {...listeners}
            {...attributes}
            className="flex items-center gap-1 shrink-0 text-muted-foreground/40 transition-colors hover:text-primary cursor-grab active:cursor-grabbing"
            onClick={e => e.stopPropagation()}
          >
            <span className={cn(
                "text-[9px] font-black uppercase tracking-[0.2em] w-7 text-center tabular-nums opacity-60 transition-colors duration-300",
                isActive && "opacity-100 text-primary"
            )}>
              {labelIndex || (index + 1).toString().padStart(2, '0')}
            </span>
            <GripVertical className="h-3.5 w-3.5 opacity-40 group-hover/item:opacity-100 transition-opacity ml-1" />
          </div>
        )}

        {/* Core Node Logic */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {isGenerating ? (
            <div className="relative shrink-0">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <div className="absolute inset-0 blur-sm bg-primary/20 animate-pulse rounded-full" />
            </div>
          ) : (
            <div
              className={cn(
                'h-1.5 w-1.5 rounded-full shrink-0 transition-all duration-500',
                isActive
                  ? 'bg-primary scale-125 shadow-[0_0_12px_rgba(var(--primary),0.8)] animate-pulse'
                  : 'bg-muted-foreground/20'
              )}
            />
          )}

          <span
            className={cn(
              'text-[11px] font-bold tracking-tight truncate flex-1 transition-colors duration-300',
              isActive ? 'text-foreground' : 'text-muted-foreground/80 group-hover/item:text-foreground',
              level === 0 && 'font-black uppercase tracking-wider text-[10px]'
            )}
          >
            {title || (level === 0 ? 'Untitled Chapter' : 'Untitled Section')}
          </span>
        </div>

        {/* Dynamic Contextual Layer (Badges, etc) */}
        {extra && (
            <div className="shrink-0 ml-1">
                {extra}
            </div>
        )}
      </div>
    </div>
  );
};
