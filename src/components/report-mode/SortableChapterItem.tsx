'use client';

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import type { Chapter } from '@/lib/models';
import { useSortable } from '@dnd-kit/sortable';
import {
  GripVertical,
  PlusCircle,
  Sparkles,
  XCircle,
  Construction
} from 'lucide-react';
import React from 'react';
import { SortableSectionItem } from './SortableSectionItem';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";


interface SortableChapterItemProps {
  chapter: Chapter;
  index: number;
  onGenerateSection: (sectionId: string) => void;
  onGenerateChapter: (chapterId: string) => void;
  onAddSection: (chapterId: string) => void;
  activeMutationKey: string | null;
  isAnythingGenerating: boolean;
  hasCreditsForSingleSection: boolean;
  selectedSections: Set<string>;
  onSectionSelect: (sectionId: string) => void;
  onSelectAll: (select: boolean) => void;
  // New props for build mode
  isBuildMode: boolean;
  onEnterBuildMode: () => void;
  onCancelBuildMode: () => void;
}

export function SortableChapterItem({
  chapter,
  index,
  onGenerateChapter,
  onAddSection,
  selectedSections,
  onSectionSelect,
  onSelectAll,
  isBuildMode,
  onEnterBuildMode,
  onCancelBuildMode,
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
        </div>
        <AccordionContent>
          <div className="border-t px-4 py-4 space-y-4">

            {isBuildMode && (
              <div className="flex items-center gap-3 p-2 rounded-md border bg-background">
                <Checkbox
                  id={`select-all-${chapter.id}`}
                  checked={isAllSelected}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                />
                <Label htmlFor={`select-all-${chapter.id}`} className="font-semibold text-sm">Select All Sections</Label>
              </div>
            )}

            <div className="w-full space-y-2">
              {chapter.sections.map((section, sectionIndex) => (
                <SortableSectionItem
                  key={section.id}
                  section={section}
                  index={sectionIndex}
                  chapterIndex={index}
                  onGenerate={() => props.onGenerateSection(section.id)}
                  isGenerating={props.activeMutationKey === section.id}
                  isAnythingGenerating={props.isAnythingGenerating}
                  hasCredits={props.hasCreditsForSingleSection}
                  isSelected={selectedSections.has(section.id)}
                  onSelect={() => onSectionSelect(section.id)}
                  isCheckboxVisible={isBuildMode}
                />
              ))}
            </div>

            <Button size="sm" variant="outline" onClick={() => onAddSection(chapter.id)} className="w-full">
              <PlusCircle className="me-2 h-4 w-4" />
              Add New Section
            </Button>
            
            {isBuildMode ? (
              <div className="flex gap-2">
                <Button onClick={onCancelBuildMode} variant="secondary" className="w-full">
                  <XCircle className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-full">
                        <Button
                          onClick={() => onGenerateChapter(chapter.id)}
                          disabled={props.isAnythingGenerating || !canGenerateChapter}
                          className="w-full"
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
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={onEnterBuildMode}
                disabled={props.isAnythingGenerating}
                className="w-full"
              >
                <Construction className="mr-2 h-4 w-4" />
                Build Chapter
              </Button>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};
