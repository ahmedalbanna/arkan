
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
import { useLocalization } from '@/context/LocalizationContext';
import { Chapter, Section } from '@/lib/models';
import { cn } from '@/lib/utils/cn';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  BookOpenText,
  GripVertical,
  ListPlus,
  PlusCircle,
  Sparkles,
  Trash2,
  Wrench
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { SectionAccordionItem } from './SectionAccordionItem';

import { SectionName } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore, toast } from '@/hooks';
import { useSectionGenerator } from '@/hooks/report-mode/use-section-generator';
import { useSections } from '@/hooks/data/use-sections';
import { GenerateTocDialog } from './GenerateTocDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { ChapterToolsDialog } from './ChapterToolsDialog';


interface SortableSectionItemProps {
  section: Section;
  index: number;
  chapterIndex: number;
  onDelete: () => void;
}

function SortableSectionItem({
  section,
  index,
  chapterIndex,
  onDelete,
  ...props
}: SortableSectionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <SectionAccordionItem
        itemKey={section.id}
        section={section}
        handleProps={{ ...listeners }}
        chapterIndex={chapterIndex}
        index={index}
        onDelete={onDelete}
      />
    </div>
  );
};

interface SortableChapterItemProps {
  chapter: Chapter;
  index: number;
  onAddSection: (chapterId: string) => void;
  onDeleteSection: (chapterId: string, sectionId: string) => void;
  onDeleteChapter: (chapterId: string) => void;
}

function SortableChapterItem({
  chapter,
  index,
  onAddSection,
  onDeleteSection,
  onDeleteChapter,
}: SortableChapterItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id });
  const { updateProject } = useBuilderStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(chapter.title);

  useEffect(() => {
    setEditedTitle(chapter.title);
  }, [chapter.title]);

  function handleTitleSave() {
    if (editedTitle.trim() && editedTitle !== chapter.title) {
      updateProject(p => {
        const chap = p.getChapter(chapter.id);
        if (chap) {
          chap.title = editedTitle.trim();
        }
      });
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
    <>
      <ChapterToolsDialog
        isOpen={isToolsOpen}
        onOpenChange={setIsToolsOpen}
        chapter={chapter}
      />
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
            <div className="flex items-center gap-1">
              {chapter.sections.length > 0 && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsToolsOpen(true)}>
                  <Wrench className="h-4 w-4" />
                </Button>
              )}
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
          </div>
          <AccordionContent>
            <div className="border-t px-4 py-4 space-y-4">
              <Accordion type="single" collapsible className="w-full space-y-2">
                {chapter.sections.map((section, sectionIndex) => (
                  <SortableSectionItem
                    key={section.id}
                    section={section}
                    index={sectionIndex}
                    chapterIndex={index}
                    onDelete={() => onDeleteSection(chapter.id, section.id)}
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
    </>
  );
};

export function GenerationTools() {
  const { t } = useLocalization();
  const { project, updateProject } = useBuilderStore();
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [showTocInput, setShowTocInput] = useState(false);
  const [isGenerateTocOpen, setIsGenerateTocOpen] = useState(false);

  function handleAddChapter() {
    updateProject(p => { p.addChapter(); });
    toast({
      title: "Chapter Created",
      description: `A new untitled chapter has been added.`
    });
  };

  function handleAddSectionToChapter(chapterId: string) {
    updateProject(p => {
      p.addSectionToChapter(chapterId, "New Section");
    });
  };

  function handleDeleteSection(chapterId: string, sectionId: string) {
    updateProject(p => p.removeSection(sectionId));
  };

  function handleDeleteChapter(chapterId: string) {
    updateProject(p => p.removeChapter(chapterId));
  };


  function handleCreateFromToc(tocText: string) {
    if (!tocText.trim()) {
      toast({
        title: "Table of Contents is empty",
        description: "Please paste the section titles into the text area.",
        variant: "destructive",
      });
      return;
    }

    const lines = tocText.split('\n').map(line => line.trim()).filter(Boolean);
    let chaptersCreated = 0;
    let sectionsCreated = 0;

    updateProject(p => {
      p.chapters = []; // Clear existing chapters
      let currentChapterId: string | null = null;

      lines.forEach(line => {
        const isChapter = !line.match(/^\\s*\\d+\\.\\d+/);

        if (isChapter) {
          const chapterTitle = line.replace(/^\\d+\\.?\\s*/, '').trim();
          if (chapterTitle) {
            currentChapterId = p.addChapter(chapterTitle);
            chaptersCreated++;
          }
        } else if (currentChapterId) {
          const sectionTitle = line.replace(/^\\d+\\.\\d+\\.?\\s*/, '').trim();
          if (sectionTitle) {
            p.addCustomSection(currentChapterId, sectionTitle);
            sectionsCreated++;
          }
        }
      });
    });

    toast({
      title: "Structure Created",
      description: `Created ${chaptersCreated} chapters and ${sectionsCreated} sections.`,
    });
    setShowTocInput(false);
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (activeId === overId) return;

    const isChapterDrag = project?.chapters?.some(c => c.id === activeId);

    if (isChapterDrag) {
      if (!project?.chapters?.some(c => c.id === overId)) return;

      updateProject(p => {
        if (!p.chapters) return;
        const oldIndex = p.chapters.findIndex(c => c.id === activeId);
        const newIndex = p.chapters.findIndex(c => c.id === overId);
        p.updateChaptersOrder(arrayMove(p.chapters.map(c => c.id), oldIndex, newIndex));
      });
    } else {
      const activeContainer = project?.chapters?.find(c => c.sections.some(s => s.id === activeId));
      const overContainer = project?.chapters?.find(c => c.sections.some(s => s.id === overId)) || project?.chapters?.find(c => c.id === overId);

      if (!activeContainer || !overContainer) return;

      if (activeContainer.id === overContainer.id) {
        updateProject(p => {
          const chapter = p.getChapter(activeContainer.id);
          if (!chapter) return;
          const oldIndex = chapter.sections.findIndex(s => s.id === activeId);
          const newIndex = chapter.sections.findIndex(s => s.id === overId);
          chapter.sections = arrayMove(chapter.sections, oldIndex, newIndex);
        });
      } else {
        updateProject(p => {
          p.moveSectionToChapter(activeId, activeContainer.id, overContainer.id);
        });
      }
    }
  };


  return (
    <>
      <GenerateTocDialog isOpen={isGenerateTocOpen} onOpenChange={setIsGenerateTocOpen} />
      <Card className={cn("flex flex-col h-full")}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline">{t('builder.reportGenerator.toolsTitle')}</CardTitle>
              <CardDescription>{t('builder.reportGenerator.toolsDesc')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4 min-h-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setShowTocInput(true)} variant="outline" className="w-full">
              <ListPlus className="me-2 h-4 w-4" /> Import from Text
            </Button>
            <Button onClick={() => setIsGenerateTocOpen(true)} variant="outline" className="w-full">
              <Sparkles className="me-2 h-4 w-4" /> Generate with AI
            </Button>
            <Button onClick={handleAddChapter} variant="default" className="w-full">
              <PlusCircle className="me-2 h-4 w-4" /> Add Chapter
            </Button>
          </div>
          {showTocInput && (
            <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
              <Label htmlFor="toc-master-input">Paste Table of Contents</Label>
              <Textarea
                id="toc-master-input"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                placeholder={"1. Chapter One\n1.1. Section One\n2. Chapter Two..."}
                className="flex-grow resize-none"
                rows={5}
              />
              <div className='flex gap-2'>
                <Button onClick={() => handleCreateFromToc(newChapterTitle)} size="sm" className="w-full">
                  <ListPlus className="me-2 h-4 w-4" /> Create Structure
                </Button>
                <Button onClick={() => setShowTocInput(false)} size="sm" variant="secondary" className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="relative flex-grow flex flex-col min-h-0">
            <div className={cn("flex-grow", showTocInput && "border-t pt-4")}>
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={(project?.chapters || []).map(c => c.id)} strategy={verticalListSortingStrategy}>
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {(project?.chapters || []).map((chapter, chapterIndex) => (
                      <SortableChapterItem
                        chapter={chapter}
                        index={chapterIndex}
                        key={chapter.id}
                        onAddSection={handleAddSectionToChapter}
                        onDeleteSection={handleDeleteSection}
                        onDeleteChapter={handleDeleteChapter}
                      />
                    ))}
                  </Accordion>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
