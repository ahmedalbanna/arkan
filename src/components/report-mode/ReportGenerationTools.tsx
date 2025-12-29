
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
  Building,
  ListPlus,
  PlusCircle,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useMemo } from "react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { BuildProjectDialog } from "./BuildProjectDialog";
import { GenerateTocDialog } from './GenerateTocDialog';
import { ReportTemplateDialog } from "./ReportTemplateDialog";
import { SortableChapterItem } from './SortableChapterItem';
import { Chapter, Section } from '@/lib/models';
import { SortableSectionItem } from './SortableSectionItem';
import { ScrollArea } from "../ui/scroll-area";


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
    chapterInBuildMode,
    handleEnterBuildMode,
    handleCancelBuildMode,
    isTemplateDialogOpen,
    setIsTemplateDialogOpen,
    selectedSectionsForBuild,
    handleSectionSelectionToggle,
    handleChapterSelectionToggle,
    handleSelectAllChapters,
    isBuildProjectDialogOpen,
    setIsBuildProjectDialogOpen,
    onGenerateProject,
    projectMutation,
    isProjectBuildMode,
    enterProjectBuildMode,
    exitProjectBuildMode,
    finalProjectPrompt,
  } = useReportGenerationTools();

  const totalSelectableSections = project?.content.length || 0;
  const isAllSelected = useMemo(() => totalSelectableSections > 0 && selectedSectionsForBuild.size === totalSelectableSections, [totalSelectableSections, selectedSectionsForBuild]);
  const isIndeterminate = useMemo(() => selectedSectionsForBuild.size > 0 && !isAllSelected, [selectedSectionsForBuild, isAllSelected]);

  const canBuildProject = project && project.content.length > 0;

  return (
    <>
      <GenerateTocDialog isOpen={isGenerateTocOpen} onOpenChange={setIsGenerateTocOpen} />
      <ReportTemplateDialog isOpen={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen} />
      <BuildProjectDialog
        isOpen={isBuildProjectDialogOpen}
        onOpenChange={setIsBuildProjectDialogOpen}
        project={project}
        selectedSections={selectedSectionsForBuild}
        finalProjectPrompt={finalProjectPrompt}
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
                  checked={isAllSelected}
                  onCheckedChange={(checked) => handleSelectAllChapters(!!checked)}
                  aria-checked={isIndeterminate ? 'mixed' : isAllSelected}
                />
                <Label htmlFor="select-all-chapters" className="font-semibold text-sm">Select all sections for project build</Label>
              </div>
            )}
            <ScrollArea className="flex-grow">
              <div className="h-full pr-4">
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={(project?.content || []).map(c => typeof c === 'string' ? c : c.id)} strategy={verticalListSortingStrategy}>
                    <Accordion type="multiple" className="w-full space-y-2">
                      {(project?.content || []).map((item, index) => {
                        if (item instanceof Chapter) {
                          return (
                            <SortableChapterItem
                              chapter={item}
                              index={index}
                              key={item.id}
                              onAddSection={handleAddSection}
                              onGenerateSection={onGenerateSection}
                              onGenerateChapter={onGenerateChapter}
                              activeMutationKey={sectionMutation.isPending ? sectionMutation.variables as string : null}
                              isAnythingGenerating={sectionMutation.isPending || chapterMutation.isPending}
                              hasCreditsForSingleSection={!!userProfile && userProfile.credits !== undefined && userProfile.credits >= 1}
                              isBuildMode={chapterInBuildMode === item.id}
                              onEnterBuildMode={() => handleEnterBuildMode(item.id)}
                              onCancelBuildMode={handleCancelBuildMode}
                              isProjectBuildMode={isProjectBuildMode}
                              selectedSections={selectedSectionsForBuild}
                              onSectionSelectToggle={handleSectionSelectionToggle}
                              onChapterSelectToggle={handleChapterSelectionToggle}
                            />
                          )
                        }
                        if (item instanceof Section) {
                          return (
                            <SortableSectionItem
                              key={item.id}
                              section={item}
                              index={index}
                              chapterIndex={-1} // Indicate it's a root section
                              onGenerate={() => onGenerateSection(item.id)}
                              isGenerating={sectionMutation.isPending && sectionMutation.variables === item.id}
                              isAnythingGenerating={sectionMutation.isPending || chapterMutation.isPending}
                              hasCredits={!!userProfile && userProfile.credits !== undefined && userProfile.credits >= 1}
                              isSelected={selectedSectionsForBuild.has(item.id)}
                              onSelect={() => handleSectionSelectionToggle(item.id)}
                              isCheckboxVisible={isProjectBuildMode}
                            />
                          );
                        }
                        return null; // For strings or other types in the future
                      })}
                    </Accordion>
                  </SortableContext>
                </DndContext>
              </div>
            </ScrollArea>
            <div className="mt-4 flex-shrink-0">
              {isProjectBuildMode ? (
                <div className="flex gap-2">
                  <Button onClick={exitProjectBuildMode} variant="secondary" className="w-full">
                    <XCircle className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => setIsBuildProjectDialogOpen(true)}
                    disabled={selectedSectionsForBuild.size === 0 || projectMutation.isPending}
                  >
                    <Building className="mr-2 h-4 w-4" />
                    Build Project ({selectedSectionsForBuild.size} selected)
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
      </Card >
    </>
  );
}
