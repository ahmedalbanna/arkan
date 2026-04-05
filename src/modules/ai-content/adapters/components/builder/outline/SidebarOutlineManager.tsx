'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Search, X, Plus, Layers, AlertCircle, Binary } from 'lucide-react';
import { useBuilderStore } from '@/hooks';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/infrastructure/utils/cn';
import { SortableOutlineItem } from './SortableOutlineItem';
import { useOutlineOperations } from './useOutlineOperations';

/**
 * SidebarOutlineManager — A docked structural navigator for the side panel.
 * Orchestrates the document hierarchy via drag-and-drop and rapid mutations.
 * 
 * DEFENSIVE MEASURES:
 * 1. Dnd-Kit Safety: Validates node existence before triggering move operations.
 * 2. Search Resilience: Efficiently filters chapters and sections with null-safety.
 * 3. Atomic State Logic: Synchronizes local expansion with project mutations.
 * 4. UX Integrity: Enhanced feedback for empty states and search misses.
 */

interface SidebarOutlineManagerProps {
  activeChapterId: string | null;
  onSelectChapter: (id: string) => void;
  selectedSectionIds: string[];
  onToggleSectionSelection: (id: string) => void;
  viewMode: 'edit' | 'preview';
}

export function SidebarOutlineManager({
  activeChapterId,
  onSelectChapter,
  selectedSectionIds,
  onToggleSectionSelection,
  viewMode,
}: SidebarOutlineManagerProps) {
  const project = useBuilderStore(state => state.project);
  
  // 1. OPERATION RESOLUTION — Standardized mutations
  const {
    handleMoveItem,
    handleUpdateTitle,
    handleDeleteItem,
    handleAddChapter,
    handleAddSection,
    handleDuplicateItem,
    handleCopyItem,
    handlePasteItem,
    clipboard
  } = useOutlineOperations(project, {
    onSelectChapter,
    onSelectSection: (id) => onToggleSectionSelection(id || ''),
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // 2. SEARCH & FILTER LOGIC — Defensive and memoized
  const filteredContent = useMemo(() => {
    if (!project?.content) return [];
    if (!searchQuery.trim()) return project.content;

    const query = searchQuery.toLowerCase().trim();
    return project.content.filter(item => {
      const title = item.title?.toLowerCase() || '';
      if (title.includes(query)) return true;
      
      if (item instanceof Chapter) {
        return item.sections.some(s => s.title?.toLowerCase().includes(query));
      }
      return false;
    });
  }, [project?.content, searchQuery]);

  // Expand chapters automatically when searching
  useEffect(() => {
    if (searchQuery.trim() && project) {
      const toExpand = new Set<string>();
      project.content.forEach(item => {
        if (item instanceof Chapter) {
          const hasMatch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.sections.some(s => s.title?.toLowerCase().includes(searchQuery.toLowerCase()));
          if (hasMatch) toExpand.add(item.id);
        }
      });
      setExpandedChapters(prev => new Set([...prev, ...toExpand]));
    }
  }, [searchQuery, project]);

  // 3. DND ORCHESTRATION
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (over && active.id !== over.id) {
      // Defensive: Ensure both nodes still exist in project
      const activeExists = project?.content.some(item => 
        item.id === active.id || (item instanceof Chapter && item.sections.some(s => s.id === active.id))
      );
      const overExists = project?.content.some(item => 
        item.id === over.id || (item instanceof Chapter && item.sections.some(s => s.id === over.id))
      );

      if (activeExists && overExists) {
        handleMoveItem(String(active.id), String(over.id));
      }
    }
  }, [project, handleMoveItem]);

  const toggleChapter = useCallback((id: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // 4. RENDER GUARDS
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-40 animate-in fade-in duration-500">
        <div className="p-5 rounded-[24px] bg-primary/5 border border-primary/10 shadow-inner">
          <Layers className="h-8 w-8 text-primary/40" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-10 leading-relaxed">
          Structural Core Offline
        </p>
      </div>
    );
  }

  const allNodeIds = project.content.flatMap(item => 
    item instanceof Chapter ? [item.id, ...item.sections.map(s => s.id)] : [item.id]
  );

  return (
    <div className="flex flex-col h-full gap-6 pt-2">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Structural Hub</h4>
          <p className="text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-widest">
            Manage document vectors.
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleAddChapter()}
          className="h-8 w-8 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary transition-all border border-primary/10"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative group/search px-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30 group-focus-within/search:text-primary transition-colors" />
        <Input
          placeholder="SEARCH ARCHITECTURE..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 pl-10 pr-10 text-[10px] bg-muted/5 border-primary/5 focus-visible:border-primary/20 rounded-xl transition-all uppercase font-bold tracking-widest"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex-1 relative min-h-0">
        {/* Depth architectural line */}
        <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
        
        <ScrollArea className="h-full pr-4 -mr-4">
          <div className="pb-24 space-y-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={allNodeIds} strategy={verticalListSortingStrategy}>
                {filteredContent.map((item) => {
                  const isChapter = item instanceof Chapter;
                  const isExpanded = expandedChapters.has(item.id);
                  const isActive = activeChapterId === item.id;

                  return (
                    <div key={item.id} className="space-y-1">
                      <SortableOutlineItem
                        id={item.id}
                        title={item.title}
                        isChapter={isChapter}
                        isActive={isActive}
                        isExpanded={isExpanded}
                        sectionCount={isChapter ? item.sections.length : undefined}
                        onToggleExpand={() => isChapter && toggleChapter(item.id)}
                        onClick={() => isChapter ? onSelectChapter(item.id) : onToggleSectionSelection(item.id)}
                        onUpdateTitle={(title) => handleUpdateTitle(item.id, title, isChapter)}
                        onDelete={() => handleDeleteItem(item.id, isChapter)}
                        onDuplicate={() => handleDuplicateItem(item.id, isChapter)}
                        onCopy={() => handleCopyItem(item.id, isChapter)}
                        onPaste={() => handlePasteItem(item.id, isChapter)}
                        canPaste={!!clipboard}
                        onAddSection={isChapter ? () => handleAddSection(item.id) : undefined}
                      />

                      {isChapter && isExpanded && item.sections.length > 0 && (
                        <div className="pl-4 space-y-1 border-l border-primary/10 ml-4.5 my-1">
                          {item.sections.map((section) => (
                            <SortableOutlineItem
                              key={section.id}
                              id={section.id}
                              title={section.title}
                              isChapter={false}
                              isActive={selectedSectionIds.includes(section.id)}
                              onClick={() => onToggleSectionSelection(section.id)}
                              onUpdateTitle={(title) => handleUpdateTitle(section.id, title, false)}
                              onDelete={() => handleDeleteItem(section.id, false)}
                              onDuplicate={() => handleDuplicateItem(section.id, false)}
                              onCopy={() => handleCopyItem(section.id, false)}
                              onPaste={() => handlePasteItem(section.id, false)}
                              canPaste={!!clipboard}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </SortableContext>

              {/* High-Fidelity Drag Overlay */}
              <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
                {activeDragId ? (
                  <div className="opacity-80 scale-105 transition-transform">
                    <div className="p-3.5 rounded-xl border border-primary/30 bg-background/95 backdrop-blur-md shadow-2xl flex items-center gap-3">
                        <div className="h-6 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-primary truncate max-w-[180px]">
                            Realigning Vector...
                        </span>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {filteredContent.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
                <div className="p-5 rounded-full bg-muted/20 border border-dashed border-muted-foreground/40">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] px-10 leading-relaxed">No Structural Match</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Stable Manifest Footer */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-3 border-t border-primary/10 bg-background/40 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary/30 shadow-[0_0_8px_rgba(var(--primary),0.3)]" />
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Navigator Core</span>
          </div>
          <div className="flex items-center gap-2">
            <Binary className="h-2.5 w-2.5 text-muted-foreground/20" />
            <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums">v2.1.4-STABLE</span>
          </div>
      </div>
    </div>
  );
}
