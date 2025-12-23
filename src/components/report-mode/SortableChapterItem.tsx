
'use client';

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import type { Chapter, Project, Section } from '@/lib/models';
import { useSortable } from '@dnd-kit/sortable';
import {
  GripVertical,
  PlusCircle,
  Sparkles,
  XCircle,
  Construction,
  Eye,
  FileText,
  LinkIcon,
  StickyNote,
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
import { useBuilderStore } from "@/hooks";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

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

function ChapterBuildContextPreviewDialog({ project, chapter, selectedSectionIds, isOpen, onOpenChange }: { project: Project | null, chapter: Chapter, selectedSectionIds: Set<string>, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const sectionsToPreview = chapter.sections.filter(s => selectedSectionIds.has(s.id));

  const getContextNames = (section: Section) => {
    if (!project) return [];
    const sectionContexts = Object.keys(section.context?.sections || {})
      .filter(key => section.context.sections[key])
      .map(key => project.getSection(key)?.title)
      .filter(Boolean);

    const fileContexts = Object.keys(section.context?.externalContext || {})
      .filter(key => section.context.externalContext[key])
      .map(key => project.externalContext.find(f => f.id === key)?.fileName)
      .filter(Boolean);

    return [...sectionContexts, ...fileContexts];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Generation Plan Preview: {chapter.title}</DialogTitle>
          <DialogDescription>
            This is the plan the AI will follow to generate your chapter based on the selected sections.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-hidden border rounded-md">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {sectionsToPreview.map(section => (
                <Card key={section.id} className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="space-y-1">
                      <h4 className="font-semibold flex items-center gap-2"><StickyNote className="w-4 h-4"/>Base Prompt</h4>
                      <p className="text-muted-foreground p-2 border bg-background rounded-md text-xs italic">"{section.prompt}"</p>
                    </div>
                     <div className="space-y-1">
                      <h4 className="font-semibold">Instructions & Guidelines</h4>
                       <p className="text-muted-foreground p-2 border bg-background rounded-md text-xs italic">
                        "{section.buildInstructionText()}"
                        {section.guidelines && section.guidelines.length > 0 && ` Additional guidelines: ${section.guidelines.join(', ')}`}
                      </p>
                    </div>
                    <div className="space-y-1">
                       <h4 className="font-semibold flex items-center gap-2"><LinkIcon className="w-4 h-4"/>Selected Context</h4>
                       {getContextNames(section).length > 0 ? (
                         <div className="flex flex-wrap gap-1">
                          {getContextNames(section).map(name => <Badge variant="secondary" key={name}>{name}</Badge>)}
                         </div>
                       ) : (
                         <p className="text-muted-foreground text-xs italic">No specific context selected for this section.</p>
                       )}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
  const { project } = useBuilderStore();
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
        project={project}
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
                  <Eye className="mr-2 h-4 w-4" /> Preview Plan
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
