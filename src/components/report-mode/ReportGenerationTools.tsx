
'use client';

import {
  Accordion
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Sparkles,
  Building,
  XCircle,
} from 'lucide-react';
import { GenerateTocDialog } from './GenerateTocDialog';
import { SortableChapterItem } from './SortableChapterItem';
import { ScrollArea } from "../ui/scroll-area";
import { ReportTemplateDialog } from "./ReportTemplateDialog";
import { BuildProjectDialog } from "./BuildProjectDialog";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";


export function GenerationTools() {
  const {
    t,
    project,
    sectionMutation,
    chapterMutation,
    userProfile,
    newChapterTitle,
    setNewChapterTitle,
    showTocInput,
    setShowTocInput,
    isGenerateTocOpen,
    setIsGenerateTocOpen,
    onGenerateSection,
    onGenerateChapter,
    handleAddChapter,
    handleAddSection,
    handleCreateFromToc,
    handleDragEnd,
    selectedSectionsForChapterGen,
    handleSectionSelectionToggle,
    handleSelectAllSectionsInChapter,
    chapterInBuildMode,
    handleEnterBuildMode,
    handleCancelBuildMode,
    isTemplateDialogOpen,
    setIsTemplateDialogOpen,
    selectedChaptersForProjectGen,
    handleChapterSelectionToggle,
    isBuildProjectDialogOpen,
    setIsBuildProjectDialogOpen,
    onGenerateProject,
    projectMutation,
    // New state and handlers from the hook
    isProjectBuildMode,
    enterProjectBuildMode,
    exitProjectBuildMode,
  } = useReportGenerationTools();

  const handleSelectAllChapters = (checked: boolean) => {
    const allChapterIds = project?.chapters.map(c => c.id) || [];
    allChapterIds.forEach(id => handleChapterSelectionToggle(id, checked));
  };
  
  const isAllChaptersSelected = project && project.chapters.length > 0 && selectedChaptersForProjectGen.size === project.chapters.length;
  const canBuildProject = project && project.chapters.length >= 2;

  return (
    <>
      <GenerateTocDialog isOpen={isGenerateTocOpen} onOpenChange={setIsGenerateTocOpen} />
      <ReportTemplateDialog isOpen={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen} />
      <BuildProjectDialog
        isOpen={isBuildProjectDialogOpen}
        onOpenChange={setIsBuildProjectDialogOpen}
        project={project}
        selectedChapters={Array.from(selectedChaptersForProjectGen)}
        selectedSections={selectedSectionsForChapterGen}
        onGenerateProject={onGenerateProject}
        isLoading={projectMutation.isPending}
      />
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
             <Button onClick={() => setIsTemplateDialogOpen(true)} variant="outline" className="w-full">
              <ListPlus className="me-2 h-4 w-4" /> Apply a Template
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
            {isProjectBuildMode && (
                <div className="flex items-center gap-2 mb-2 p-2 border rounded-md bg-muted/30">
                <Checkbox
                    id="select-all-chapters"
                    checked={isAllChaptersSelected}
                    onCheckedChange={(checked) => handleSelectAllChapters(!!checked)}
                />
                <Label htmlFor="select-all-chapters" className="font-semibold text-sm">Select all chapters for project build</Label>
                </div>
            )}
            <ScrollArea className="flex-grow">
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={(project?.chapters || []).map(c => c.id)} strategy={verticalListSortingStrategy}>
                  <Accordion type="multiple" className="w-full space-y-2">
                    {(project?.chapters || []).map((chapter, chapterIndex) => (
                      <SortableChapterItem
                        chapter={chapter}
                        index={chapterIndex}
                        key={chapter.id}
                        isProjectSelected={selectedChaptersForProjectGen.has(chapter.id)}
                        onProjectSelectToggle={() => handleChapterSelectionToggle(chapter.id)}
                        isProjectBuildMode={isProjectBuildMode}
                        onAddSection={handleAddSection}
                        onGenerateSection={onGenerateSection}
                        onGenerateChapter={onGenerateChapter}
                        activeMutationKey={sectionMutation.isPending ? sectionMutation.variables as string : null}
                        isAnythingGenerating={sectionMutation.isPending || chapterMutation.isPending}
                        hasCreditsForSingleSection={!!userProfile && userProfile.credits !== undefined && userProfile.credits >= 1}
                        selectedSections={selectedSectionsForChapterGen[chapter.id] || new Set()}
                        onSectionSelect={(sectionId) => handleSectionSelectionToggle(chapter.id, sectionId)}
                        onSelectAll={(select) => handleSelectAllSectionsInChapter(chapter.id, select)}
                        isBuildMode={chapterInBuildMode === chapter.id}
                        onEnterBuildMode={() => handleEnterBuildMode(chapter.id)}
                        onCancelBuildMode={handleCancelBuildMode}
                      />
                    ))}
                  </Accordion>
                </SortableContext>
              </DndContext>
            </ScrollArea>
             <div className="mt-4">
                {isProjectBuildMode ? (
                    <div className="flex gap-2">
                        <Button onClick={exitProjectBuildMode} variant="secondary" className="w-full">
                            <XCircle className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                         <Button 
                            className="w-full" 
                            onClick={() => setIsBuildProjectDialogOpen(true)}
                            disabled={selectedChaptersForProjectGen.size === 0 || projectMutation.isPending}
                        >
                            <Building className="mr-2 h-4 w-4" />
                            Build Project ({selectedChaptersForProjectGen.size} selected)
                        </Button>
                    </div>
                ) : canBuildProject && (
                    <Button 
                        className="w-full" 
                        onClick={enterProjectBuildMode}
                        disabled={projectMutation.isPending}
                    >
                        <Building className="mr-2 h-4 w-4" />
                        Build Project
                    </Button>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
