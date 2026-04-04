'use client';

import React, { useMemo, useState, useEffect } from 'react';
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
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Search, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBuilderStore } from '@/hooks';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { SortableOutlineItem } from './SortableOutlineItem';
import { useOutlineOperations } from './useOutlineOperations';

/**
 * SidebarOutlineManager — A docked structural navigator for the side panel.
 * Refactored to use shared outline primitives and consolidated project logic.
 */

interface SidebarOutlineManagerProps {
  activeChapterId: string | null;
  selectedSectionIds: string[];
  onActiveChapterChange: (id: string | null) => void;
  onActiveSectionChange: (id: string | null, multiSelect?: boolean) => void;
}

export function SidebarOutlineManager({
  activeChapterId,
  selectedSectionIds,
  onActiveChapterChange,
  onActiveSectionChange,
}: SidebarOutlineManagerProps) {
  const { project, syncProjectStructure } = useBuilderStore(state => ({
    project: state.project,
    syncProjectStructure: state.syncProjectStructure,
  }));

  const {
    handleMoveItem,
    handleUpdateTitle,
    handleDeleteItem,
    handleAddChapter,
    handleAddSection,
    handleDuplicateItem,
    handleCopyItem,
    handlePasteItem,
    undo
  } = useOutlineOperations(project);

  // Sync structural cache on mount
  useEffect(() => {
    syncProjectStructure();
  }, [syncProjectStructure]);

  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Integrated Keyboard Logic for Sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      const activeId = activeChapterId || (selectedSectionIds.length > 0 ? selectedSectionIds[0] : null);
      const isChapter = !!activeChapterId;

      if (isMod && e.key === 'z') {
        e.preventDefault();
        undo();
      }

      if (!activeId) return;

      if (isMod && e.key === 'd') {
        e.preventDefault();
        handleDuplicateItem(activeId, isChapter);
      }
      if (isMod && e.key === 'c') {
        e.preventDefault();
        handleCopyItem(activeId, isChapter);
      }
      if (isMod && e.key === 'v') {
        e.preventDefault();
        handlePasteItem(activeId, isChapter);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeChapterId, selectedSectionIds, undo, handleDuplicateItem, handleCopyItem, handlePasteItem]);

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
    setTimeout(() => {
      const element = document.getElementById(`item-${id}`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      handleMoveItem(active.id.toString(), over.id.toString());
    }
  };

  if (!project) return null;

  // Optimized Search for High-Density Sidebar
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return project.chapters as readonly Chapter[];
    const query = searchQuery.toLowerCase();
    return (project.chapters as readonly Chapter[]).filter(chapter => {
      return (
        chapter.title.toLowerCase().includes(query) ||
        chapter.sections.some(s => s.title.toLowerCase().includes(query))
      );
    });
  }, [project.chapters, searchQuery]);

  const allSortableIds = useMemo(() => {
    const ids: string[] = [];
    filteredChapters.forEach(c => {
      ids.push(c.id);
      if (expandedChapters.has(c.id) || searchQuery.trim()) {
        c.sections.forEach(s => {
          if (
            !searchQuery.trim() ||
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.title.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            ids.push(s.id);
          }
        });
      }
    });
    return ids;
  }, [filteredChapters, expandedChapters, searchQuery]);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Sidebar HUD Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary/40 shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
              Nav Structure
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest tabular-nums">
              {project.sections.length} Units
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-lg bg-primary/5 text-primary/60 border border-primary/10 hover:bg-primary/10 transition-all hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                handleAddChapter();
              }}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Dense Search HUD */}
        <div className="relative group/search">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SCAN OUTLINE..."
            className="h-8 pl-8 pr-8 text-[9px] bg-muted/5 border-primary/5 focus-visible:ring-primary/10 focus-visible:border-primary/20 rounded-xl transition-all font-bold uppercase tracking-widest"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/30 group-focus-within/search:text-primary transition-colors" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:text-primary transition-colors text-muted-foreground/40"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Navigator List — Independent ScrollArea */}
      <ScrollArea className="flex-1 min-h-0 -mx-1 px-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={allSortableIds} strategy={verticalListSortingStrategy}>
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
                onUpdateTitle={(newTitle) => handleUpdateTitle(chapter.id, newTitle, true)}
                onDelete={() => handleDeleteItem(chapter.id, true)}
              >
                {(chapter.sections as Section[])
                  .filter(
                    s =>
                      !searchQuery.trim() ||
                      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((section, sIdx) => (
                    <SortableOutlineItem
                      key={section.id}
                      id={section.id}
                      index={sIdx}
                      title={section.title}
                      isActive={selectedSectionIds.includes(section.id)}
                      hasContent={!!section.content}
                      onActivate={() => handleItemClick(section.id, false)}
                      onUpdateTitle={(newTitle) => handleUpdateTitle(section.id, newTitle, false)}
                      onDelete={() => handleDeleteItem(section.id, false)}
                    />
                  ))}
                {!searchQuery && (
                  <div
                    className="ml-4 mt-1 mb-2 px-2 py-1.5 flex items-center gap-2 rounded-xl border border-dashed border-primary/10 bg-primary/[0.01] hover:bg-primary/[0.03] transition-all cursor-pointer group/add active:scale-[0.98]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddSection(chapter.id);
                    }}
                  >
                    <Plus className="h-3 w-3 text-primary/30 group-hover/add:text-primary transition-colors" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/30 group-hover/add:text-primary transition-colors">
                      Integrate Node
                    </span>
                  </div>
                )}
              </SortableOutlineItem>
            ))}
          </SortableContext>
        </DndContext>
      </ScrollArea>
    </div>
  );
}
