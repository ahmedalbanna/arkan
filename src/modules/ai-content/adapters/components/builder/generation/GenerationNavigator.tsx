'use client';

import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building, ChevronRight, PlusCircle, Sparkles, XCircle, Zap } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/context/LocalizationContext';
import { useReportGenerationTools } from '@/modules/ai-content/adapters/hooks/report-mode/use-report-generation-tools';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { BuildProjectDialog } from '@/modules/ai-content/adapters/components/report-mode/dialogs/BuildProjectDialog';
import { SidebarContainer } from '../layout/SidebarContainer';
import { GenerationNodeItem } from './GenerationNodeItem';

/**
 * GenerationNavigator — Primary control hub for AI-driven project assembly.
 * Manages the document structure from an AI-orchestration perspective.
 */

interface GenerationNavigatorProps {
  selectedSectionIds: string[];
  activeChapterId?: string | null;
  onActiveSectionChange: (sectionId: string | null, multiSelect?: boolean) => void;
  onActiveChapterChange?: (chapterId: string | null) => void;
}

export function GenerationNavigator({
  selectedSectionIds,
  activeChapterId,
  onActiveSectionChange,
  onActiveChapterChange,
}: GenerationNavigatorProps) {
  const { t } = useLocalization();
  const {
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
    handleAddSection,
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

  if (!project) return null;

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
        title="AI Generation"
        icon={<Zap className="h-3.5 w-3.5" />}
        actions={
          <Button
            onClick={handleAddChapter}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-primary/60 transition-all hover:bg-primary/10 hover:text-primary hover:scale-110"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        }
      >
        <div className="flex h-full flex-col gap-6">
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium italic leading-relaxed text-muted-foreground/60 uppercase tracking-wider">
              Orchestrate the AI assembly of your project.
            </p>
          </div>

          <AnimatePresence initial={false}>
            {isProjectBuildMode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 shadow-[0_8px_32px_rgba(var(--primary),0.12)] backdrop-blur-xl ring-1 ring-inset ring-white/10">
                  <div className="relative">
                    <Checkbox
                      id="select-all-nodes"
                      checked={isAllSelected}
                      onCheckedChange={(checked: boolean) => toggleSelectAll(!!checked)}
                      aria-checked={isIndeterminate ? 'mixed' : isAllSelected}
                      className="h-4.5 w-4.5 rounded-md border-primary/40 data-[state=checked]:bg-primary"
                    />
                    <Sparkles className="absolute -right-2 -top-2 h-3 w-3 text-primary animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <Label
                      htmlFor="select-all-nodes"
                      className="cursor-pointer text-[10px] font-black uppercase tracking-[0.15em] text-primary"
                    >
                      Selection Mode
                    </Label>
                    <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-primary/50 tabular-nums">
                      {selectedSectionsForBuild.size} / {totalSelectableSections} Selected
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ScrollArea className="flex-1 min-h-0 pr-1">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={(project.content || []).map((contentItem) => contentItem.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {(project.content || []).map((item, index) => {
                    const isChapter = item instanceof Chapter;
                    const isActive = isChapter ? activeChapterId === item.id : selectedSectionIds.includes(item.id);
                    
                    return (
                      <div key={item.id} className="space-y-2">
                        <GenerationNodeItem
                          id={item.id}
                          index={index}
                          title={item.title}
                          isActive={isActive}
                          level={0}
                          isSelectionMode={isProjectBuildMode}
                          isSelected={isChapter 
                            ? (item.sections.length > 0 && item.sections.every(s => selectedSectionsForBuild.has(s.id))) 
                            : selectedSectionsForBuild.has(item.id)}
                          onActivate={(id) => isChapter ? onActiveChapterChange?.(id) : onActiveSectionChange(id)}
                          onToggleSelection={(id) => isChapter 
                            ? toggleChapterSelection(id, !(item.sections.every(s => selectedSectionsForBuild.has(s.id))))
                            : toggleSectionSelection(id)}
                        />
                        
                        {isChapter && (
                          <div className="pl-4 space-y-2 relative">
                            {/* Depth architecture line */}
                            <div className="absolute left-2 top-0 bottom-4 w-px bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
                            
                            {item.sections.map((section, sIdx) => (
                              <GenerationNodeItem
                                key={section.id}
                                id={section.id}
                                index={sIdx}
                                labelIndex={`${index + 1}.${sIdx + 1}`}
                                title={section.title}
                                level={1}
                                isActive={selectedSectionIds.includes(section.id)}
                                isSelectionMode={isProjectBuildMode}
                                isSelected={selectedSectionsForBuild.has(section.id)}
                                onActivate={onActiveSectionChange}
                                onToggleSelection={toggleSectionSelection}
                              />
                            ))}
                            
                            {!isProjectBuildMode && (
                              <button
                                onClick={() => handleAddSection(item.id)}
                                className="ml-4 w-[calc(100%-1rem)] h-8 flex items-center gap-2 px-3 rounded-xl border border-dashed border-primary/10 bg-primary/[0.01] hover:bg-primary/[0.03] transition-all group/add"
                              >
                                <PlusCircle className="h-3.5 w-3.5 text-primary/30 group-hover/add:text-primary/60 transition-colors" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/30 group-hover/add:text-primary/60 transition-colors">
                                  Integrate Section
                                </span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
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
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex w-full gap-2.5"
                >
                  <Button
                    onClick={exitProjectBuildMode}
                    variant="secondary"
                    className="h-12 flex-1 rounded-2xl border border-primary/10 bg-background/60 font-black uppercase tracking-widest text-[9px] backdrop-blur-xl transition-all hover:bg-red-500/5 hover:text-red-600 hover:border-red-500/20"
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Terminate
                  </Button>
                  <Button
                    className="h-12 flex-[2] rounded-2xl bg-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:opacity-90 ring-1 ring-inset ring-white/20"
                    onClick={() => setIsBuildProjectDialogOpen(true)}
                    disabled={selectedSectionsForBuild.size === 0 || projectMutation.isPending}
                  >
                    <Building className="mr-2.5 h-4 w-4" />
                    Generate Selected ({selectedSectionsForBuild.size})
                    <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              ) : (
                canBuildProject && (
                  <motion.div
                    key="standard-actions"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full"
                  >
                    <Button
                      size="lg"
                      className="h-12 w-full rounded-2xl bg-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/10 transition-all hover:shadow-primary/30 group/assemble ring-1 ring-inset ring-white/10"
                      onClick={enterProjectBuildMode}
                      disabled={projectMutation.isPending}
                    >
                      <Building className="mr-2.5 h-4 w-4 transition-transform group-hover/assemble:scale-110" />
                      Generate Project
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
