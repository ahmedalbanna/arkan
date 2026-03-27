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
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionAccordionItem } from "./SectionAccordionItem";
import { SortableChapterItem } from "./SortableChapterItem";

interface GenerationToolsProps {
  activeSectionId: string | null;
  activeChapterId?: string | null;
  onActiveSectionChange: (sectionId: string | null) => void;
  onActiveChapterChange?: (chapterId: string | null) => void;
}

export default function GenerationTools({
  activeSectionId,
  activeChapterId,
  onActiveSectionChange,
  onActiveChapterChange,
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

  const handleActivateChapter = (chapterId: string) => {
    onActiveChapterChange?.(chapterId);
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
      <div className="flex flex-col h-full space-y-6">
        <div className="space-y-1.5 px-4 pt-4">
          <h4 className="text-sm font-semibold tracking-tight">{t('builder.reportGenerator.toolsTitle')}</h4>
          <p className="text-[11px] text-muted-foreground italic leading-relaxed">{t('builder.reportGenerator.toolsDesc')}</p>
        </div>

        <div className="flex-grow flex flex-col min-h-0 px-4">
          <div className="flex gap-2 mb-6">
            <Button onClick={handleAddChapter} variant="outline" size="sm" className="w-full font-bold h-9 border-dashed hover:border-primary/40 hover:bg-primary/5 transition-all">
              <PlusCircle className="me-2 h-4 w-4 text-primary" /> Add Chapter
            </Button>
          </div>
          
          <div className="relative flex-grow flex flex-col min-h-0">
            {isProjectBuildMode && (
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl border bg-primary/[0.03] border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300">
                <Checkbox
                  id="select-all-chapters"
                  checked={isAllSelected}
                  onCheckedChange={(checked: any) => toggleSelectAll(!!checked)}
                  aria-checked={isIndeterminate ? 'mixed' : isAllSelected}
                  className="h-4 w-4"
                />
                <Label htmlFor="select-all-chapters" className="font-bold text-[10px] uppercase tracking-widest text-primary/80">Select all for build</Label>
              </div>
            )}
            
            <ScrollArea className="flex-grow pr-4 -mr-4">
              <div className="h-full pb-20">
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={(project?.content || []).map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="w-full space-y-3">
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
                              onActivate={() => handleActivateChapter(item.id)}
                              isActive={activeChapterId === item.id}
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

            <div className="absolute bottom-4 left-0 right-0 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent flex-shrink-0">
              {isProjectBuildMode ? (
                <div className="flex gap-2">
                  <Button onClick={exitProjectBuildMode} variant="secondary" size="sm" className="flex-1 font-bold h-10 border bg-background/80 backdrop-blur-sm">
                    <XCircle className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="flex-[2] font-bold h-10 shadow-lg shadow-primary/20"
                    onClick={() => setIsBuildProjectDialogOpen(true)}
                    disabled={selectedSectionsForBuild.size === 0 || projectMutation.isPending}
                  >
                    <Building className="mr-2 h-4 w-4" />
                    Build ({selectedSectionsForBuild.size})
                  </Button>
                </div>
              ) : canBuildProject && (
                <Button
                  size="sm"
                  className="w-full font-bold h-10 shadow-lg shadow-primary/10"
                  onClick={enterProjectBuildMode}
                  disabled={projectMutation.isPending}
                >
                  <Building className="mr-2 h-4 w-4" />
                  Build Project
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
