'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReportGenerationTools } from '@/modules/ai-content/adapters/hooks/report-mode/use-report-generation-tools';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { Building, ChevronRight, PlusCircle, Sparkles, XCircle, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { BuildProjectDialog } from '../dialogs/BuildProjectDialog';
import { SidebarContainer } from '../../builder/layout/SidebarContainer';
import { SectionAccordionItem } from './SectionAccordionItem';
import { SortableChapterItem } from './SortableChapterItem';

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
  const isAllSelected = useMemo(
    () => totalSelectableSections > 0 && selectedSectionsForBuild.size === totalSelectableSections,
    [totalSelectableSections, selectedSectionsForBuild]
  );
  const isIndeterminate = useMemo(
    () => selectedSectionsForBuild.size > 0 && !isAllSelected,
    [selectedSectionsForBuild, isAllSelected]
  );

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

      <SidebarContainer
        title={t('builder.reportGenerator.toolsTitle')}
        icon={<Zap className="h-3 w-3" />}
        actions={
          <Button
            onClick={handleAddChapter}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-primary transition-colors hover:bg-primary/5"
            aria-label={t('builder.buttons.newSession')}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        }
      >
        <div className="flex h-full flex-col gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-medium italic leading-relaxed text-muted-foreground/90">
              {t('builder.reportGenerator.toolsDesc')}
            </p>
          </div>

          <AnimatePresence initial={false}>
            {isProjectBuildMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/[0.05] p-4 shadow-[0_8px_24px_rgba(var(--primary),0.08)] backdrop-blur-xl">
                  <div className="relative">
                    <Checkbox
                      id="select-all-chapters"
                      checked={isAllSelected}
                      onCheckedChange={(checked: boolean) => toggleSelectAll(!!checked)}
                      aria-checked={isIndeterminate ? 'mixed' : isAllSelected}
                      className="h-4.5 w-4.5 rounded-md border-primary/40 data-[state=checked]:bg-primary"
                    />
                    <Sparkles className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 text-primary/80" />
                  </div>
                  <div className="flex flex-col">
                    <Label
                      htmlFor="select-all-chapters"
                      className="cursor-pointer text-[10px] font-black uppercase tracking-[0.15em] text-primary"
                    >
                      Manifest Selection Mode
                    </Label>
                    <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-primary/60">
                      {selectedSectionsForBuild.size} / {totalSelectableSections} Sections Prepared
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ScrollArea className="flex-1 min-h-0 pr-1">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={(project?.content || []).map((contentItem) => contentItem.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
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
                      );
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
          </ScrollArea>

          <div className="pt-2">
            <AnimatePresence mode="wait">
              {isProjectBuildMode ? (
                <motion.div
                  key="build-mode-actions"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="flex w-full gap-2"
                >
                  <Button
                    onClick={exitProjectBuildMode}
                    variant="secondary"
                    size="sm"
                    className="h-11 flex-1 rounded-xl border border-border/40 bg-background/60 font-black uppercase tracking-widest text-[9px] backdrop-blur-xl transition-all hover:bg-muted/80"
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Terminate
                  </Button>
                  <Button
                    size="sm"
                    className="h-11 flex-[2] rounded-xl bg-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_10px_28px_rgba(var(--primary),0.18)] transition-all hover:opacity-90"
                    onClick={() => setIsBuildProjectDialogOpen(true)}
                    disabled={selectedSectionsForBuild.size === 0 || projectMutation.isPending}
                  >
                    <Building className="mr-2 h-4 w-4" />
                    Execute Build ({selectedSectionsForBuild.size})
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </motion.div>
              ) : (
                canBuildProject && (
                  <motion.div
                    key="standard-actions"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                  >
                    <Button
                      size="sm"
                      className="h-11 w-full rounded-xl bg-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_10px_24px_rgba(var(--primary),0.12)] transition-all hover:shadow-primary/30"
                      onClick={enterProjectBuildMode}
                      disabled={projectMutation.isPending}
                    >
                      <Building className="mr-2 h-4 w-4" />
                      Assemble Project Manifest
                    </Button>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </div>
      </SidebarContainer>
    </>
  );
}
