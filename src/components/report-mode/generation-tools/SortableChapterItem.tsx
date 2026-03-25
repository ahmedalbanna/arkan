'use client';

import { Button } from '@/components/ui/button';
import { Chapter } from '@/lib/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  PlusCircle,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { Checkbox } from "../../ui/checkbox";
import { SectionAccordionItem } from './SectionAccordionItem';
import { useBuilderStore } from "@/hooks";

interface SortableChapterItemProps {
  chapter: Chapter;
  index: number;
  isProjectBuildMode: boolean;
  selectedSectionsForBuild: Set<string>;
  toggleChapterSelection: (chapterId: string, select: boolean) => void;
  toggleSectionSelection: (sectionId: string) => void;
  activeSectionId: string | null;
  onActivateSection: (sectionId: string) => void;
}

export function SortableChapterItem({
  chapter,
  index,
  isProjectBuildMode,
  selectedSectionsForBuild,
  toggleChapterSelection,
  toggleSectionSelection,
  activeSectionId,
  onActivateSection,
}: SortableChapterItemProps) {
    const { 
        updateProject
    } = useBuilderStore(state => ({
        updateProject: state.updateProject,
    }));
    
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id });

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
    updateProject(p => p.addSectionToChapter(chapterId, 'Untitled Section'));
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center px-4 py-3 bg-muted/10 border-b">
          {isProjectBuildMode && (
            <div className="flex items-center gap-2 mr-2">
              <Checkbox
                id={`select-chapter-${chapter.id}`}
                checked={isAllSectionsSelected}
                aria-checked={isSomeSectionsSelected ? 'mixed' : isAllSectionsSelected}
                onCheckedChange={(checked) => toggleChapterSelection(chapter.id, !!checked)}
                aria-label={`Select all sections in chapter ${chapter.title}`}
              />
            </div>
          )}
          <div className="flex-1 py-0">
            <div className="flex items-center gap-3 flex-1 min-w-0 group">
              {listeners && (
                <div {...listeners} className="p-1.5 rounded-md cursor-grab touch-none -ml-2 flex items-center gap-2 text-muted-foreground transition-colors hover:bg-muted/40">
                  <span className="text-xs w-5 text-center font-semibold">{index + 1}.</span>
                  <GripVertical className="h-5 w-5" />
                </div>
              )}
              <span className="text-base font-semibold tracking-tight truncate p-0 h-auto flex-1 text-left min-w-0">
                {chapter.title}
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-border/60 px-4 py-4 space-y-4 bg-background">
          <div className="w-full space-y-2">
            {chapter.sections.map((section, sectionIndex) => (
              <SectionAccordionItem
                key={section.id}
                section={section}
                sectionIndex={sectionIndex}
                chapterIndex={index}
                isProjectBuildMode={isProjectBuildMode}
                isSelected={selectedSectionsForBuild.has(section.id)}
                toggleSectionSelection={toggleSectionSelection}
                isActive={activeSectionId === section.id}
                onActivate={onActivateSection}
              />
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={() => handleAddSection(chapter.id)} className="w-full">
            <PlusCircle className="me-2 h-4 w-4" />
            Add New Section
          </Button>
        </div>
      </div>
    </div>
  );
};
