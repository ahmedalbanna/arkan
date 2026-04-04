'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/infrastructure/utils/cn';
import { GripVertical, ChevronRight, ChevronDown, Check, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * SortableOutlineItem — A shared high-fidelity component for document structure nodes.
 * Used in both the ProjectOutlineHUD and SidebarOutlineManager.
 */

interface SortableOutlineItemProps {
  id: string;
  index: number;
  title: string;
  isActive: boolean;
  isChapter?: boolean;
  isExpanded?: boolean;
  hasContent?: boolean;
  onActivate: () => void;
  onToggleExpand?: () => void;
  onUpdateTitle?: (newTitle: string) => void;
  onDelete?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const SortableOutlineItem = ({
  id,
  index,
  title,
  isActive,
  isChapter,
  isExpanded,
  hasContent,
  onActivate,
  onToggleExpand,
  onUpdateTitle,
  onDelete,
  children,
  className,
}: SortableOutlineItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: isEditing,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(title);
  };

  const handleFinishEdit = () => {
    if (editValue.trim() && editValue !== title) {
      onUpdateTitle?.(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleFinishEdit();
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(title);
    }
  };

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        className={cn(
            'group/item select-none transition-all duration-300', 
            isChapter ? 'mb-2' : 'mb-1 ml-4',
            className
        )}
    >
      <div
        className={cn(
          'flex items-center gap-2 p-1.5 rounded-xl transition-all duration-300 cursor-pointer border',
          isActive
            ? 'bg-primary/10 border-primary/20 shadow-[0_2px_8px_rgba(var(--primary),0.08)]'
            : 'bg-transparent border-transparent hover:bg-muted/10'
        )}
        onDoubleClick={handleStartEdit}
      >
        {/* Drag handle — Pulse icon on hover */}
        <div
          {...attributes}
          {...listeners}
          className="p-0.5 transition-all duration-300 opacity-0 group-hover/item:opacity-40 cursor-grab active:cursor-grabbing hover:opacity-100"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>

        {/* Node Identity + Label */}
        <div
          className="flex-1 flex items-center gap-2.5 min-w-0"
          onClick={(e) => {
            e.stopPropagation();
            onActivate();
          }}
        >
          {isChapter && !isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand?.();
              }}
              className="p-1 hover:bg-primary/10 rounded-lg transition-all active:scale-90"
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-primary/40" />
              )}
            </button>
          )}

          {/* Status Dot — Architectural state indicator */}
          {!isEditing && (
            <div
              className={cn(
                'h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-500',
                hasContent ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]' : 'bg-amber-500/40'
              )}
            />
          )}

          {/* Technical Index */}
          {!isEditing && (
            <span
              className={cn(
                'text-[9px] font-black tabular-nums opacity-40 uppercase tracking-[0.15em] shrink-0',
                isActive && 'opacity-100 text-primary'
              )}
            >
              {(index + 1).toString().padStart(2, '0')}
            </span>
          )}

          {/* Inline Content Title HUD */}
          {isEditing ? (
            <div className="flex-1 flex items-center gap-1.5">
              <Input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleFinishEdit}
                onKeyDown={handleKeyDown}
                className="h-6 text-[10px] py-0 px-2 bg-background border-primary/20 rounded-lg font-bold uppercase tracking-widest focus-visible:ring-primary/20"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-green-600 shrink-0"
                onClick={handleFinishEdit}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <span
              className={cn(
                'text-[10px] font-bold uppercase tracking-widest truncate transition-colors duration-300',
                isActive ? 'text-primary' : 'text-muted-foreground group-hover/item:text-foreground',
                isChapter && 'font-black tracking-[0.18em]'
              )}
            >
              {title || (isChapter ? 'Untitled Chapter' : 'Untitled Section')}
            </span>
          )}
        </div>

        {/* Action Controls HUD — Segmented */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
              onClick={handleStartEdit}
            >
              <Pencil className="h-2.5 w-2.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-600 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
            >
              <Trash2 className="h-2.5 w-2.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Recursion / Nested Content Branch */}
      <AnimatePresence>
        {isChapter && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-1 border-l border-primary/10 ml-[13px] pl-1 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
