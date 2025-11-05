

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { PanelLeftClose, ListPlus, BookCopy, PlusCircle, GripVertical } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { Button } from '../ui/button';
import { useBuilderStore } from '@/hooks';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from '@/hooks';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { SectionAccordionItem } from './SectionAccordionItem';
import { Chapter, Section } from '@/lib/models';
import { ScrollArea } from '../ui/scroll-area';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Loader2 } from 'lucide-react';
import { Input } from '../ui/input';

interface GenerationToolsProps {
  onCollapseToggle: () => void;
  isAnythingGenerating: boolean;
  activeMutationKey: string | null;
  onGenerateSection: (sectionId: string) => void;
  hasCreditsForSingleSection: boolean;
}

const SortableSectionItem = ({
  section,
  index,
  chapterIndex,
  ...props
}: {
  section: Section;
  index: number;
  chapterIndex: number;
  [key: string]: any; // To pass through other props
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as 'relative'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <SectionAccordionItem
        itemKey={section.id}
        section={section}
        handleProps={{ ...listeners }}
        chapterIndex={chapterIndex}
        index={index}
        {...props}
      />
    </div>
  );
};

const SortableChapterItem = ({
    chapter,
    index,
    onAddSection,
    ...props
}: {
    chapter: Chapter;
    index: number;
    onAddSection: (chapterId: string) => void;
    [key: string]: any;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id });

    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition,
        zIndex: isDragging ? 2 : 0,
        position: 'relative' as 'relative',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
             <AccordionItem value={chapter.id} className="bg-muted/30 border rounded-lg">
                <AccordionTrigger className="px-4 py-2 hover:no-underline">
                     <div className="flex items-center gap-2 flex-1">
                        {listeners && (
                            <div {...listeners} className="p-1 cursor-grab touch-none -ml-2 flex items-center gap-1 text-muted-foreground">
                                <span className="text-sm w-4 text-center font-semibold">{index + 1}.</span>
                                <GripVertical className="h-5 w-5" />
                            </div>
                        )}
                        <span className="font-semibold">{chapter.title}</span>
                     </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="border-t px-4 py-4 space-y-4">
                        <SortableContext items={chapter.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                            <Accordion type="single" collapsible className="w-full space-y-2">
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
                                    />
                                ))}
                            </Accordion>
                        </SortableContext>
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


export const GenerationTools = ({
  onCollapseToggle,
  isAnythingGenerating,
  activeMutationKey,
  onGenerateSection,
  hasCreditsForSingleSection,
}: GenerationToolsProps) => {
  const { t } = useLocalization();
  const { project, updateProject } = useBuilderStore();
  const [tocText, setTocText] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');

  const handleAddChapter = () => {
    if(!newChapterTitle.trim()) {
        toast({ title: "Chapter title is required.", variant: "destructive" });
        return;
    }
    updateProject(p => p.addChapter(newChapterTitle));
    setNewChapterTitle('');
  };
  
  const handleAddSectionToChapter = (chapterId: string) => {
      updateProject(p => {
          p.addSectionToChapter(chapterId, "New Section");
      });
  };

  const handleCreateFromToc = () => {
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
        let currentChapterId: string | null = null;

        lines.forEach(line => {
            const chapterMatch = line.match(/^\d+\.\s+(.+)/);
            const sectionMatch = line.match(/^\d+\.\d+\.?\s*(.*)/);

            if (sectionMatch && currentChapterId) {
                const sectionTitle = sectionMatch[1].trim();
                if (sectionTitle) {
                    p.addCustomSection(currentChapterId, sectionTitle);
                    sectionsCreated++;
                }
            } else if (chapterMatch) {
                const chapterTitle = chapterMatch[1].trim();
                if (chapterTitle) {
                    currentChapterId = p.addChapter(chapterTitle);
                    chaptersCreated++;
                }
            }
        });
    });

    toast({
        title: "Structure Created",
        description: `Created ${chaptersCreated} chapters and ${sectionsCreated} sections.`,
    });
    setTocText('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    if (activeId === overId) return;

    const isChapterDrag = project?.chapters.some(c => c.id === activeId);

    if (isChapterDrag) {
        // Handle chapter reordering
        if (!project?.chapters.some(c => c.id === overId)) return;
        
        updateProject(p => {
            if (!p.chapters) return;
            const oldIndex = p.chapters.findIndex(c => c.id === activeId);
            const newIndex = p.chapters.findIndex(c => c.id === overId);
            p.updateChaptersOrder(arrayMove(p.chapters.map(c => c.id), oldIndex, newIndex));
        });
    } else {
        // Handle section reordering (within or between chapters)
        const activeContainer = project?.chapters.find(c => c.sections.some(s => s.id === activeId));
        const overContainer = project?.chapters.find(c => c.sections.some(s => s.id === overId)) || project?.chapters.find(c => c.id === overId);

        if (!activeContainer || !overContainer) return;

        if (activeContainer.id === overContainer.id) {
            // Reordering within the same chapter
            updateProject(p => {
                const chapter = p.getChapter(activeContainer.id);
                if (!chapter) return;
                const oldIndex = chapter.sections.findIndex(s => s.id === activeId);
                const newIndex = chapter.sections.findIndex(s => s.id === overId);
                chapter.sections = arrayMove(chapter.sections, oldIndex, newIndex);
            });
        } else {
            // Moving section to a different chapter
            updateProject(p => {
                p.moveSectionToChapter(activeId, activeContainer.id, overContainer.id);
            });
        }
    }
  };


  return (
    <Card className={cn("flex flex-col h-full")}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="font-headline">{t('builder.reportGenerator.toolsTitle')}</CardTitle>
            <CardDescription>{t('builder.reportGenerator.toolsDesc')}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={onCollapseToggle}>
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4 min-h-0">
          <div className="space-y-2">
             <Label htmlFor="toc-master-input">Table of Contents</Label>
             <Textarea
                  id="toc-master-input"
                  value={tocText}
                  onChange={(e) => setTocText(e.target.value)}
                  placeholder={"1. Chapter One\n1.1. Section One\n2. Chapter Two..."}
                  className="flex-grow resize-none"
                  rows={5}
             />
             <Button onClick={handleCreateFromToc} size="sm" className="w-full">
                  <ListPlus className="me-2 h-4 w-4" /> Create Chapters &amp; Sections
             </Button>
          </div>

          <div className="relative flex-grow flex flex-col min-h-0">
            <div className="flex-grow border-t pt-4">
              <ScrollArea className="h-full -mx-6 px-6">
                  <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={(project?.chapters || []).map(c => c.id)} strategy={verticalListSortingStrategy}>
                        <Accordion type="multiple" className="w-full space-y-4">
                          {(project?.chapters || []).map((chapter, chapterIndex) => (
                            <SortableChapterItem
                                chapter={chapter}
                                index={chapterIndex}
                                key={chapter.id}
                                onAddSection={handleAddSectionToChapter}
                                // Pass down necessary props to the inner list
                                chapterIndex={chapterIndex}
                                onGenerateSection={onGenerateSection}
                                activeMutationKey={activeMutationKey}
                                isAnythingGenerating={isAnythingGenerating}
                                hasCreditsForSingleSection={hasCreditsForSingleSection}
                            />
                          ))}
                        </Accordion>
                      </SortableContext>
                  </DndContext>
              </ScrollArea>
            </div>
          </div>
           <div className="flex gap-2 border-t pt-4">
              <Input
                placeholder="New Chapter Title..."
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChapter())}
              />
              <Button onClick={handleAddChapter} variant="outline"><BookCopy className="me-2 h-4 w-4" /> Add Chapter</Button>
          </div>
      </CardContent>
    </Card>
  );
};
