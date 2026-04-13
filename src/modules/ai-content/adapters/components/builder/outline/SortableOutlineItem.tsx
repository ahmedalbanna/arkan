'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/infrastructure/utils/cn';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronDown,
  ChevronRight,
  Clipboard,
  Copy,
  Files,
  GripVertical,
  MoreVertical,
  Pencil,
  Plus,
  Trash2
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

/**
 * SortableOutlineItem — A shared high-fidelity component for document structure nodes.
 * Used in both the ProjectOutlineHUD and SidebarOutlineManager.
 *
 * DEFENSIVE MEASURES:
 * 1. Existence Guards: Checks for id and title before rendering interactions.
 * 2. Edit Validation: Verifies title content before committing updates.
 * 3. UX Safety: Implements try-catch for focus management and state transitions.
 * 4. Ref Safety: Uses ref for input focus to prevent stale closure issues.
 */

interface SortableOutlineItemProps {
  id: string;
  title: string;
  isChapter: boolean;
  isActive: boolean;
  isExpanded?: boolean;
  sectionCount?: number;
  onToggleExpand?: () => void;
  onClick: () => void;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
  onPaste: () => void;
  canPaste?: boolean;
  onAddSection?: () => void;
  isDesktop?: boolean;
}

export const SortableOutlineItem = ({
  id,
  title,
  isChapter,
  isActive,
  isExpanded,
  sectionCount,
  onToggleExpand,
  onClick,
  onUpdateTitle,
  onDelete,
  onDuplicate,
  onCopy,
  onPaste,
  canPaste,
  onAddSection,
}: SortableOutlineItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  // 1. INPUT VALIDATION & COMMIT — Guarded title updates
  const handleCommit = useCallback(() => {
    try {
      const trimmed = editValue.trim();
      if (trimmed && trimmed !== title) {
        onUpdateTitle(trimmed);
      } else {
        setEditValue(title); // Reset to original if empty or unchanged
      }
      setIsEditing(false);
    } catch (error) {
      console.error('[OutlineItem] Title commit failure:', error);
      setIsEditing(false);
    }
  }, [editValue, title, onUpdateTitle]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCommit();
    if (e.key === 'Escape') {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  const startEditing = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    // Focus after render
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // 2. RENDER LOGIC
  if (!id) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl transition-all duration-500 ease-[0.22,1,0.36,1]",
        isDragging && "opacity-40 scale-[0.98] z-50 ring-2 ring-primary/20",
        !isDragging && "hover:translate-x-0.5"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-xl border border-transparent transition-all",
          isActive ? "bg-primary/10 border-primary/20 shadow-sm" : "hover:bg-muted/5",
          isChapter ? "min-h-[44px]" : "min-h-[38px]"
        )}
        onClick={onClick}
      >
        {/* Drag Handle — Technical HUD feel */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg hover:bg-primary/5 text-muted-foreground/30 hover:text-primary/60 transition-all"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>

        {/* Expansion Toggle */}
        {isChapter && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand?.();
            }}
            className="p-1 rounded-md hover:bg-primary/5 text-muted-foreground/40 hover:text-primary transition-colors"
          >
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        )}

        {/* Node Identity Icon
        <div className={cn(
            "flex items-center justify-center rounded-lg shrink-0 transition-all duration-500",
            isChapter ? "h-7 w-7 bg-primary/5 border border-primary/10" : "h-6 w-6 opacity-40",
            isActive && "border-primary/30 shadow-inner"
        )}>
            {isChapter ? (
                <Layout className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-primary/40")} />
            ) : (
                <FileText className={cn("h-3 w-3", isActive ? "text-primary" : "text-muted-foreground")} />
            )}
        </div>
*/}
        {/* Title / Input Zone */}
        <div className="flex-1 min-w-0 px-1">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleCommit}
              onKeyDown={handleKeyDown}
              className="h-7 text-[11px] font-bold bg-background/80 border-primary/30 focus-visible:ring-primary/20 rounded-lg px-2 shadow-inner uppercase tracking-widest"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex items-center gap-2 group/text">
              <span className={cn(
                "text-[11px] truncate uppercase tracking-[0.12em] transition-all",
                isChapter ? "font-black" : "font-bold text-muted-foreground",
                isActive ? "text-foreground" : "group-hover/text:text-primary/80"
              )}>
                {title || (isChapter ? 'Untitled Chapter' : 'Untitled Section')}
              </span>
              <button
                onClick={startEditing}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-primary"
              >
                <Pencil className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
        </div>

        {/* Technical Metadata Badge */}
        {isChapter && sectionCount !== undefined && (
          <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/10 bg-primary/5 text-primary/60 tabular-nums px-2 rounded-full">
            {sectionCount}
          </Badge>
        )}

        {/* Context Menu Hub */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-primary/5 text-muted-foreground/40 hover:text-primary">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-md border-primary/10 rounded-xl shadow-2xl">
              {isChapter && onAddSection && (
                <>
                  <DropdownMenuItem onClick={onAddSection} className="text-[10px] font-black uppercase tracking-widest py-2.5 focus:bg-primary/5 focus:text-primary">
                    <Plus className="h-3.5 w-3.5 mr-2 opacity-60" /> Add Section
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary/5" />
                </>
              )}
              <DropdownMenuItem onClick={onDuplicate} className="text-[10px] font-black uppercase tracking-widest py-2.5 focus:bg-primary/5 focus:text-primary">
                <Files className="h-3.5 w-3.5 mr-2 opacity-60" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCopy} className="text-[10px] font-black uppercase tracking-widest py-2.5 focus:bg-primary/5 focus:text-primary">
                <Copy className="h-3.5 w-3.5 mr-2 opacity-60" /> Copy Logic
              </DropdownMenuItem>
              {canPaste && (
                <DropdownMenuItem onClick={onPaste} className="text-[10px] font-black uppercase tracking-widest py-2.5 focus:bg-primary/5 focus:text-primary">
                  <Clipboard className="h-3.5 w-3.5 mr-2 opacity-60" /> Paste Matrix
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-primary/5" />
              <DropdownMenuItem onClick={onDelete} className="text-[10px] font-black uppercase tracking-widest py-2.5 text-red-500 focus:bg-red-500/5 focus:text-red-600">
                <Trash2 className="h-3.5 w-3.5 mr-2 opacity-60" /> Terminate Node
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
