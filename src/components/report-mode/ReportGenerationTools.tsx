
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { toast, useBuilderStore } from '@/hooks';
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
import { CSS } from '@dnd-kit/utilities';
import {
  BookOpenTextIcon,
  GripVertical,
  ListPlus,
  PlusCircle,
  Sparkles,
  Trash2
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { SectionAccordionItem } from './SectionAccordionItem';

import { SectionName } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useGenerationUIStore } from '@/hooks/core/useGenerationUIStore';
import { useSections } from '@/hooks/data/use-sections';
import { generateReportSectionApi } from '@/services/api/reportService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GenerateTocDialog } from './GenerateTocDialog';


interface SortableSectionItemProps {
  section: Section;
  index: number;
  chapterIndex: number;
  onDelete: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isAnythingGenerating: boolean;
  hasCredits: boolean;
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
        {...props}
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
  chapterIndex: number;
  onGenerateSection: (sectionId: string) => void;
  activeMutationKey: string | null;
  isAnythingGenerating: boolean;
  hasCreditsForSingleSection: boolean;
}

function SortableChapterItem({
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
            <SortableContext items={chapter.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
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

export function GenerationTools() {
  const { t, locale } = useLocalization();
  const { project, updateProject } = useBuilderStore(); // Directly use the store
  const { data: sectionConfigs, isFetched: sectionsLoaded } = useSections();
  const { userProfile, refetchUser, firebaseUser } = useAuth();
  const queryClient = useQueryClient();
  const [showTocInput, setShowTocInput] = useState(false);
  const [isGenerateTocOpen, setIsGenerateTocOpen] = useState(false);
  const { contextSelection } = useGenerationUIStore();


  const agentMutation = useMutation({
    mutationKey: ['generateReportSection'], // Static key
    mutationFn: async (sectionId: string) => {
      if (!project || !userProfile || !firebaseUser) throw new Error("Project or user not found.");

      const section = project.getSection(sectionId);
      if (!section) throw new Error("Section not found.");

      const token = await firebaseUser.getIdToken();

      const controls = section.controls;
      const context = contextSelection[sectionId] || {};

      let instructionText = `Please use a ${controls.tone || 'professional'} tone and aim for a word count of approximately ${controls.wordCount || 250} words. The complexity should be ${controls.complexity > 66 ? 'technical' : controls.complexity > 33 ? 'balanced' : 'simple'}.`;
      if (controls.language && controls.language !== 'default') {
        const langMap: Record<string, string> = { en: 'English', ar: 'Arabic', es: 'Spanish', fr: 'French', de: 'German' };
        instructionText += ` The output language must be ${langMap[controls.language] || 'English'}.`;
      }

      const otherSectionsContext: Record<string, string> = {};
      Object.keys(context.sections || {}).forEach(key => {
        if (context.sections[key]) {
          const content = project.getSectionContent(key);
          if (content) {
            otherSectionsContext[key] = content;
          }
        }
      });

      const externalContextFiles = (project.externalContext || []).filter((_, index) => context.externalContext?.[index]);

      const body = {
        flow: 'generate-section',
        sectionToGenerate: section.id as SectionName,
        prompt: section.prompt,
        otherSections: otherSectionsContext,
        externalContext: externalContextFiles,
        guidelines: section.guidelines,
        instructionText,
      };

      const result = await generateReportSectionApi(body, token);

      const content = result?.[section.id] ?? Object.values(result || {})[0] as string | undefined;
      if (!content) {
        toast({ title: 'Generation failed', description: `No content returned for section ${section.id}.`, variant: 'destructive' });
        throw new Error('Empty generation result');
      }

      updateProject(p => p.updateSectionContent(section.id, content));
      refetchUser();
      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['reportSection', variables], data);
    },
    onError: (error: any) => {
      toast({ title: 'Generation error', description: error?.message || 'Failed to generate section', variant: 'destructive' });
    },
  });

  function onGenerateSection(sectionId: SectionName) {
    agentMutation.mutate(sectionId as string);
  };

  const [tocText, setTocText] = useState('');

  function handleAddChapter() {
    updateProject(p => p.addChapter());
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


  function handleCreateFromToc() {
    if (!tocText.trim()) {
      toast({
        title: "Table of Contents is empty",
        description: "Please paste the section titles into the text area.",
        variant: "destructive",
      });
      return;
    }

    const lines = tocText.split('n').map(line => line.trim()).filter(Boolean);
    let chaptersCreated = 0;
    let sectionsCreated = 0;

    updateProject(p => {
      p.chapters = []; // Clear existing chapters
      let currentChapterId: string | null = null;
      let chapterCounter = 1;

      lines.forEach(line => {
        const isChapter = !line.match(/^s*d+.d+/); // If it doesn't look like "1.1", it's a chapter

        if (isChapter) {
          const chapterTitle = line.replace(/^d+.?s*/, '').trim();
          if (chapterTitle) {
            currentChapterId = p.addChapter(chapterTitle);
            chaptersCreated++;
            chapterCounter++;
          }
        } else if (currentChapterId) { // It's a section
          const sectionTitle = line.replace(/^d+.d+.?s*/, '').trim();
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
    setTocText('');
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
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddChapter} variant="default" className="w-full">
              <PlusCircle className="me-2 h-4 w-4" /> Add Chapter
            </Button>
          </div>
          {showTocInput && (
            <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
              <Label htmlFor="toc-master-input">Paste Table of Contents</Label>
              <Textarea
                id="toc-master-input"
                value={tocText}
                onChange={(e) => setTocText(e.target.value)}
                placeholder={"1. Chapter Onen1.1. Section Onen2. Chapter Two..."}
                className="flex-grow resize-none"
                rows={5}
              />
              <div className='flex gap-2'>
                <Button onClick={handleCreateFromToc} size="sm" className="w-full">
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
                  <Accordion type="multiple" className="w-full space-y-4">
                    {(project?.chapters || []).map((chapter, chapterIndex) => (
                      <SortableChapterItem
                        chapter={chapter}
                        index={chapterIndex}
                        key={chapter.id}
                        onAddSection={handleAddSectionToChapter}
                        onDeleteSection={handleDeleteSection}
                        onDeleteChapter={handleDeleteChapter}
                        chapterIndex={chapterIndex}
                        onGenerateSection={onGenerateSection}
                        activeMutationKey={agentMutation.isPending ? agentMutation.variables as string : null}
                        isAnythingGenerating={agentMutation.isPending}
                        hasCreditsForSingleSection={!!userProfile && userProfile.credits !== undefined && userProfile.credits >= 1}
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

