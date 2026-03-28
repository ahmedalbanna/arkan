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
  ChevronRight,
  Layers,
  PlusCircle,
  Sparkles,
  XCircle,
  Zap,
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
import { AnimatePresence, motion } from 'framer-motion';

interface GenerationToolsProps {
  selectedSectionIds: string[];
  activeChapterId?: string | null;
  onActiveSectionChange: (sectionId: string | null, multiSelect?: boolean) => void;
  onActiveChapterChange?: (chapterId: string | null) => void;
}

export default function GenerationTools({
  selectedSectionIds,
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

  const handleActivateSection = (sectionId: string, multiSelect?: boolean) => {
    onActiveSectionChange(sectionId, multiSelect);
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
      <div className="flex flex-col h-full overflow-hidden bg-background/50">
        <header className="space-y-4 px-6 pt-6 pb-4 border-b border-border/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity duration-700">
            <Layers className="h-16 w-16" />
          </div>

          <div className="flex flex-col space-y-1 relative z-10">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Zap className="h-3 w-3" />
              {t('builder.reportGenerator.toolsTitle')}
            </h4>
            <p className="text-[10px] text-muted-foreground italic leading-relaxed font-medium opacity-80">
              {t('builder.reportGenerator.toolsDesc')}
            </p>
          </div>

          <Button
            onClick={handleAddChapter}
            variant="outline"
            size="sm"
            className="w-full font-black h-10 border-dashed hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 rounded-xl uppercase tracking-widest text-[9px] relative group overflow-hidden"
          >
            <PlusCircle className="me-2 h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
            Initialize New Chapter
            <motion.div
              className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"
            />
          </Button>
        </header>

        <div className="flex-grow flex flex-col min-h-0 relative">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--border)) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

          <div className="relative z-10 h-full flex flex-col pt-4">
            <AnimatePresence>
              {isProjectBuildMode && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginBottom: 16 }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  className="px-6 overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-4 rounded-2xl border bg-primary/[0.04] border-primary/20 backdrop-blur-xl shadow-[0_4px_20px_rgba(var(--primary),0.1)] ring-1 ring-primary/20 group/build-hud">
                    <div className="relative">
                      <Checkbox
                        id="select-all-chapters"
                        checked={isAllSelected}
                        onCheckedChange={(checked: any) => toggleSelectAll(!!checked)}
                        aria-checked={isIndeterminate ? 'mixed' : isAllSelected}
                        className="h-4.5 w-4.5 rounded-md border-primary/40 data-[state=checked]:bg-primary"
                      />
                      <Sparkles className="absolute -top-1.5 -right-1.5 h-2.5 w-2.5 text-primary opacity-0 group-hover/build-hud:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="select-all-chapters" className="font-black text-[10px] uppercase tracking-[0.15em] text-primary cursor-pointer">
                        Manifest Selection Mode
                      </Label>
                      <span className="text-[8px] font-bold text-primary/60 uppercase tracking-widest mt-0.5">
                        {selectedSectionsForBuild.size} / {totalSelectableSections} Sections Prepared
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <ScrollArea className="flex-grow px-6">
              <div className="pb-32">
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={(project?.content || []).map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="w-full space-y-4">
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
                              activeSectionId={selectedSectionIds.length > 0 ? selectedSectionIds[0] : null}
                              onActivateSection={handleActivateSection}
                              onActivate={() => handleActivateChapter(item.id)}
                              isActive={activeChapterId === item.id}
                              selectedSectionIds={selectedSectionIds}
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
                              isActive={selectedSectionIds.includes(item.id)}
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

            {/* Premium Sticky Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-background via-background/95 to-transparent z-40 pointer-events-none">
              <div className="flex gap-3 pointer-events-auto">
                <AnimatePresence mode="wait">
                  {isProjectBuildMode ? (
                    <motion.div
                      key="build-mode-actions"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="flex gap-2 w-full"
                    >
                      <Button onClick={exitProjectBuildMode} variant="secondary" size="sm" className="flex-1 font-black h-11 border bg-background/60 backdrop-blur-xl rounded-xl uppercase tracking-widest text-[9px] hover:bg-muted/80 transition-all border-border/40">
                        <XCircle className="mr-2 h-4 w-4" /> Terminate
                      </Button>
                      <Button
                        size="sm"
                        className="flex-[2] font-black h-11 shadow-[0_10px_30px_rgba(var(--primary),0.2)] rounded-xl uppercase tracking-[0.2em] text-[10px] bg-primary hover:opacity-90 transition-all relative overflow-hidden group"
                        onClick={() => setIsBuildProjectDialogOpen(true)}
                        disabled={selectedSectionsForBuild.size === 0 || projectMutation.isPending}
                      >
                        <Building className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                        Execute Build ({selectedSectionsForBuild.size})
                        <ChevronRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </Button>
                    </motion.div>
                  ) : canBuildProject && (
                    <motion.div
                      key="standard-actions"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="w-full"
                    >
                      <Button
                        size="sm"
                        className="w-full font-black h-11 shadow-[0_10px_25px_rgba(var(--primary),0.1)] rounded-xl uppercase tracking-[0.2em] text-[10px] bg-primary group relative overflow-hidden transition-all duration-500 hover:shadow-primary/30"
                        onClick={enterProjectBuildMode}
                        disabled={projectMutation.isPending}
                      >
                        <Building className="mr-2 h-4 w-4" />
                        Assemble Project Manifest
                        <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
