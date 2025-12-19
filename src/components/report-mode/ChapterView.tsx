'use client';

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
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocalization } from '@/context/LocalizationContext';
import { Chapter } from '@/lib/models';
import { cn } from '@/lib/utils/cn';
import { PlusCircle, Trash2, Wrench } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { SectionView } from './SectionView';
import { ChapterToolsDialog } from "./ChapterToolsDialog";

interface ChapterViewProps {
  chapter: Chapter;
  onUpdateSection: (sectionId: string, newContent: string) => void;
  onUpdateSectionTitle: (sectionId: string, newTitle: string) => void;
  onUpdateChapterTitle: (chapterId: string, newTitle: string) => void;
  onAddSection: (chapterId: string, index: number) => void;
  onMoveSectionUp: (sectionId: string) => void;
  onMoveSectionDown: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteChapter: (chapterId: string) => void;
}

export function ChapterView({
  chapter,
  onUpdateSection,
  onUpdateSectionTitle,
  onUpdateChapterTitle,
  onAddSection,
  onMoveSectionUp,
  onMoveSectionDown,
  onDeleteSection,
  onDeleteChapter,
}: ChapterViewProps) {
  const { t } = useLocalization();
  const [editedChapterTitle, setEditedChapterTitle] = useState(chapter.title);
  const [isHovering, setIsHovering] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);


  useEffect(() => {
    setEditedChapterTitle(chapter.title);
  }, [chapter.title]);

  function handleChapterTitleSave() {
    if (editedChapterTitle.trim() && editedChapterTitle !== chapter.title) {
      onUpdateChapterTitle(chapter.id, editedChapterTitle.trim());
    }
  }

  function handleChapterTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.currentTarget.blur();
    }
  }

  const hasSections = chapter.sections && chapter.sections.length > 0;

  return (
    <>
      <ChapterToolsDialog
        isOpen={isToolsOpen}
        onOpenChange={setIsToolsOpen}
        chapter={chapter}
      />
      <div
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="relative"
      >
        <div className="flex items-center gap-4 mb-6">
          <Input
            value={editedChapterTitle}
            onChange={(e) => setEditedChapterTitle(e.target.value)}
            onBlur={handleChapterTitleSave}
            onKeyDown={handleChapterTitleKeyDown}
            className="w-full text-3xl font-bold text-primary font-headline border-0 focus-visible:ring-1 focus-visible:ring-offset-0 p-1 h-auto bg-transparent"
          />
          <div className={cn("flex items-center gap-1 transition-opacity", isHovering ? "opacity-100" : "opacity-0")}>
            <Button variant="outline" size="sm" onClick={() => setIsToolsOpen(true)}>
              <Wrench className="h-4 w-4 mr-2" />
              Chapter Tools
            </Button>
            {onDeleteChapter && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-9 w-9"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this chapter?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this chapter and all of its sections? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDeleteChapter(chapter.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>


        {hasSections ? (
          chapter.sections.map((section, index) => (
            <div key={section.id} className="group relative mb-8 last:mb-0">
              <SectionView
                chapterId={chapter.id}
                sectionKey={section.id}
                title={section.title}
                content={section.content || ''}
                onUpdate={onUpdateSection}
                onTitleChange={onUpdateSectionTitle}
                isFirst={index === 0}
                isLast={index === chapter.sections.length - 1}
                onMoveUp={() => onMoveSectionUp(section.id)}
                onMoveDown={() => onMoveSectionDown(section.id)}
                onDelete={() => onDeleteSection(section.id)}
              />
              <div className="absolute -bottom-4 left-0 right-0 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-full h-px bg-primary/20"></div>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute h-8 w-8 rounded-full bg-background hover:bg-muted"
                  onClick={() => onAddSection(chapter.id, index + 1)}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h3 className="mt-4 text-lg font-semibold text-muted-foreground">This chapter is empty.</h3>
            <p className="text-sm text-muted-foreground mb-4">Add a section to start building your report.</p>
            <Button onClick={() => onAddSection(chapter.id, 0)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add First Section
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
