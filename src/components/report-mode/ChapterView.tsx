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
import { Chapter } from '@/lib/models';
import { Copy, PlusSquare, Speaker, Square, Trash2, Languages, Wrench } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ChapterToolsDialog } from "./ChapterToolsDialog";
import { useChapterActions } from "@/hooks/report-mode/use-chapter-actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SectionView } from "./SectionView";

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
  const [editedChapterTitle, setEditedChapterTitle] = useState(chapter.title);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const {
    t,
    handleCopy,
    handleDuplicate,
    handleTranslate,
    handleReadAloud,
    isCopied,
    isTranslating,
    isSpeaking,
    isDuplicating,
  } = useChapterActions(chapter);

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

  return (
    <>
      <ChapterToolsDialog
        isOpen={isToolsOpen}
        onOpenChange={setIsToolsOpen}
        chapter={chapter}
      />
      <div
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
          <div className="flex items-center gap-1">
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={handleCopy} disabled={isCopied}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('Copy')}</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={handleDuplicate} disabled={isDuplicating}>
                            <PlusSquare className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('Duplicate')}</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={handleTranslate} disabled={isTranslating}>
                            <Languages className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('Translate')}</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={handleReadAloud}>
                            {isSpeaking ? <Square className="h-4 w-4 text-red-500 fill-current" /> : <Speaker className="h-4 w-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{isSpeaking ? 'Stop' : 'Listen'}</p></TooltipContent>
                </Tooltip>

                <div className="h-6 w-px bg-border mx-1"></div>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setIsToolsOpen(true)}>
                            <Wrench className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Chapter Tools</p></TooltipContent>
                </Tooltip>
                {onDeleteChapter && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Delete Chapter</p></TooltipContent>
                        </Tooltip>
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
            </TooltipProvider>
          </div>
        </div>

        <div className="space-y-6">
          {chapter.sections.map((section, index) => (
            <SectionView
              key={section.id}
              sectionKey={section.id}
              title={section.title}
              content={section.content || ''}
              onUpdate={onUpdateSection}
              onTitleChange={onUpdateSectionTitle}
              onMoveUp={() => onMoveSectionUp(section.id)}
              onMoveDown={() => onMoveSectionDown(section.id)}
              onDelete={() => onDeleteSection(section.id)}
              isFirst={index === 0}
              isLast={index === chapter.sections.length - 1}
            />
          ))}
        </div>
      </div>
    </>
  );
}
