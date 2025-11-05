
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
  isAnythingGenerating: boolean;
  activeMutationKey: string | null;
  onGenerateSection: (sectionId: string) => void;
  hasCreditsForSingleSection: boolean;
  onCollapseToggle: () => void;
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
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
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
    ...props
}: {
    chapter: Chapter;
    index: number;
    [key: string]: any;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: chapter.id });

    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition,
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
                        {props.children}
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
  const [tocText, setTocText] = useState<Record<string, string>>({});
  const [newChapterTitle, setNewChapterTitle] = useState('');

  const handleAddChapter = () => {
    if(!newChapterTitle.trim()) {
        toast({ title: "Chapter title is required.", variant: "destructive" });
        return;
    }
    updateProject(p => p.addChapter(newChapterTitle));
    setNewChapterTitle('');
  };

  const handleCreateSectionsFromToc = (chapterId: string) => {
    const text = tocText[chapterId];
    if (!text || !text.trim()) {
      toast({
        title: "Table of Contents is empty",
        description: "Please paste the section titles into the text area.",
        variant: "destructive",
      });
      return;
    }
    const sectionTitles = text.split('\n').map(title => title.trim()).filter(title => title);
    
    updateProject(p => {
        sectionTitles.forEach(title => {
            p.addCustomSection(chapterId, title);
        });
    });

    toast({
      title: "Sections Created",
      description: `${sectionTitles.length} sections have been added to the chapter.`,
    });
    setTocText(prev => ({...prev, [chapterId]: ''}));
  };
  
  const handleAddSection = (chapterId: string) => {
      updateProject(p => p.addSectionToChapter(chapterId));
  }

  const handleSectionDragEnd = (event: DragEndEvent, chapterId: string) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        const chapter = project?.getChapter(chapterId);
        if(!chapter) return;
        const oldIndex = chapter.sections.findIndex((s) => s.id === active.id);
        const newIndex = chapter.sections.findIndex((s) => s.id === over.id);
        const newOrderedIds = arrayMove(chapter.sections.map(s => s.id), oldIndex, newIndex);
        updateProject(p => p.updateSectionsOrder(chapterId, newOrderedIds));
    }
  };
  
  const handleChapterDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && project?.chapters) {
        const oldIndex = project.chapters.findIndex(c => c.id === active.id);
        const newIndex = project.chapters.findIndex(c => c.id === over.id);
        const newOrderIds = arrayMove(project.chapters.map(c => c.id), oldIndex, newIndex);
        updateProject(p => p.updateChaptersOrder(newOrderIds));
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
          <div className="flex gap-2">
              <Input
                placeholder="New Chapter Title..."
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChapter())}
              />
              <Button onClick={handleAddChapter}><BookCopy className="me-2 h-4 w-4" /> Add Chapter</Button>
          </div>
          <ScrollArea className="flex-grow -mx-6 px-6">
              <DndContext collisionDetection={closestCenter} onDragEnd={handleChapterDragEnd}>
                  <SortableContext items={(project?.chapters || []).map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <Accordion type="multiple" className="w-full space-y-4">
                      {(project?.chapters || []).map((chapter, chapterIndex) => (
                        <SortableChapterItem chapter={chapter} index={chapterIndex} key={chapter.id}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                   <Label htmlFor={`toc-input-${chapter.id}`}>Table of Contents</Label>
                                   <Textarea
                                        id={`toc-input-${chapter.id}`}
                                        value={tocText[chapter.id] || ''}
                                        onChange={(e) => setTocText(prev => ({...prev, [chapter.id]: e.target.value}))}
                                        placeholder={"Introduction\nSystem Analysis\n..."}
                                        className="flex-grow resize-none"
                                        rows={3}
                                   />
                                   <Button onClick={() => handleCreateSectionsFromToc(chapter.id)} size="sm" className="w-full">
                                        <ListPlus className="me-2 h-4 w-4" /> Create Sections from List
                                   </Button>
                                </div>

                                 <div className="border-t pt-4 mt-4 space-y-2">
                                    <h4 className="text-sm font-medium">Sections in '{chapter.title}'</h4>
                                    <DndContext collisionDetection={closestCenter} onDragEnd={(e) => handleSectionDragEnd(e, chapter.id)}>
                                        <SortableContext items={chapter.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                            <Accordion type="single" collapsible className="w-full space-y-2">
                                                {chapter.sections.map((section, index) => (
                                                    <SortableSectionItem
                                                        key={section.id}
                                                        section={section}
                                                        index={index}
                                                        chapterIndex={chapterIndex}
                                                        onGenerate={() => onGenerateSection(section.id)}
                                                        isGenerating={activeMutationKey === section.id}
                                                        isAnythingGenerating={isAnythingGenerating}
                                                        hasCredits={hasCreditsForSingleSection}
                                                    />
                                                ))}
                                            </Accordion>
                                        </SortableContext>
                                    </DndContext>
                                     <Button onClick={() => handleAddSection(chapter.id)} variant="outline" className="w-full mt-2">
                                        <PlusCircle className="me-2 h-4 w-4" /> Add Section
                                    </Button>
                                 </div>
                            </div>
                        </SortableChapterItem>
                      ))}
                    </Accordion>
                  </SortableContext>
              </DndContext>
          </ScrollArea>
      </CardContent>
    </Card>
  );
};
