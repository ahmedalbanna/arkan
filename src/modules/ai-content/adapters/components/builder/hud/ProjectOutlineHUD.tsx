'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/infrastructure/utils/cn';
import { 
  GripVertical, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  X, 
  Trash2, 
  Check, 
  Pencil, 
  Plus, 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Project } from '@/modules/projects/domain/entities/Project';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';

/**
 * ProjectOutlineHUD — A high-fidelity, interactive document map for the Intelligence Suite.
 * Provides drag-and-drop structural management, inline editing, and rapid navigation.
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
}

/**
 * Individual item within the sortable outline.
 * Handles its own drag state, inline editing, and selection styling.
 */
const SortableOutlineItem = ({ 
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
  children 
}: SortableOutlineItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isEditing });

  const style = {
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
    <div ref={setNodeRef} style={style} className={cn("group/item select-none", isChapter ? "mb-2" : "mb-1 ml-4")}>
      <div 
        className={cn(
            "flex items-center gap-2 p-1.5 rounded-xl transition-all duration-300 cursor-pointer border",
            isActive
                ? "bg-primary/10 border-primary/20 shadow-[0_2px_8px_rgba(var(--primary),0.08)]" 
                : "bg-transparent border-transparent hover:bg-muted/10",
        )}
        onDoubleClick={handleStartEdit}
      >
        {/* Drag Handle — High-sensitivity indicator */}
        <div 
          {...attributes} 
          {...listeners} 
          className={cn(
            "p-0.5 transition-all duration-300 opacity-0 group-hover/item:opacity-40 cursor-grab active:cursor-grabbing hover:opacity-100"
          )}
        >
          <GripVertical className="h-3 w-3" />
        </div>

        {/* Content Area — Logic and Navigation */}
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
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3 text-primary/40" />}
            </button>
          )}

          {/* Status Dot — High-density content awareness */}
          {!isEditing && (
            <div className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-500",
                hasContent ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]" : "bg-amber-500/40"
            )} />
          )}

          {/* Technical Index */}
          {!isEditing && (
            <span className={cn(
                "text-[9px] font-black tabular-nums opacity-40 uppercase tracking-[0.15em] shrink-0",
                isActive && "opacity-100 text-primary",
            )}>
                {(index + 1).toString().padStart(2, '0')}
            </span>
          )}

          {/* Title / Editor — Specialized typography */}
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
                <Button variant="ghost" size="icon" className="h-6 w-6 text-green-600 shrink-0" onClick={handleFinishEdit}>
                    <Check className="h-3 w-3" />
                </Button>
            </div>
          ) : (
            <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest truncate transition-colors duration-300",
                isActive ? "text-primary" : "text-muted-foreground group-hover/item:text-foreground",
                isChapter && "font-black tracking-[0.18em]",
            )}>
                {title || (isChapter ? 'Untitled Chapter' : 'Untitled Section')}
            </span>
          )}
        </div>

        {/* Action HUD — Contextual operations */}
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
                    onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                >
                    <Trash2 className="h-2.5 w-2.5" />
                </Button>
            </div>
        )}
      </div>
      
      {/* Recursion / Nested Content */}
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

interface ProjectOutlineHUDProps {
  isVisible: boolean;
  project: Project | null;
  activeChapterId: string | null;
  selectedSectionIds: string[];
  onActiveChapterChange: (id: string | null) => void;
  onActiveSectionChange: (id: string | null) => void;
  onMoveItem: (activeId: string, overId: string) => void;
  onUpdateTitle: (id: string, newTitle: string, isChapter: boolean) => void;
  onDeleteItem: (id: string, isChapter: boolean) => void;
  onAddChapter: () => void;
  onAddSection: (chapterId: string) => void;
  onDuplicateItem: (id: string, isChapter: boolean) => void;
  onUndo: () => void;
  onCopyItem: (id: string, isChapter: boolean) => void;
  onPasteItem: (targetId: string, isChapter: boolean) => void;
}

/**
 * ProjectOutlineHUD — Primary workspace navigator.
 * Aligned with the Intelligence Suite HUD architecture.
 */
export const ProjectOutlineHUD = ({
  isVisible,
  project,
  activeChapterId,
  selectedSectionIds,
  onActiveChapterChange,
  onActiveSectionChange,
  onMoveItem,
  onUpdateTitle,
  onDeleteItem,
  onAddChapter,
  onAddSection,
  onDuplicateItem,
  onUndo,
  onCopyItem,
  onPasteItem
}: ProjectOutlineHUDProps) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Global Keyboard Shortcuts for High-Density Workflow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isVisible) return;

        const isMod = e.metaKey || e.ctrlKey;
        const activeId = activeChapterId || (selectedSectionIds.length > 0 ? selectedSectionIds[0] : null);
        const isChapter = !!activeChapterId;

        if (isMod && e.key === 'z') {
            e.preventDefault();
            onUndo();
        }

        if (activeId) {
            if (isMod && e.key === 'd') {
                e.preventDefault();
                onDuplicateItem(activeId, isChapter);
            }
            if (isMod && e.key === 'c') {
                e.preventDefault();
                onCopyItem(activeId, isChapter);
            }
            if (isMod && e.key === 'v') {
                e.preventDefault();
                onPasteItem(activeId, isChapter);
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, activeChapterId, selectedSectionIds, onUndo, onDuplicateItem, onCopyItem, onPasteItem]);

  const toggleChapter = (id: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleItemClick = (id: string, isChapter: boolean) => {
    if (isChapter) {
        onActiveChapterChange(id);
    } else {
        onActiveSectionChange(id);
    }

    // Scroll coordination with document canvas
    setTimeout(() => {
        const element = document.getElementById(`item-${id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onMoveItem(active.id.toString(), over.id.toString());
    }
  };

  if (!project) return null;

  // Search Logic — Specialized for structural filtering
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return project.chapters as readonly Chapter[];

    const query = searchQuery.toLowerCase();
    return (project.chapters as readonly Chapter[]).filter(chapter => {
        const chapterMatches = chapter.title.toLowerCase().includes(query);
        const sectionsMatch = chapter.sections.some(s => s.title.toLowerCase().includes(query));
        return chapterMatches || sectionsMatch;
    });
  }, [project.chapters, searchQuery]);

  const allSortableIds = useMemo(() => {
    const ids: string[] = [];
    filteredChapters.forEach(c => {
      ids.push(c.id);
      if (expandedChapters.has(c.id) || searchQuery.trim()) {
        c.sections.forEach(s => {
            if (!searchQuery.trim() || s.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                ids.push(s.id);
            }
        });
      }
    });
    return ids;
  }, [filteredChapters, expandedChapters, searchQuery]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-20 left-8 z-[50] w-80 max-h-[calc(100vh-12rem)] overflow-hidden flex flex-col bg-background/60 backdrop-blur-3xl border border-primary/10 rounded-[32px] shadow-[0_12px_48px_rgba(0,0,0,0.12)]"
        >
          {/* HUD Header — Architectural Pulse */}
          <div className="px-5 py-4 border-b border-primary/10 space-y-4 bg-primary/[0.03]">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">Project Outline</h3>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
                        {project.sections.length} NODES
                    </span>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all hover:scale-110 active:scale-95 shadow-sm"
                        onClick={(e) => { e.stopPropagation(); onAddChapter(); }}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Tactical Search Interface */}
            <div className="relative group/search">
                <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SCAN STRUCTURE..."
                    className="h-9 pl-9 pr-9 text-[10px] bg-muted/5 border-primary/5 focus-visible:border-primary/20 focus-visible:ring-primary/10 rounded-2xl transition-all uppercase font-bold tracking-widest placeholder:text-muted-foreground/30"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/20 group-focus-within/search:text-primary transition-colors" />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:text-primary transition-colors text-muted-foreground/40"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
          </div>

          {/* Primary Outline Logic */}
          <div className="flex-1 overflow-auto px-2 py-3 custom-scrollbar">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={allSortableIds}
                strategy={verticalListSortingStrategy}
              >
                {filteredChapters.map((chapter, cIdx) => (
                  <SortableOutlineItem
                    key={chapter.id}
                    id={chapter.id}
                    index={cIdx}
                    title={chapter.title}
                    isActive={activeChapterId === chapter.id}
                    isChapter={true}
                    isExpanded={expandedChapters.has(chapter.id) || !!searchQuery.trim()}
                    hasContent={chapter.sections.some((s: Section) => !!s.content)}
                    onActivate={() => handleItemClick(chapter.id, true)}
                    onToggleExpand={() => toggleChapter(chapter.id)}
                    onUpdateTitle={(newTitle) => onUpdateTitle(chapter.id, newTitle, true)}
                    onDelete={() => onDeleteItem(chapter.id, true)}
                  >
                    {(chapter.sections as Section[])
                      .filter(s => !searchQuery.trim() || s.title.toLowerCase().includes(searchQuery.toLowerCase()) || chapter.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((section, sIdx) => (
                      <SortableOutlineItem
                        key={section.id}
                        id={section.id}
                        index={sIdx}
                        title={section.title}
                        isActive={selectedSectionIds.includes(section.id)}
                        hasContent={!!section.content}
                        onActivate={() => handleItemClick(section.id, false)}
                        onUpdateTitle={(newTitle) => onUpdateTitle(section.id, newTitle, false)}
                        onDelete={() => onDeleteItem(section.id, false)}
                      />
                    ))}
                    {!searchQuery && (
                        <div 
                            className="ml-4 mt-2 mb-3 px-3 py-2 flex items-center gap-2.5 rounded-xl border border-dashed border-primary/20 bg-primary/[0.02] hover:bg-primary/[0.05] transition-all cursor-pointer group/add active:scale-[0.98]"
                            onClick={(e) => { e.stopPropagation(); onAddSection(chapter.id); }}
                        >
                            <div className="h-5 w-5 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 group-hover/add:border-primary/30 transition-all">
                                <Plus className="h-3 w-3 text-primary/40 group-hover/add:text-primary transition-colors" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 group-hover/add:text-primary transition-colors">Integrate Node</span>
                        </div>
                    )}
                  </SortableOutlineItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>

          {/* Persistent Metadata Footer */}
          <div className="px-5 py-2.5 bg-background/40 border-t border-primary/10 flex items-center justify-between backdrop-blur-2xl">
             <div className="flex items-center gap-2">
                 <div className="h-1.5 w-1.5 rounded-full bg-primary/20" />
                 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                    Manifest Outline
                 </p>
             </div>
             <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-green-500/5 border border-green-500/10">
                <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-green-600/60">Live Mode</p>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

ProjectOutlineHUD.displayName = 'ProjectOutlineHUD';
