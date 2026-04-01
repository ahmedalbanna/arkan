'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { useAiActions } from '@/modules/ai-content/adapters/hooks/report-mode/use-ai-actions';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { cn } from '@/infrastructure/utils/cn';
import { Link as LinkIcon, SlidersHorizontal, Sparkles, StickyNote, Square, Copy, ClipboardPaste } from 'lucide-react';
import { useGenerationUIStore } from '@/modules/ai-content/adapters/state/useGenerationUIStore';
import { useToast } from '@/hooks/util/use-toast';
import { SectionContextSelector } from '../section-controls/SectionContextSelector';
import { SectionGenerationControls } from '../section-controls/SectionGenerationControls';
import { GuidelineEditor } from '../section-controls/SectionGuidelineEditor';
import React from 'react';
import { SidebarContainer } from '../layout/SidebarContainer';

interface SectionTabsPanelProps {
  section: Section | null;
  selectedSectionIds?: string[];
  className?: string;
}

export function SectionTabsPanel({ section, selectedSectionIds = [], className }: SectionTabsPanelProps) {
  const { t } = useLocalization();
  const { toast } = useToast();
  const { userProfile, project, updateProject } = useBuilderStore();
  const { isBulkGenerating, requestAbort, abortRequested, cancelGeneration, clipboard, copySettings, bulkTotal, bulkProgress, bulkStartTime } = useGenerationUIStore();
  const { generateSectionMutation, generateChapterMutation, generateProjectMutation } = useAiActions();

  const estimatedRemaining = React.useMemo(() => {
    if (!isBulkGenerating || !bulkStartTime || bulkProgress === 0) return null;

    const elapsed = Date.now() - bulkStartTime;
    const avgTimePerSection = elapsed / bulkProgress;
    const remainingSections = bulkTotal - bulkProgress;
    const remainingMs = avgTimePerSection * remainingSections;

    if (remainingMs <= 0) return null;

    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);

    if (minutes > 0) return `~${minutes}m ${seconds}s left`;
    return `~${seconds}s left`;
  }, [isBulkGenerating, bulkStartTime, bulkProgress, bulkTotal]);

  if (!section) {
    return (
      <SidebarContainer title="Section Inspector" icon={<Sparkles className="h-3 w-3" />}>
        <div className="flex flex-col items-center justify-center space-y-4 text-center py-20">
            <div className="h-12 w-12 rounded-2xl bg-muted/20 flex items-center justify-center border border-border/40">
                <Sparkles className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No Vector Active</h4>
                <p className="text-[11px] text-muted-foreground/60 italic leading-relaxed max-w-[200px]">
                    Select a section from the architect to begin neural configuration.
                </p>
            </div>
        </div>
      </SidebarContainer>
    );
  }

  const activeSection = section;
  const isBulkGeneration = selectedSectionIds.length > 1;
  const isGenerating = isBulkGeneration
    ? generateProjectMutation.isPending
    : (generateSectionMutation?.isPending && generateSectionMutation.variables === activeSection.id);

  const isAnythingGenerating = generateSectionMutation?.isPending || generateChapterMutation.isPending || generateProjectMutation.isPending;
  const creditCost = isBulkGeneration ? selectedSectionIds.length : 1;
  const hasCredits = (userProfile?.credits ?? 0) >= creditCost;
  const canGenerate = hasCredits && !isAnythingGenerating;

  function handleCopySettings() {
    copySettings({
      prompt: activeSection.prompt,
      controls: { ...activeSection.controls },
      guidelines: [...activeSection.guidelines],
      context: activeSection.context ? { ...activeSection.context } : undefined,
    });
    toast({
      title: "Configuration Cached",
      description: `Neural parameters for "${activeSection.title}" saved to local cache.`
    });
  }

  function handlePasteSettings() {
    if (!clipboard || !updateProject) return;

    const targetIds = selectedSectionIds.length > 0 ? selectedSectionIds : [activeSection.id];

    updateProject(p => {
      targetIds.forEach(id => {
        p.updateSection(id, s => s.withProps({
          prompt: clipboard.prompt,
          controls: { ...clipboard.controls },
          guidelines: [...(clipboard.guidelines || [])],
          context: clipboard.context ? { ...clipboard.context } : undefined,
        }));
      });
    });

    toast({
      title: "Neural Sync Applied",
      description: `Synchronized configuration across ${targetIds.length} ${targetIds.length === 1 ? 'node' : 'nodes'}.`
    });
  }

  function handleGenerateClick() {
    if (isBulkGenerating) {
      requestAbort();
      return;
    }

    if (isGenerating && !isBulkGeneration) {
      cancelGeneration(activeSection.id);
      return;
    }

    if (!canGenerate) return;

    if (isBulkGeneration && project) {
      generateProjectMutation.mutate({
        project,
        selectedSectionIds: new Set(selectedSectionIds)
      });
    } else {
      generateSectionMutation.mutate(activeSection.id);
    }
  }

  return (
    <SidebarContainer 
        title={isBulkGeneration ? `Neural Batch (${selectedSectionIds.length})` : 'Neural Vector'}
        icon={<Sparkles className="h-3 w-3" />}
        actions={
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/30 border border-border/40 backdrop-blur-md">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-background/80 transition-all rounded-lg"
                                onClick={handleCopySettings}
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[10px] font-black uppercase tracking-[0.2em]">
                            Cache Params
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-background/80 transition-all rounded-lg"
                                onClick={handlePasteSettings}
                                disabled={!clipboard}
                            >
                                <ClipboardPaste className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[10px] font-black uppercase tracking-[0.2em]">
                            Apply Sync
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        }
    >
        <div className="space-y-8 relative">
            {/* Section Identity Zone */}
            <div className="flex flex-col gap-4">
                <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">
                        {isBulkGeneration ? 'Target Nodes' : 'Active Context'}
                    </span>
                    <h3 className="text-[13px] font-black uppercase truncate tracking-widest text-foreground/90">
                        {isBulkGeneration ? 'Multiple Section Context' : section.title}
                    </h3>
                </div>

                {isBulkGenerating && (
                    <div className="space-y-3 p-4 rounded-2xl bg-primary/[0.03] border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-primary/70 leading-none">Synthesizing Manifest</span>
                                {estimatedRemaining && (
                                    <span className="text-[8px] font-medium text-muted-foreground/80 leading-none mt-1">{estimatedRemaining}</span>
                                )}
                            </div>
                            <span className="text-[10px] font-mono font-bold text-primary">{bulkProgress} / {bulkTotal}</span>
                        </div>
                        <Progress value={(bulkProgress / bulkTotal) * 100} className="h-1 bg-primary/10" />
                    </div>
                )}

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={handleGenerateClick}
                                disabled={!canGenerate && !isBulkGenerating && !isGenerating}
                                variant={(isBulkGenerating || (isGenerating && !isBulkGeneration)) ? "destructive" : "default"}
                                className={cn(
                                    "w-full font-black h-11 gap-2 shadow-xl shadow-primary/10 rounded-xl uppercase tracking-[0.15em] text-[10px] relative overflow-hidden group/gen",
                                    !(isBulkGenerating || (isGenerating && !isBulkGeneration)) && "bg-primary hover:opacity-90"
                                )}
                            >
                                {isBulkGenerating ? (
                                    <>
                                        <Square className="h-3.5 w-3.5 fill-current" />
                                        {abortRequested ? "Stopping..." : "Terminate Batch"}
                                    </>
                                ) : isGenerating ? (
                                    <>
                                        <Square className="h-3.5 w-3.5 fill-current" />
                                        Cancel Process
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-3.5 w-3.5" />
                                        {isBulkGeneration
                                            ? `Generate ${selectedSectionIds.length} Vectors`
                                            : t('builder.reportGenerator.generateButton')}
                                    </>
                                )}
                                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/gen:translate-x-full transition-transform duration-1000 ease-in-out" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[10px] font-bold tracking-wider">
                            {isBulkGenerating ? (
                                <p>Halt current synthesis process.</p>
                            ) : !canGenerate ? (
                                <p>{isAnythingGenerating ? "Concurrency limit reached." : "Insufficient fuel (credits)."}</p>
                            ) : (
                                <p>Cost Requirement: {creditCost} Credits</p>
                            )}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Parameter Configuration Zone */}
            <Tabs defaultValue="context" className="w-full flex flex-col gap-6">
                <TabsList className="grid w-full grid-cols-3 h-10 rounded-xl bg-muted/20 p-1 gap-1 border border-border/40 backdrop-blur-md">
                    <TabsTrigger value="context" className="gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md px-2 transition-all rounded-lg">
                        <LinkIcon className="h-3 w-3 shrink-0" />
                        <span className="truncate">Intel</span>
                    </TabsTrigger>
                    <TabsTrigger value="prompt" className="gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md px-2 transition-all rounded-lg">
                        <StickyNote className="h-3 w-3 shrink-0" />
                        <span className="truncate">Rules</span>
                    </TabsTrigger>
                    <TabsTrigger value="controls" className="gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md px-2 transition-all rounded-lg">
                        <SlidersHorizontal className="h-3 w-3 shrink-0" />
                        <span className="truncate">Params</span>
                    </TabsTrigger>
                </TabsList>

                <div className="relative min-h-[300px]">
                    <TabsContent value="context" className="m-0 focus-visible:ring-0 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Source Knowledge Base</span>
                            <SectionContextSelector
                                sectionId={section.id}
                                selectedSectionIds={selectedSectionIds.length > 1 ? selectedSectionIds : undefined}
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="prompt" className="m-0 focus-visible:ring-0 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Behavioral Constraints</span>
                            <GuidelineEditor
                                itemKey={section.id}
                                selectedSectionIds={selectedSectionIds.length > 1 ? selectedSectionIds : undefined}
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="controls" className="m-0 focus-visible:ring-0 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Output Dimensionality</span>
                            <SectionGenerationControls
                                section={section}
                                selectedSectionIds={selectedSectionIds.length > 1 ? selectedSectionIds : undefined}
                            />
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    </SidebarContainer>
  );
}
