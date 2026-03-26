'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useReportGenerationTools } from '@/modules/ai-content/adapters/hooks/report-mode/use-report-generation-tools';
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
  PlusCircle,
  XCircle,
} from 'lucide-react';
import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BuildProjectDialog } from "../dialogs/BuildProjectDialog";
import { Chapter, Section } from '@/infrastructure/utils/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionAccordionItem } from "./SectionAccordionItem";
import { SortableChapterItem } from "./SortableChapterItem";

interface GenerationToolsProps {
  activeSectionId: string | null;
  onActiveSectionChange: (sectionId: string | null) => void;
}

export default function GenerationTools({
  activeSectionId,
  onActiveSectionChange,
}: GenerationToolsProps) {
  const {
    t,
    handleDragEnd,
    isBuildProjectDialogOpen,
    setIsBuildProjectDialogOpen,
    project,
    isProjectBuildMode,
    enterProjectBuildMode,
    exitProjectBuildMode,
    selectedSectionsForBuild,
    toggleChapterSelection,
    toggleSectionSelection,
    toggleSelectAll,
    onGenerateProject,
    projectMutation,
    chaptersToBuild,
    handleAddChapter,
  } = useReportGenerationTools();

  const totalSelectableSections = project?.sections.length || 0;
  const isAllSelected = useMemo(() => totalSelectableSections > 0 && selectedSectionsForBuild.size === totalSelectableSections, [totalSelectableSections, selectedSectionsForBuild]);
  const isIndeterminate = useMemo(() => selectedSectionsForBuild.size > 0 && !isAllSelected, [selectedSectionsForBuild, isAllSelected]);

  const canBuildProject = project && project.content.length > 0;

  const handleActivateSection = (sectionId: string) => {
    onActiveSectionChange(sectionId);
  };

  return (
    <>
      <BuildProjectDialog
        isOpen={isBuildProjectDialogOpen}
        onOpenChange={setIsBuildProjectDialogOpen}
        chaptersToBuild={chaptersToBuild}
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
          <div className="flex gap-2">
            <Button onClick={handleAddChapter} variant="default" className="w-full">
              <PlusCircle className="me-2 h-4 w-4" /> Add Chapter
            </Button>
          </div>
          
          <div className="relative flex-grow flex flex-col min-h-0">
            {isProjectBuildMode && (
              <div className="flex items-center gap-2 mb-2 p-2 border rounded-md bg-muted/30">
                <Checkbox
                  id="select-all-chapters"
                  checked={isAllSelected}
                  onCheckedChange={(checked: any) => toggleSelectAll(!!checked)}
                  aria-checked={isIndeterminate ? 'mixed' : isAllSelected}
                />
                <Label htmlFor="select-all-chapters" className="font-semibold text-sm">Select all sections for project build</Label>
              </div>
            )}
            <ScrollArea className="flex-grow">
              <div className="h-full pr-4 -mr-4">
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={(project?.content || []).map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="w-full space-y-2">
                      {(project?.content || []).map((item, index) => {
                        if (item instanceof Chapter) {
                          return (
                            <SortableChapterItem
                              chapter={item}
                              index={index}
                              key={item.id}
                              isProjectBuildMode={isProjectBuildMode}
                              selectedSectionsForBuild={selectedSectionsForBuild}
                              toggleChapterSelection={toggleChapterSelection}
                              toggleSectionSelection={toggleSectionSelection}
                              activeSectionId={activeSectionId}
                              onActivateSection={handleActivateSection}
                            />
                          )
                        }
                        if (item instanceof Section) {
                          return (
                            <SectionAccordionItem
                              key={item.id}
                              section={item}
                              sectionIndex={index}
                              chapterIndex={-1}
                              isProjectBuildMode={isProjectBuildMode}
                              isSelected={selectedSectionsForBuild.has(item.id)}
                              toggleSectionSelection={toggleSectionSelection}
                              isActive={activeSectionId === item.id}
                              onActivate={handleActivateSection}
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
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
