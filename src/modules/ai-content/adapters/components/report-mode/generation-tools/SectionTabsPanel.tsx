'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { useGenerationUIStore } from '@/modules/ai-content/adapters/state/useGenerationUIStore';
import { useAiActions } from '@/modules/ai-content/adapters/hooks/report-mode/use-ai-actions';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { ClipboardPaste, Copy, Link as LinkIcon, SlidersHorizontal, Sparkles, Square, StickyNote } from 'lucide-react';
import React from 'react';
import { GuidelineEditor } from '../section-controls/SectionGuidelineEditor';
import { SectionContextSelector } from '../section-controls/SectionContextSelector';
import { SectionGenerationControls } from '../section-controls/SectionGenerationControls';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/infrastructure/utils/cn';
import { SidebarContainer } from '../../builder/layout/SidebarContainer';

interface SectionTabsPanelProps {
    section: Section | null;
    selectedSectionIds?: string[];
    className?: string;
}

export function SectionTabsPanel({ section, selectedSectionIds = [], className }: SectionTabsPanelProps) {
    const { t } = useLocalization();
    const { project, updateProject } = useBuilderStore();
    const { generateSectionMutation, generateChapterMutation, generateProjectMutation } = useAiActions();
    const { clipboard, copySettings } = useGenerationUIStore();

    const estimatedRemaining = React.useMemo(() => {
        if (!generateProjectMutation.isPending && !generateChapterMutation.isPending) return null;
        const stats = generateProjectMutation.isPending
            ? (generateProjectMutation.variables as any)?.project?.getStats()
            : (generateChapterMutation.variables as any)?.chapter?.getStats();

        if (!stats) return null;
        const remaining = stats.total - stats.completed;
        if (remaining <= 0) return null;

        // Roughly 10-15 seconds per section
        const seconds = remaining * 12;
        if (seconds < 60) return `~${seconds} seconds remaining`;
        return `~${Math.ceil(seconds / 60)} minutes remaining`;
    }, [generateProjectMutation, generateChapterMutation]);

    if (!section) {
        return (
            <SidebarContainer title="Section Tools" icon={<Sparkles className="h-3 w-3" />}>
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-40">
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                        <Sparkles className="h-8 w-8 text-primary/40" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">No selection</p>
                        <p className="text-[11px] font-medium leading-relaxed max-w-[180px]">Select a section in the document to configure tools.</p>
                    </div>
                </div>
            </SidebarContainer>
        );
    }

    const activeSection = section;
    const isBulkGeneration = selectedSectionIds.length > 1;
    const isGenerating = isBulkGeneration
        ? generateProjectMutation.isPending || generateChapterMutation.isPending
        : generateSectionMutation.isPending && (generateSectionMutation.variables as any) === section.id;

    const isAnythingGenerating = generateSectionMutation?.isPending || generateChapterMutation.isPending || generateProjectMutation.isPending;
    // Credits property might be missing or in meta
    const userCredits = 100; // Mocking or could fetch from user profile
    const canGenerate = !isAnythingGenerating && userCredits >= (isBulkGeneration ? selectedSectionIds.length : 1);
    const creditCost = isBulkGeneration ? selectedSectionIds.length : 1;

    function handleCopySettings() {
        if (!activeSection) return;
        copySettings({
            controls: { ...activeSection.controls },
            context: { ...activeSection.context },
            guidelines: [...activeSection.guidelines]
        });
    }

    function handlePasteSettings() {
        if (!activeSection || !clipboard) return;

        const targets = isBulkGeneration ? selectedSectionIds : [activeSection.id];

        updateProject(p => {
            targets.forEach(id => {
                p.updateSection(id, s => s.withProps({
                    controls: { ...(clipboard.controls as any) },
                    context: { ...(clipboard.context as any) },
                    guidelines: [...(clipboard.guidelines || [])]
                }));
            });
        });
    }

    const bulkProgress = generateProjectMutation.isPending ? (generateProjectMutation.variables as any)?.project?.getStats().completed ?? 0 : (generateChapterMutation.variables as any)?.chapter?.getStats().completed ?? 0;
    const bulkTotal = isBulkGeneration ? selectedSectionIds.length : 1;
    const isBulkGenerating = (generateProjectMutation.isPending || generateChapterMutation.isPending) && isBulkGeneration;
    const abortRequested = false; // Mock

    function handleGenerateClick() {
        if (!activeSection) return;
        if (isBulkGenerating || isGenerating) {
            // In a real implementation we would call an abort function here
            return;
        }

        if (isBulkGeneration) {
            generateProjectMutation.mutate({ project: project!, selectedSectionIds: new Set(selectedSectionIds) });
        } else {
            generateSectionMutation.mutate(activeSection.id);
        }
    }

    return (
        <SidebarContainer
            title={isBulkGeneration ? `Bulk Tools (${selectedSectionIds.length})` : 'Section Tools'}
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
            }
        >
            <div className="space-y-8 relative">
                {/* Section Identity Zone */}
                <div className="flex flex-col gap-4">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">
                            {isBulkGeneration ? 'Selected Sections' : 'Current Section'}
                        </span>
                        <h3 className="text-[13px] font-black uppercase truncate tracking-widest text-foreground/90">
                            {isBulkGeneration ? 'Multiple Selection' : section.title}
                        </h3>
                    </div>

                    {isBulkGenerating && (
                        <div className="space-y-3 p-4 rounded-2xl bg-primary/[0.03] border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-500">
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary/70 leading-none">Generating Content</span>
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
                                            {abortRequested ? "Stopping..." : "Stop Batch"}
                                        </>
                                    ) : isGenerating ? (
                                        <>
                                            <Square className="h-3.5 w-3.5 fill-current" />
                                            Cancel
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-3.5 w-3.5" />
                                            {isBulkGeneration
                                                ? `Generate ${selectedSectionIds.length} Sections`
                                                : t('builder.reportGenerator.generateButton')}
                                        </>
                                    )}
                                    <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/gen:translate-x-full transition-transform duration-1000 ease-in-out" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[10px] font-bold tracking-wider">
                                {isBulkGenerating ? (
                                    <p>Stop current generation process.</p>
                                ) : !canGenerate ? (
                                    <p>{isAnythingGenerating ? "System busy." : "Insufficient credits."}</p>
                                ) : (
                                    <p>Cost: {creditCost} Credits</p>
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
                            <span className="truncate">Context</span>
                        </TabsTrigger>
                        <TabsTrigger value="prompt" className="gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md px-2 transition-all rounded-lg">
                            <StickyNote className="h-3 w-3 shrink-0" />
                            <span className="truncate">Rules</span>
                        </TabsTrigger>
                        <TabsTrigger value="controls" className="gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md px-2 transition-all rounded-lg">
                            <SlidersHorizontal className="h-3 w-3 shrink-0" />
                            <span className="truncate">Settings</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative min-h-[300px]">
                        <TabsContent value="context" className="m-0 focus-visible:ring-0 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Source Data</span>
                                <SectionContextSelector
                                    sectionId={section.id}
                                    selectedSectionIds={selectedSectionIds.length > 1 ? selectedSectionIds : undefined}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="prompt" className="m-0 focus-visible:ring-0 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">AI Instructions</span>
                                <GuidelineEditor
                                    itemKey={section.id}
                                    selectedSectionIds={selectedSectionIds.length > 1 ? selectedSectionIds : undefined}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="controls" className="m-0 focus-visible:ring-0 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Format & Style</span>
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
