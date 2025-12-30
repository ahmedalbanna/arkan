
'use client';

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Chapter } from '@/lib/models';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  PlusCircle,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { Checkbox } from "../ui/checkbox";
import { SectionAccordionItem } from './SectionAccordionItem';

interface SortableChapterItemProps {
  chapter: Chapter;
  index: number;
  onGenerateSection: (sectionId: string) => void;
  onGenerateChapter: (chapterId: string) => void;
  onAddSection: (chapterId: string) => void;
  activeMutationKey: string | null;
  isAnythingGenerating: boolean;
  hasCreditsForSingleSection: boolean;
  isBuildMode: boolean;
  onEnterBuildMode: () => void;
  onCancelBuildMode: () => void;
  isProjectBuildMode: boolean;
  selectedSections: Set<string>;
  onSectionSelectToggle: (sectionId: string) => void;
  onChapterSelectToggle: (chapterId: string, selectAll: boolean) => void;
}

export function SortableChapterItem({
  chapter,
  index,
  onGenerateChapter,
  onAddSection,
  isBuildMode,
  onEnterBuildMode,
  onCancelBuildMode,
  isProjectBuildMode,
  selectedSections,
  onSectionSelectToggle,
  onChapterSelectToggle,
  ...props
}: SortableChapterItemProps) {
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
    return sectionsInChapter.every(s => selectedSections.has(s.id));
  }, [sectionsInChapter, selectedSections]);

  const isSomeSectionsSelected = useMemo(() => {
    if (sectionsInChapter.length === 0) return false;
    const hasSelected = sectionsInChapter.some(s => selectedSections.has(s.id));
    return hasSelected && !isAllSectionsSelected;
  }, [sectionsInChapter, selectedSections, isAllSectionsSelected]);


  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <AccordionItem value={chapter.id} className="bg-muted/30 border rounded-lg">
        <div className="flex items-center px-4 py-2">
          {isProjectBuildMode && (
            <div className="flex items-center gap-2 mr-2">
              <Checkbox
                id={`select-chapter-${chapter.id}`}
                checked={isAllSectionsSelected}
                aria-checked={isSomeSectionsSelected ? 'mixed' : isAllSectionsSelected}
                onCheckedChange={(checked) => onChapterSelectToggle(chapter.id, !!checked)}
                aria-label={`Select all sections in chapter ${chapter.title}`}
              />
            </div>
          )}
          <AccordionTrigger className="flex-1 hover:no-underline py-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {listeners && (
                <div {...listeners} className="p-1 cursor-grab touch-none -ml-2 flex items-center gap-1 text-muted-foreground">
                  <span className="text-sm w-4 text-center font-semibold">{index + 1}.</span>
                  <GripVertical className="h-5 w-5" />
                </div>
              )}
              <span className="font-semibold truncate p-0 h-auto flex-1 text-left min-w-0">
                {chapter.title}
              </span>
            </div>
          </AccordionTrigger>
        </div>
        <AccordionContent>
          <div className="border-t px-4 py-4 space-y-4">

            <div className="w-full space-y-2">
              {chapter.sections.map((section, sectionIndex) => (
                <SectionAccordionItem
                  key={section.id}
                  section={section}
                  index={sectionIndex}
                  chapterIndex={index}
                  onGenerate={() => props.onGenerateSection(section.id)}
                  isGenerating={props.activeMutationKey === section.id}
                  isAnythingGenerating={props.isAnythingGenerating}
                  hasCredits={props.hasCreditsForSingleSection}
                  isSelected={selectedSections.has(section.id)}
                  onSelect={() => onSectionSelectToggle(section.id)}
                  isCheckboxVisible={isBuildMode || isProjectBuildMode}
                />
              ))}
            </div>

            <Button size="sm" variant="outline" onClick={() => onAddSection(chapter.id)} className="w-full">
              <PlusCircle className="me-2 h-4 w-4" />
              Add New Section
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};
