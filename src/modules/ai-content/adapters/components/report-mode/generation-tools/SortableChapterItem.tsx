'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { cn } from '@/infrastructure/utils/cn';
import { useBuilderStore } from '@/hooks';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, GripVertical, PlusCircle } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SectionAccordionItem } from './SectionAccordionItem';

interface SortableChapterItemProps {
  chapter: Chapter;
  index: number;
  isProjectBuildMode: boolean;
  selectedSectionsForBuild: Set<string>;
  toggleChapterSelection: (chapterId: string, select: boolean) => void;
  toggleSectionSelection: (sectionId: string) => void;
  activeSectionId: string | null;
  selectedSectionIds?: string[];
  onActivateSection: (sectionId: string, multiSelect?: boolean) => void;
  onActivate?: () => void;
  isActive?: boolean;
}

export function SortableChapterItem({
  chapter,
  index,
  isProjectBuildMode,
  selectedSectionsForBuild,
  toggleChapterSelection,
  toggleSectionSelection,
  activeSectionId,
  selectedSectionIds = [],
  onActivateSection,
  onActivate,
  isActive,
}: SortableChapterItemProps) {
  const { updateProject } = useBuilderStore(state => ({
    updateProject: state.updateProject,
  }));

  const [isCollapsed, setIsCollapsed] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 0,
    position: 'relative',
  };

  const sectionsInChapter = chapter.sections;

  const isAllSectionsSelected = useMemo(() => {
    if (sectionsInChapter.length === 0) return false;
    return sectionsInChapter.every(s => selectedSectionsForBuild.has(s.id));
  }, [sectionsInChapter, selectedSectionsForBuild]);

  const isSomeSectionsSelected = useMemo(() => {
    if (sectionsInChapter.length === 0) return false;
    const hasSelected = sectionsInChapter.some(s => selectedSectionsForBuild.has(s.id));
    return hasSelected && !isAllSectionsSelected;
  }, [sectionsInChapter, selectedSectionsForBuild, isAllSectionsSelected]);

  const handleAddSection = (chapterId: string) => {
    updateProject(p => p.addSectionToChapter(chapterId, uuidv4(), 'Untitled Section'));
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="group/chapter-container">
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:translate-x-0.5',
          isActive
            ? 'border-primary/30 bg-primary/[0.02] ring-1 ring-primary/10 shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
            : 'border-border/60 bg-card/40 hover:border-primary/20 hover:shadow-md'
        )}
      >
        {/* Chapter Header */}
        <div
          className={cn(
            'flex items-center gap-3 border-b px-3 py-2 cursor-pointer transition-colors duration-200',
            isActive
              ? 'border-primary/10 bg-primary/[0.04]'
              : 'border-border/40 bg-muted/10 hover:bg-muted/20'
          )}
          onClick={() => onActivate?.()}
        >
          {/* Build mode checkbox */}
          {isProjectBuildMode && (
            <div
              className="shrink-0"
              onClick={e => e.stopPropagation()}
            >
              <Checkbox
                id={`select-chapter-${chapter.id}`}
                checked={isAllSectionsSelected}
                aria-checked={isSomeSectionsSelected ? 'mixed' : isAllSectionsSelected}
                onCheckedChange={(checked: boolean) =>
                  toggleChapterSelection(chapter.id, !!checked)
                }
                className="h-4 w-4 rounded-md border-primary/40 data-[state=checked]:bg-primary"
              />
            </div>
          )}

          {/* Drag handle + index */}
          {listeners && (
            <div
              {...listeners}
              className="flex items-center gap-1.5 shrink-0 text-muted-foreground/40 cursor-grab active:cursor-grabbing transition-colors hover:text-primary"
              onClick={e => e.stopPropagation()}
            >
              <span className="text-[9px] font-black uppercase tracking-[0.3em] w-5 text-center tabular-nums">
                {index + 1}
              </span>
              <GripVertical className="h-3.5 w-3.5 opacity-50 group-hover/chapter-container:opacity-100 transition-opacity" />
            </div>
          )}

          {/* Chapter title + section count */}
          <div className="flex flex-col flex-1 min-w-0">
            <span
              className={cn(
                'text-[11px] font-black uppercase tracking-[0.2em] truncate transition-colors duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground/80 group-hover/chapter-container:text-primary'
              )}
            >
              {chapter.title || 'UNTITLED CHAPTER'}
            </span>
            <span className="text-[9px] font-bold text-primary/40 uppercase tracking-[0.25em] mt-0.5">
              {sectionsInChapter.length} Sections Integrated
            </span>
          </div>

          {/* Collapse toggle */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-7 w-7 shrink-0 rounded-lg transition-all duration-200',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground/50 hover:bg-primary/5 hover:text-primary'
            )}
            onClick={e => {
              e.stopPropagation();
              setIsCollapsed(prev => !prev);
            }}
          >
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform duration-300',
                isCollapsed && '-rotate-90'
              )}
            />
          </Button>
        </div>

        {/* Sections Body */}
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="relative bg-muted/5 p-3">
                {/* Depth indicator line */}
                <div className="absolute left-6 top-0 bottom-8 w-px bg-gradient-to-b from-border/50 via-primary/10 to-transparent" />

                <div className="space-y-2 pl-6 rtl:pl-0 rtl:pr-6">
                  {chapter.sections.map((section, sectionIndex) => (
                    <SectionAccordionItem
                      key={section.id}
                      section={section}
                      sectionIndex={sectionIndex}
                      chapterIndex={index}
                      isProjectBuildMode={isProjectBuildMode}
                      isSelected={selectedSectionsForBuild.has(section.id)}
                      toggleSectionSelection={toggleSectionSelection}
                      isActive={selectedSectionIds.includes(section.id)}
                      onActivate={onActivateSection}
                    />
                  ))}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={e => {
                      e.stopPropagation();
                      handleAddSection(chapter.id);
                    }}
                    className="mt-3 h-8 w-full gap-2 rounded-xl border border-dashed border-border/50 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Section
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
