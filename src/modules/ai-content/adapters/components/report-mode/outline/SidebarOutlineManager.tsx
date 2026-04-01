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
  verticalListSortingStrategy,
  useSortable,
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
  Copy,
  ClipboardPaste,
  RotateCcw,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBuilderStore } from '@/hooks';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks';

// ---------------------------------------------------------------------------
// SortableItem — inline, identical logic to FloatingOutline's SortableItem
// ---------------------------------------------------------------------------

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
  onUpdateTitle?: (newTitle: string) => void;
  onDelete?: () => void;
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
  onUpdateTitle,
  onDelete,
  children,
}: SortableItemProps) => {
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
    <div ref={setNodeRef} style={style} className={cn('group/item', isChapter ? 'mb-2' : 'mb-1 ml-4')}>
      <div
        className={cn(
          'flex items-center gap-2 p-1.5 rounded-lg transition-all duration-300 cursor-pointer border',
          isActive
            ? 'bg-primary/10 border-primary/20 shadow-sm'
            : 'bg-transparent border-transparent hover:bg-muted/10'
        )}
        onDoubleClick={handleStartEdit}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="p-0.5 transition-all duration-300 opacity-0 group-hover/item:opacity-40 cursor-grab active:cursor-grabbing hover:opacity-100"
        >
          <GripVertical className="h-3 w-3" />
        </div>

        {/* Index + title area */}
        <div
          className="flex-1 flex items-center gap-2 min-w-0"
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
              className="p-0.5 hover:bg-primary/10 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}

          {!isEditing && (
            <div
              className={cn(
                'h-1.5 w-1.5 rounded-full shrink-0',
                hasContent ? 'bg-green-500' : 'bg-amber-500/60'
              )}
            />
          )}

          {!isEditing && (
            <span
              className={cn(
                'text-[10px] font-black tabular-nums opacity-40 uppercase tracking-widest shrink-0',
                isActive && 'opacity-100 text-primary'
              )}
            >
              {index + 1}
            </span>
          )}

          {isEditing ? (
            <div className="flex-1 flex items-center gap-1">
              <Input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleFinishEdit}
                onKeyDown={handleKeyDown}
                className="h-6 text-[10px] py-0 px-2 bg-background border-primary/20 rounded-md font-bold uppercase tracking-widest"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-green-600"
                onClick={handleFinishEdit}
              >
                <Check className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <span
              className={cn(
                'text-[10px] font-bold uppercase tracking-widest truncate',
                isActive ? 'text-primary' : 'text-muted-foreground group-hover/item:text-foreground',
                isChapter && 'font-black'
              )}
            >
              {title || (isChapter ? 'Untitled Chapter' : 'Untitled Section')}
            </span>
          )}
        </div>

        {/* Action HUD */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
            <div
              className="p-1 hover:bg-primary/10 rounded-md cursor-pointer transition-colors text-muted-foreground hover:text-primary"
              onClick={handleStartEdit}
            >
              <Pencil className="h-2.5 w-2.5" />
            </div>
            <div
              className="p-1 hover:bg-red-500/10 rounded-md cursor-pointer transition-colors text-muted-foreground hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
            >
              <Trash2 className="h-2.5 w-2.5" />
            </div>
          </div>
        )}
      </div>

      {isChapter && isExpanded && (
        <div className="mt-1 border-l border-primary/10 ml-3.5 pl-1">{children}</div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// SidebarOutlineManager
// ---------------------------------------------------------------------------

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
  const { project, updateProject, undo } = useBuilderStore(state => ({
    project: state.project,
    updateProject: state.updateProject,
    undo: state.undo,
  }));

  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [clipboard, setClipboard] = useState<{ type: 'chapter' | 'section'; data: any } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Keyboard shortcuts (Cmd+Z undo, Cmd+D duplicate, Cmd+C copy, Cmd+V paste)
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
        handleDuplicate(activeId, isChapter);
      }
      if (isMod && e.key === 'c') {
        e.preventDefault();
        handleCopy(activeId, isChapter);
      }
      if (isMod && e.key === 'v') {
        e.preventDefault();
        handlePaste(activeId, isChapter);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChapterId, selectedSectionIds, clipboard]);

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
      updateProject(p => p.moveContentItem(active.id.toString(), over.id.toString()));
    }
  };

  const handleUpdateTitle = (id: string, newTitle: string, isChapter: boolean) => {
    if (isChapter) {
      updateProject(p => p.updateChapter(id, c => c.withProps({ title: newTitle })));
    } else {
      updateProject(p => p.updateSection(id, s => s.withProps({ title: newTitle })));
    }
  };

  const handleDeleteItem = (id: string, isChapter: boolean) => {
    if (isChapter) {
      updateProject(p => p.removeChapter(id));
    } else {
      const info = project?.findSection(id);
      if (info) {
        updateProject(p => p.updateChapter(info.chapter.id, c => c.removeSection(id)));
      }
    }
  };

  const handleAddChapter = () => {
    updateProject(p => p.addChapter(uuidv4(), 'New Chapter'));
  };

  const handleAddSection = (chapterId: string) => {
    updateProject(p => p.addSectionToChapter(chapterId, uuidv4(), 'New Section'));
  };

  const handleDuplicate = (id: string, isChapter: boolean) => {
    updateProject(p => (isChapter ? p.duplicateChapter(id, uuidv4) : p.duplicateSection(id, uuidv4)));
  };

  const handleCopy = (id: string, isChapter: boolean) => {
    if (isChapter) {
      const chapter = project?.getChapter(id);
      if (chapter) setClipboard({ type: 'chapter', data: chapter.toProperties() });
    } else {
      const info = project?.findSection(id);
      if (info) setClipboard({ type: 'section', data: info.section.toProperties() });
    }
    toast({ title: 'Copied', description: 'Item copied to outline clipboard.' });
  };

  const handlePaste = (targetId: string, targetIsChapter: boolean) => {
    if (!clipboard) return;
    updateProject(p => {
      const newId = uuidv4();
      if (clipboard.type === 'chapter') {
        const newChapterProps = {
          ...clipboard.data,
          id: newId,
          title: `${clipboard.data.title} (Copy)`,
        };
        if (newChapterProps.sections) {
          newChapterProps.sections = newChapterProps.sections.map((s: any) => ({ ...s, id: uuidv4() }));
        }
        const newChapter = new Chapter(newChapterProps);
        let insertionIndex = -1;
        if (targetIsChapter) {
          insertionIndex = p.content.findIndex(c => c.id === targetId);
        } else {
          const info = p.findSection(targetId);
          if (info) insertionIndex = p.content.findIndex(c => c.id === info.chapter.id);
        }
        if (insertionIndex !== -1) {
          const newContent = [...p.content];
          newContent.splice(insertionIndex + 1, 0, newChapter);
          return p.withProps({ content: newContent });
        }
      } else if (clipboard.type === 'section') {
        const newSectionProps = {
          ...clipboard.data,
          id: newId,
          title: `${clipboard.data.title} (Copy)`,
        };
        const newSection = new Section(newSectionProps);
        if (targetIsChapter) {
          return p.updateChapter(targetId, c => c.addSection(newSection, 0));
        } else {
          const info = p.findSection(targetId);
          if (info) {
            return p.updateChapter(info.chapter.id, c => c.addSection(newSection, info.sectionIndex + 1));
          }
        }
      }
      return p;
    });
    toast({ title: 'Pasted', description: `Successfully pasted ${clipboard.type}.` });
  };

  if (!project) return null;

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
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">
              Document Outline
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
              {project.sections.length} Units
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                handleAddChapter();
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative group/search">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search outline..."
            className="h-8 pl-8 pr-8 text-[10px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl transition-all"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40 group-focus-within/search:text-primary transition-colors" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:text-primary transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Outline list */}
      <ScrollArea className="flex-1 min-h-0 -mx-1 px-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={allSortableIds} strategy={verticalListSortingStrategy}>
            {filteredChapters.map((chapter, cIdx) => (
              <SortableItem
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
                    <SortableItem
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
                    className="ml-4 mt-1 mb-2 px-2 py-1.5 flex items-center gap-2 rounded-lg border border-dashed border-primary/20 bg-primary/[0.02] hover:bg-primary/[0.05] transition-all cursor-pointer group/add"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddSection(chapter.id);
                    }}
                  >
                    <Plus className="h-3 w-3 text-primary/40 group-hover/add:text-primary transition-colors" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 group-hover/add:text-primary transition-colors">
                      Add Section
                    </span>
                  </div>
                )}
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      </ScrollArea>
    </div>
  );
}
