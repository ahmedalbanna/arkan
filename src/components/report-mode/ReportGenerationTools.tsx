
'use client';

import {
  Accordion
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useReportGenerationTools } from '@/hooks/report-mode/use-report-generation-tools';
import {
  DndContext,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  ListPlus,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import { GenerateTocDialog } from './GenerateTocDialog';
import { SortableChapterItem } from './SortableChapterItem';
import { ScrollArea } from "../ui/scroll-area";


export function GenerationTools() {
  const {
    t,
    project,
    agentMutation,
    userProfile,
    newChapterTitle,
    setNewChapterTitle,
    showTocInput,
    setShowTocInput,
    isGenerateTocOpen,
    setIsGenerateTocOpen,
    onGenerateSection,
    handleAddChapter,
    handleAddSection,
    handleCreateFromToc,
    handleDragEnd,
  } = useReportGenerationTools();


  return (
    <>
      <GenerateTocDialog isOpen={isGenerateTocOpen} onOpenChange={setIsGenerateTocOpen} />
      <Card className="flex flex-col h-full">
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
              <label htmlFor="toc-master-input" className="text-sm font-medium">Paste Table of Contents</label>
              <Textarea
                id="toc-master-input"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                placeholder={"1. Chapter One\n  1.1. Section One\n2. Chapter Two..."}
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
            <ScrollArea className="flex-grow">
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={(project?.chapters || []).map(c => c.id)} strategy={verticalListSortingStrategy}>
                  <Accordion type="multiple" className="w-full space-y-2">
                    {(project?.chapters || []).map((chapter, chapterIndex) => (
                      <SortableChapterItem
                        chapter={chapter}
                        index={chapterIndex}
                        key={chapter.id}
                        onAddSection={handleAddSection}
                        onGenerateSection={onGenerateSection}
                        activeMutationKey={agentMutation.isPending ? agentMutation.variables as string : null}
                        isAnythingGenerating={agentMutation.isPending}
                        hasCreditsForSingleSection={!!userProfile && userProfile.credits !== undefined && userProfile.credits >= 1}
                      />
                    ))}
                  </Accordion>
                </SortableContext>
              </DndContext>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
