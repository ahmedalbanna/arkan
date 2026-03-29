'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/infrastructure/utils/cn';
import { GripVertical, ChevronRight, ChevronDown } from 'lucide-react';
import { Project } from '@/modules/projects/domain/entities/Project';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';

interface SortableItemProps {
  id: string;
  index: number;
  title: string;
  isActive: boolean;
  isChapter?: boolean;
  isExpanded?: boolean;
  hasContent?: boolean;
  onActivate: () => void;
  onToggleExpand?: () => void;
  children?: React.ReactNode;
}

const SortableItem = ({ 
  id, 
  index, 
  title, 
  isActive, 
  isChapter, 
  isExpanded, 
  hasContent,
  onActivate, 
  onToggleExpand,
  children 
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("group/item", isChapter ? "mb-2" : "mb-1 ml-4")}>
      <div className={cn(
        "flex items-center gap-2 p-1.5 rounded-lg transition-all duration-300 cursor-pointer",
        isActive 
          ? "bg-primary/10 border border-primary/20 shadow-sm" 
          : "hover:bg-muted/10 border border-transparent"
      )}>
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners} 
          className="opacity-0 group-hover/item:opacity-40 cursor-grab active:cursor-grabbing hover:opacity-100 transition-opacity p-0.5"
        >
          <GripVertical className="h-3 w-3" />
        </div>

        {/* Index & Title */}
        <div 
          className="flex-1 flex items-center gap-2 min-w-0"
          onClick={(e) => {
            e.stopPropagation();
            onActivate();
          }}
        >
          {isChapter && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand?.();
              }}
              className="p-0.5 hover:bg-primary/10 rounded transition-colors"
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          )}

          <div className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            hasContent ? "bg-green-500" : "bg-amber-500/60"
          )} />

          <span className={cn(
            "text-[10px] font-black tabular-nums opacity-40 uppercase tracking-widest shrink-0",
            isActive && "opacity-100 text-primary"
          )}>
            {index + 1}
          </span>

          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest truncate",
            isActive ? "text-primary" : "text-muted-foreground group-hover/item:text-foreground",
            isChapter && "font-black"
          )}>
            {title || (isChapter ? 'Untitled Chapter' : 'Untitled Section')}
          </span>
        </div>
      </div>
      
      {isChapter && isExpanded && (
        <div className="mt-1 border-l border-primary/10 ml-3.5 pl-1">
          {children}
        </div>
      )}
    </div>
  );
};

interface FloatingOutlineProps {
  isVisible: boolean;
  project: Project | null;
  activeChapterId: string | null;
  selectedSectionIds: string[];
  onActiveChapterChange: (id: string | null) => void;
  onActiveSectionChange: (id: string | null) => void;
  onMoveItem: (activeId: string, overId: string) => void;
}

export const FloatingOutline = ({
  isVisible,
  project,
  activeChapterId,
  selectedSectionIds,
  onActiveChapterChange,
  onActiveSectionChange,
  onMoveItem
}: FloatingOutlineProps) => {
  const [expandedChapters, setExpandedChapters] = React.useState<Set<string>>(new Set());
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const toggleChapter = (id: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onMoveItem(active.id.toString(), over.id.toString());
    }
  };

  if (!project) return null;

  const allSortableIds = useMemo(() => {
    const ids: string[] = [];
    (project.chapters as readonly Chapter[]).forEach(c => {
      ids.push(c.id);
      if (expandedChapters.has(c.id)) {
        (c.sections as Section[]).forEach(s => ids.push(s.id));
      }
    });
    return ids;
  }, [project.chapters, expandedChapters]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.95 }}
          className="absolute top-4 left-4 z-50 w-72 max-h-[calc(100%-2rem)] overflow-hidden flex flex-col bg-background/60 backdrop-blur-2xl border border-primary/10 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.1)] transition-all duration-500"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-primary/10 flex items-center justify-between bg-primary/[0.03]">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Document Outline</h3>
            </div>
            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                {project.sections.length} Units
            </span>
          </div>

          {/* Outline List */}
          <div className="flex-1 overflow-auto p-2 custom-scrollbar">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={allSortableIds}
                strategy={verticalListSortingStrategy}
              >
                {(project.chapters as readonly Chapter[]).map((chapter, cIdx) => (
                  <SortableItem
                    key={chapter.id}
                    id={chapter.id}
                    index={cIdx}
                    title={chapter.title}
                    isActive={activeChapterId === chapter.id}
                    isChapter={true}
                    isExpanded={expandedChapters.has(chapter.id)}
                    hasContent={chapter.sections.some((s: Section) => !!s.content)}
                    onActivate={() => onActiveChapterChange(chapter.id)}
                    onToggleExpand={() => toggleChapter(chapter.id)}
                  >
                    {(chapter.sections as Section[]).map((section, sIdx) => (
                      <SortableItem
                        key={section.id}
                        id={section.id}
                        index={sIdx}
                        title={section.title}
                        isActive={selectedSectionIds.includes(section.id)}
                        hasContent={!!section.content}
                        onActivate={() => onActiveSectionChange(section.id)}
                      />
                    ))}
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>

          {/* Footer Metadata */}
          <div className="px-4 py-2 bg-muted/20 border-t border-primary/10 flex items-center justify-between">
             <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                IDE Mode Active
             </p>
             <div className="flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-green-500" />
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-green-600/60">Live</p>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
