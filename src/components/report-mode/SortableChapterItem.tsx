'use client';

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { useBuilderStore } from '@/hooks';
import type { Chapter } from '@/lib/models';
import { useSortable } from '@dnd-kit/sortable';
import {
  GripVertical,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import React from 'react';
import { SortableSectionItem } from './SortableSectionItem';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Checkbox } from "../ui/checkbox";


interface SortableChapterItemProps {
  chapter: Chapter;
  index: number;
  chapterIndex: number;
  onGenerateSection: (sectionId: string) => void;
  onGenerateChapter: (chapterId: string) => void;
  onAddSection: (chapterId: string) => void;
  activeMutationKey: string | null;
  isAnythingGenerating: boolean;
  hasCreditsForSingleSection: boolean;
  selectedSections: Set<string>;
  onSectionSelect: (sectionId: string) => void;
  onSelectAll: (select: boolean) => void;
}

export function SortableChapterItem({
  chapter,
  index,
  onGenerateChapter,
  selectedSections,
  onSectionSelect,
  onSelectAll,
  ...props
}: SortableChapterItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id });
  const { updateProject } = useBuilderStore();

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 0,
    position: 'relative',
  };

  const sectionsInChapter = chapter.sections;
  const isAllSelected = sectionsInChapter.length > 0 && sectionsInChapter.every(s => selectedSections.has(s.id));
  const canGenerateChapter = (selectedSections?.size ?? 0) >= 3;

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <AccordionItem value={chapter.id} className="bg-muted/30 border rounded-lg">
        <div className="flex items-center px-4 py-2">
          <AccordionTrigger className="flex-1 hover:no-underline py-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {listeners && (
                <div {...listeners} className="p-1 cursor-grab touch-none -ml-2 flex items-center gap-1 text-muted-foreground">
                  <span className="text-sm w-4 text-center font-semibold">{index + 1}.</span>
                  <GripVertical className="h-5 w-5" />
                </div>
              )}
              <span className="font-semibold truncate p-0 h-auto">
                {chapter.title}
              </span>
            </div>
          </AccordionTrigger>
          <div className="flex items-center gap-2 ml-2">
            <TooltipProvider>
               <Tooltip>
                 <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`select-all-${chapter.id}`}
                        checked={isAllSelected}
                        onCheckedChange={(checked) => onSelectAll(!!checked)}
                      />
                       <label htmlFor={`select-all-${chapter.id}`} className="text-xs text-muted-foreground">Select All</label>
                    </div>
                 </TooltipTrigger>
                 <TooltipContent>Select all sections in this chapter for generation.</TooltipContent>
               </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Wrap button in div to allow tooltip even when disabled */}
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onGenerateChapter(chapter.id)}
                      disabled={props.isAnythingGenerating || !canGenerateChapter}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Chapter
                    </Button>
                  </div>
                </TooltipTrigger>
                {!canGenerateChapter && <TooltipContent>Please select at least 3 sections to generate a chapter.</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <AccordionContent>
          <div className="border-t px-4 py-4 space-y-4">
            <div className="w-full space-y-2">
              {chapter.sections.map((section, sectionIndex) => (
                <SortableSectionItem
                  key={section.id}
                  section={section}
                  index={sectionIndex}
                  chapterIndex={props.chapterIndex}
                  onGenerate={() => props.onGenerateSection(section.id)}
                  isGenerating={props.activeMutationKey === section.id}
                  isAnythingGenerating={props.isAnythingGenerating}
                  hasCredits={props.hasCreditsForSingleSection}
                  isSelected={selectedSections.has(section.id)}
                  onSelect={() => onSectionSelect(section.id)}
                />
              ))}
            </div>
             <Button size="sm" variant="outline" onClick={() => props.onAddSection(chapter.id)} className="w-full">
               <PlusCircle className="me-2 h-4 w-4" />
               Add New Section
             </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};
