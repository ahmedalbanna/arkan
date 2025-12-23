
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
  Construction,
  Eye,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { SortableSectionItem } from './SortableSectionItem';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { MarkdownViewer } from "../shared/MarkdownViewer";

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

function ChapterBuildContextPreviewDialog({ chapter, selectedSectionIds, isOpen, onOpenChange }: { chapter: Chapter, selectedSectionIds: Set<string>, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const combinedContent = useMemo(() => {
    return chapter.sections
      .filter(s => selectedSectionIds.has(s.id))
      .map(s => `## ${s.title}\n\n${s.content || '*No content yet.*'}`)
      .join('\n\n---\n\n');
  }, [chapter, selectedSectionIds]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Context Preview: {chapter.title}</DialogTitle>
          <DialogDescription>
            This is the combined content from the sections you selected. It will be used as context to generate the full chapter.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-hidden border rounded-md">
          <ScrollArea className="h-full">
            <div className="p-6">
              <MarkdownViewer content={combinedContent} />
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
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
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 0,
    position: 'relative',
  };

  const sectionsInChapter = chapter.sections;
  const isAllSelected = sectionsInChapter.length > 0 && sectionsInChapter.every(s => selectedSections.has(s.id));
  const canGenerateChapter = (selectedSections?.size ?? 0) >= 1; // Changed to 1 to allow generation from single section
  const hasSelection = (selectedSections?.size ?? 0) > 0;

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ChapterBuildContextPreviewDialog 
        chapter={chapter}
        selectedSectionIds={selectedSections}
        isOpen={isSummaryDialogOpen}
        onOpenChange={setIsSummaryDialogOpen}
      />
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
              <span className="font-semibold truncate p-0 h-auto flex-1 text-left min-w-0">
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
                <Button onClick={onCancelBuildMode} variant="secondary" className="flex-1">
                  <XCircle className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button onClick={() => setIsSummaryDialogOpen(true)} variant="outline" className="flex-1" disabled={!hasSelection}>
                  <Eye className="mr-2 h-4 w-4" /> Preview Context
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-full flex-1">
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
                    {!canGenerateChapter && <TooltipContent>Please select at least 1 section to generate a chapter.</TooltipContent>}
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
