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
import { Link as LinkIcon, Loader2, SlidersHorizontal, Sparkles, StickyNote, Square, Copy, ClipboardPaste } from 'lucide-react';
import { useGenerationUIStore } from '@/modules/ai-content/adapters/state/useGenerationUIStore';
import { useToast } from '@/hooks/util/use-toast';
import { SectionContextSelector } from '../section-controls/SectionContextSelector';
import { SectionGenerationControls } from '../section-controls/SectionGenerationControls';
import { GuidelineEditor } from '../section-controls/SectionGuidelineEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import React from 'react';

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
      <div className={cn("flex h-full flex-col items-center justify-center space-y-4 text-center p-8", className)}>
        <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No Section Active</h4>
          <p className="text-[11px] text-muted-foreground/60 italic leading-relaxed">
            Select a section from the chapter list to begin configuring its AI parameters.
          </p>
        </div>
      </div>
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
      title: "Settings Copied",
      description: `Configuration for "${activeSection.title}" saved to clipboard.`
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
      title: "Settings Pasted",
      description: `Applied configuration to ${targetIds.length} ${targetIds.length === 1 ? 'section' : 'sections'}.`
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

    if (!canGenerate || !project) return;

    if (isBulkGeneration) {
      generateProjectMutation.mutate({
        project,
        selectedSectionIds: new Set(selectedSectionIds)
      });
    } else {
      generateSectionMutation.mutate(activeSection.id);
    }
  }

  return (
    <div className={cn("h-full flex flex-col min-h-0", className)}>
      <div className="px-4 pb-4 pt-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                {selectedSectionIds.length > 1 ? `Editing ${selectedSectionIds.length} Sections` : 'Active Context'}
              </span>
              <h3 className="text-[15px] font-bold font-headline truncate tracking-tight">
                {selectedSectionIds.length > 1 ? 'Bulk Configuration' : section.title}
              </h3>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/10 shrink-0">
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
                      Copy Settings
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
                      Paste Settings
                    </TooltipContent>
                  </Tooltip>
               </TooltipProvider>
            </div>
          </div>

          {isBulkGenerating && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex justify-between items-end px-1">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 leading-none">Building Project</span>
                  {estimatedRemaining && (
                    <span className="text-[9px] font-medium text-muted-foreground/80 leading-none">{estimatedRemaining}</span>
                  )}
                </div>
                <span className="text-[10px] font-mono font-bold text-muted-foreground">{bulkProgress} / {bulkTotal}</span>
              </div>
              <Progress value={(bulkProgress / bulkTotal) * 100} className="h-1.5" />
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
                    "w-full font-bold h-10 gap-2 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-500",
                    !(isBulkGenerating || (isGenerating && !isBulkGeneration)) && "shadow-primary/20"
                  )}
                >
                  {isBulkGenerating ? (
                    <>
                      <Square className="h-3.5 w-3.5 fill-current" />
                      {abortRequested ? "Stopping..." : "Stop Generation"}
                    </>
                  ) : isGenerating ? (
                    <>
                      <Square className="h-3.5 w-3.5 fill-current" />
                      Stop Generation
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {isBulkGeneration
                        ? `Generate ${selectedSectionIds.length} Sections`
                        : t('builder.reportGenerator.generateButton')}
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px]">
                {isBulkGenerating ? (
                  <p>Cancel the remaining sections in this batch.</p>
                ) : isGenerating ? (
                  <p>Stop the current section generation.</p>
                ) : !canGenerate ? (
                  <p>{isAnythingGenerating ? "Another generation is in progress." : "Insufficient credits."}</p>
                ) : (
                  <p>Cost: {creditCost} {creditCost === 1 ? 'Credit' : 'Credits'}</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Tabs defaultValue="context" className="w-full flex-1 flex flex-col min-h-0">
        <div className="px-4">
          <TooltipProvider>
            <TabsList className="grid w-full grid-cols-3 h-8 rounded-xl bg-muted/20 p-1 gap-1 border border-primary/5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="context" className="gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-2 transition-all rounded-lg">
                    <LinkIcon className="h-3 w-3 shrink-0" />
                    <span className="truncate">Context</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px] font-black uppercase tracking-[0.2em]"><p>Data Sources</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="prompt" className="gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-2 transition-all rounded-lg">
                    <StickyNote className="h-3 w-3 shrink-0" />
                    <span className="truncate">Prompt</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px] font-black uppercase tracking-[0.2em]"><p>Guidelines</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="controls" className="gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-2 transition-all rounded-lg">
                    <SlidersHorizontal className="h-3 w-3 shrink-0" />
                    <span className="truncate">Output</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px] font-black uppercase tracking-[0.2em]"><p>Parameters</p></TooltipContent>
              </Tooltip>
            </TabsList>
          </TooltipProvider>
        </div>

        <div className="flex-1 overflow-hidden relative mt-1">
          <ScrollArea className="h-full px-4 pr-4 -mr-4">
            <div className="pb-24 pt-4">
              <TabsContent value="context" className="m-0 focus-visible:ring-0">
                 <SectionContextSelector
                    sectionId={section.id}
                    selectedSectionIds={selectedSectionIds.length > 1 ? selectedSectionIds : undefined}
                 />
              </TabsContent>
              <TabsContent value="prompt" className="m-0 focus-visible:ring-0">
                 <GuidelineEditor
                    itemKey={section.id}
                    selectedSectionIds={selectedSectionIds.length > 1 ? selectedSectionIds : undefined}
                 />
              </TabsContent>
              <TabsContent value="controls" className="m-0 focus-visible:ring-0">
                 <SectionGenerationControls
                    section={section}
                    selectedSectionIds={selectedSectionIds.length > 1 ? selectedSectionIds : undefined}
                 />
              </TabsContent>
            </div>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
}
