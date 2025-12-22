
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBuilderStore } from '@/hooks';
import type { Chapter } from '@/lib/models';
import { useSortable } from '@dnd-kit/sortable';
import {
  GripVertical,
  PlusCircle,
  Trash2
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { SortableSectionItem } from './SortableSectionItem';


interface SortableChapterItemProps {
  chapter: Chapter;
  index: number;
  onAddSection: (chapterId: string) => void;
  onDeleteSection: (chapterId: string, sectionId: string) => void;
  onDeleteChapter: (chapterId: string) => void;
  chapterIndex: number;
  onGenerateSection: (sectionId: string) => void;
  activeMutationKey: string | null;
  isAnythingGenerating: boolean;
  hasCreditsForSingleSection: boolean;
}

export function SortableChapterItem({
  chapter,
  index,
  onAddSection,
  onDeleteSection,
  onDeleteChapter,
  ...props
}: SortableChapterItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id });
  const { updateProject } = useBuilderStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(chapter.title);

  useEffect(() => {
    setEditedTitle(chapter.title);
  }, [chapter.title]);

  function handleTitleSave() {
    if (editedTitle.trim() && editedTitle !== chapter.title) {
        updateProject(p => p.updateChapter(chapter.id, c => c.with({ title: editedTitle.trim() })));
    }
    setIsEditing(false);
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditedTitle(chapter.title);
      setIsEditing(false);
    }
  };

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 2 : 0,
    position: 'relative',
  };

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
              {isEditing ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto bg-transparent truncate"
                />
              ) : (
                <span onDoubleClick={() => setIsEditing(true)} className="font-semibold truncate p-0 h-auto">
                  {chapter.title}
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Trash2 className="h-4 w-4 text-destructive/70" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Chapter?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the chapter "{chapter.title}" and all of its sections? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteChapter(chapter.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <AccordionContent>
          <div className="border-t px-4 py-4 space-y-4">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {chapter.sections.map((section, sectionIndex) => (
                <SortableSectionItem
                  key={section.id}
                  section={section}
                  index={sectionIndex}
                  chapterIndex={props.chapterIndex}
                  onDelete={() => onDeleteSection(chapter.id, section.id)}
                  onGenerate={() => props.onGenerateSection(section.id)}
                  isGenerating={props.activeMutationKey === section.id}
                  isAnythingGenerating={props.isAnythingGenerating}
                  hasCredits={props.hasCreditsForSingleSection}
                />
              ))}
            </Accordion>
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
