'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBuilderStore } from '@/hooks';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { AlertCircle, Binary, ChevronDown, ChevronUp, Layers, Plus, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SortableOutlineItem } from './SortableOutlineItem';
import { useOutlineOperations } from './useOutlineOperations';

interface SidebarOutlineManagerProps {
  activeChapterId: string | null;
  onActiveChapterChange: (id: string | null) => void;
  selectedSectionIds: string[];
  onActiveSectionChange: (id: string | null, multiSelect?: boolean) => void;
  viewMode?: 'edit' | 'preview';
  searchQuery?: string;
}

export function SidebarOutlineManager({
  activeChapterId,
  onActiveChapterChange,
  selectedSectionIds,
  onActiveSectionChange,
  viewMode = 'preview',
  searchQuery: externalSearchQuery = '',
}: SidebarOutlineManagerProps) {
  const project = useBuilderStore(state => state.project);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isExpandedAll, setIsExpandedAll] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchQuery = externalSearchQuery || internalSearchQuery;

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
    onSelectChapter: onActiveChapterChange,
    onSelectSection: onActiveSectionChange,
  });

  // Filtered content with search
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

  // Auto-expand chapters when searching
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

  // Expand/collapse all chapters
  const toggleExpandAll = useCallback(() => {
    if (!project) return;
    const newExpanded = new Set<string>();
    if (!isExpandedAll) {
      project.content.forEach(item => {
        if (item instanceof Chapter) {
          newExpanded.add(item.id);
        }
      });
    }
    setExpandedChapters(newExpanded);
    setIsExpandedAll(!isExpandedAll);
  }, [project, isExpandedAll]);

  // Desktop keyboard shortcuts
  useEffect(() => {

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Ctrl/Cmd + N to add chapter
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleAddChapter();
      }
      // Ctrl/Cmd + Shift + E to expand all
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        toggleExpandAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAddChapter, toggleExpandAll]);

  // DND Setup
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
    setIsExpandedAll(false);
  }, []);

  // Get all node IDs for DND
  const allNodeIds = useMemo(() => {
    if (!project?.content) return [];
    return project.content.flatMap(item =>
      item instanceof Chapter ? [item.id, ...item.sections.map(s => s.id)] : [item.id]
    );
  }, [project?.content]);

  // Render guard
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

  const totalChapters = project.content.filter(c => c instanceof Chapter).length;
  const totalSections = project.content.reduce((acc, c) =>
    acc + (c instanceof Chapter ? c.sections.length : 0), 0
  );

  return (
    <div className="flex flex-col h-full gap-6 pt-2">
      {/* Header with stats */}
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 flex items-center gap-2">
            <Layers className="h-3 w-3" />
            Structural Hub
          </h4>
          <p className="text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-widest">
            {totalChapters} chapter{totalChapters !== 1 ? 's' : ''}, {totalSections} section{totalSections !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {totalChapters > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleExpandAll}
                    className="h-7 w-7 rounded-lg"
                  >
                    {isExpandedAll ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px]">
                  {isExpandedAll ? 'Collapse All' : 'Expand All'} • ⌘⇧E
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleAddChapter()}
                  className="h-7 w-7 rounded-lg bg-primary/5 hover:bg-primary/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10px]">
                Add Chapter • ⌘N
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group/search px-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/30" />
        <Input
          ref={searchInputRef}
          placeholder={"Search architecture..."}
          value={internalSearchQuery}
          onChange={(e) => setInternalSearchQuery(e.target.value)}
          className="h-8 pl-8 pr-8 text-[10px] bg-muted/5 border-primary/10 rounded-lg focus-visible:ring-primary/20"
        />
        {internalSearchQuery && (
          <button
            onClick={() => setInternalSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-3 w-3 text-muted-foreground/40 hover:text-primary transition-colors" />
          </button>
        )}
      </div>

      {/* Outline Tree */}
      <ScrollArea className="flex-1 -mr-4 pr-4">
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
                      onClick={() => isChapter ? onActiveChapterChange(item.id) : onActiveSectionChange(item.id)}
                      onUpdateTitle={(title) => handleUpdateTitle(item.id, title, isChapter)}
                      onDelete={() => handleDeleteItem(item.id, isChapter)}
                      onDuplicate={() => handleDuplicateItem(item.id, isChapter)}
                      onCopy={() => handleCopyItem(item.id, isChapter)}
                      onPaste={() => handlePasteItem(item.id, isChapter)}
                      canPaste={!!clipboard}
                      onAddSection={isChapter ? () => handleAddSection(item.id) : undefined}
                      isDesktop={true}
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
                            onClick={() => onActiveSectionChange(section.id)}
                            onUpdateTitle={(title) => handleUpdateTitle(section.id, title, false)}
                            onDelete={() => handleDeleteItem(section.id, false)}
                            onDuplicate={() => handleDuplicateItem(section.id, false)}
                            onCopy={() => handleCopyItem(section.id, false)}
                            onPaste={() => handlePasteItem(section.id, false)}
                            canPaste={!!clipboard}
                            isDesktop={true}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </SortableContext>

            {/* Drag Overlay */}
            <DragOverlay
              dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                  styles: { active: { opacity: '0.4' } }
                })
              }}
            >
              {activeDragId ? (
                <div className="opacity-90 scale-105 transition-transform">
                  <div className="px-4 py-2.5 rounded-lg border border-primary/30 bg-background/95 backdrop-blur-md shadow-2xl flex items-center gap-3">
                    <div className="h-5 w-0.5 bg-primary rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                      Moving...
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
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {searchQuery ? 'No Structural Match' : 'No Chapters'}
                </p>
                <p className="text-[9px] font-medium leading-relaxed italic max-w-[200px]">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : 'Add your first chapter to begin structuring your document.'
                  }
                </p>
                {!searchQuery && (
                  <p className="text-[8px] font-mono text-primary/40 mt-2">
                    Press ⌘N to add a chapter
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="absolute bottom-0 left-0 right-0 px-5 py-2.5 border-t border-primary/10 bg-background/80 backdrop-blur-sm flex items-center justify-between text-[8px]">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-primary/30" />
          <span className="font-black uppercase tracking-widest text-muted-foreground/40">
            {filteredContent.length} item{filteredContent.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2" aria-hidden="true">
          <Binary className="h-2.5 w-2.5 text-muted-foreground/20" />
          <span className="font-mono text-muted-foreground/20">
            v1.0
          </span>
        </div>
      </div>
    </div>
  );
}
