
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


interface SortableChapterItemProps {
  chapter: Chapter;
  index: number;
  chapterIndex: number;
  onGenerateSection: (sectionId: string) => void;
  onGenerateChapter: (chapterId: string) => void; // New prop
  onAddSection: (chapterId: string) => void;
  activeMutationKey: string | null;
  isAnythingGenerating: boolean;
  hasCreditsForSingleSection: boolean;
}

export function SortableChapterItem({
  chapter,
  index,
  onGenerateChapter, // Destructure new prop
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

  const handleDeleteSection = (chapterId: string, sectionId: string) => {
    updateProject(p => p.removeSection(sectionId));
  }

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
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={() => onGenerateChapter(chapter.id)}
            disabled={props.isAnythingGenerating}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Chapter
          </Button>
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
                  onDelete={() => handleDeleteSection(chapter.id, section.id)}
                  onGenerate={() => props.onGenerateSection(section.id)}
                  isGenerating={props.activeMutationKey === section.id}
                  isAnythingGenerating={props.isAnythingGenerating}
                  hasCredits={props.hasCreditsForSingleSection}
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
