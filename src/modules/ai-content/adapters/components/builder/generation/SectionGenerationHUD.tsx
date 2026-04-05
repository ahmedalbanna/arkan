'use client';

import React, { useCallback, useMemo } from 'react';
import { ClipboardPaste, Copy, Sparkles, Square, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/infrastructure/utils/cn';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { useGenerationUIStore } from '@/modules/ai-content/adapters/state/useGenerationUIStore';
import { useAiActions } from '@/modules/ai-content/adapters/hooks/report-mode/use-ai-actions';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { GuidelineEditor } from './controls/GuidelineEditor';
import { ContextSelector } from './controls/ContextSelector';
import { ControlPanel } from './controls/ControlPanel';
import { SidebarContainer } from '../layout/SidebarContainer';
import { SidebarSection } from '../layout/SidebarSection';

/**
 * SectionGenerationHUD — Context-sensitive AI operations for Sections.
 * Supports both single-focus and bulk generation modes with high-fidelity HUD styling.
 * 
 * DEFENSIVE MEASURES:
 * 1. Hook Placement: All hooks are at the top to prevent "Rules of Hooks" violations.
 * 2. Null Safety: Extensive checks for project, section, and mutation variables.
 * 3. Type Safety: Avoids unsafe "as any" where possible, using optional chaining and defaults.
 * 4. Error states: Provides fallback UI for missing data and generation errors.
 */

interface SectionGenerationHUDProps {
    section: Section | null;
    selectedSectionIds?: string[];
    className?: string;
}

export function SectionGenerationHUD({ section, selectedSectionIds = [], className }: SectionGenerationHUDProps) {
    const { t } = useLocalization();
    const project = useBuilderStore(state => state.project);
    const updateProject = useBuilderStore(state => state.updateProject);
    const { generateSectionMutation, generateChapterMutation, generateProjectMutation } = useAiActions();
    const clipboard = useGenerationUIStore(state => state.clipboard);
    const copySettings = useGenerationUIStore(state => state.copySettings);

    // 1. INPUT VALIDATION & DERIVED STATE
    const isBulkGeneration = selectedSectionIds.length > 1;
    
    // Safety check for mutation variables to avoid crashes during rapid state shifts
    const getSafeVariables = (mutation: any) => mutation?.variables || null;

    const estimatedRemaining = useMemo(() => {
        // Validation: Ensure mutation state exists before calculating
        if (!generateProjectMutation.isPending && !generateChapterMutation.isPending) return null;
        
        const vars = generateProjectMutation.isPending 
            ? getSafeVariables(generateProjectMutation) 
            : getSafeVariables(generateChapterMutation);
            
        const entity = vars?.project || vars?.chapter;
        if (!entity || typeof entity.getStats !== 'function') return null;

        try {
            const stats = entity.getStats();
            const remaining = stats.total - stats.completed;
            if (remaining <= 0) return null;

            const seconds = remaining * 12; // Nominal 12s per section
            if (seconds < 60) return `~${seconds} ${t('common.time.seconds')} remaining`;
            return `~${Math.ceil(seconds / 60)} ${t('common.time.minutes')} remaining`;
        } catch (e) {
            console.error('[SectionGenerationHUD] Failed to calculate stats:', e);
            return null;
        }
    }, [generateProjectMutation.isPending, generateProjectMutation.variables, generateChapterMutation.isPending, generateChapterMutation.variables, t]);

    const isGenerating = useMemo(() => {
        if (isBulkGeneration) {
            return generateProjectMutation.isPending || generateChapterMutation.isPending;
        }
        // Single section check: Verify the ID matches the current focus
        if (!section) return false;
        return generateSectionMutation.isPending && (getSafeVariables(generateSectionMutation) === section.id);
    }, [isBulkGeneration, generateProjectMutation.isPending, generateChapterMutation.isPending, generateSectionMutation.isPending, generateSectionMutation.variables, section]);

    const isAnythingGenerating = generateSectionMutation.isPending || generateChapterMutation.isPending || generateProjectMutation.isPending;
    const canGenerate = !isAnythingGenerating && !!section;
    const creditCost = isBulkGeneration ? selectedSectionIds.length : 1;

    // 2. STABLE EVENT HANDLERS
    const handleCopySettings = useCallback(() => {
        if (!section) return;
        copySettings({
            controls: { ...(section.controls || {}) },
            context: { ...(section.context || {}) },
            guidelines: [...(section.guidelines || [])]
        });
    }, [copySettings, section]);

    const handlePasteSettings = useCallback(() => {
        if (!section || !clipboard || !updateProject) return;
        
        const targets = isBulkGeneration ? selectedSectionIds : [section.id];
        
        // Defensive Update: Wrap in try-catch and ensure atomic project mutation
        try {
            updateProject(p => {
                targets.forEach(id => {
                    p.updateSection(id, s => s.withProps({
                        controls: { ...(clipboard.controls || {}) },
                        context: { ...(clipboard.context || {}) },
                        guidelines: [...(clipboard.guidelines || [])]
                    }));
                });
            });
        } catch (error) {
            console.error('[SectionGenerationHUD] Failed to paste settings:', error);
        }
    }, [clipboard, selectedSectionIds, isBulkGeneration, section, updateProject]);

    const handleGenerateClick = useCallback(() => {
        if (!section || !project) return;
        if (isGenerating) return; // Prevent double trigger

        // Final validation before trigger
        if (isBulkGeneration) {
            if (selectedSectionIds.length === 0) return;
            generateProjectMutation.mutate({ project, selectedSectionIds: new Set(selectedSectionIds) });
        } else {
            generateSectionMutation.mutate(section.id);
        }
    }, [generateProjectMutation, generateSectionMutation, isBulkGeneration, isGenerating, project, section, selectedSectionIds]);

    const bulkProgress = useMemo(() => {
        if (!isGenerating || !isBulkGeneration) return 0;
        const vars = generateProjectMutation.isPending ? getSafeVariables(generateProjectMutation) : getSafeVariables(generateChapterMutation);
        return vars?.project?.getStats?.().completed ?? vars?.chapter?.getStats?.().completed ?? 0;
    }, [isGenerating, isBulkGeneration, generateProjectMutation.isPending, generateProjectMutation.variables, generateChapterMutation.isPending, generateChapterMutation.variables]);

    const bulkTotal = isBulkGeneration ? selectedSectionIds.length : 1;

    // 3. RENDER LOGIC
    // Move early return here, AFTER all hooks are defined
    if (!section) {
        return (
            <SidebarContainer title="Section Synthesis" icon={<Sparkles className="h-3.5 w-3.5" />}>
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-40">
                    <div className="p-5 rounded-[24px] bg-primary/5 border border-primary/10 shadow-inner">
                        <Sparkles className="h-8 w-8 text-primary/40" />
                    </div>
                    <div className="space-y-1.5 px-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">No selection</p>
                        <p className="text-[11px] font-medium leading-relaxed italic text-muted-foreground/60 max-w-[200px]">
                            Select a node in the document to configure neural generation parameters.
                        </p>
                    </div>
                </div>
            </SidebarContainer>
        );
    }

    return (
        <SidebarContainer
            title={isBulkGeneration ? `Bulk Synthesis (${selectedSectionIds.length})` : 'Section Synthesis'}
            icon={<Sparkles className="h-3.5 w-3.5" />}
            actions={
                <div className="flex items-center gap-1 p-1 rounded-xl bg-background/20 border border-primary/5 backdrop-blur-md shadow-inner">
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all rounded-lg"
                                    onClick={handleCopySettings}
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mt-3">
                                Copy Logic
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all rounded-lg"
                                    onClick={handlePasteSettings}
                                    disabled={!clipboard}
                                >
                                    <ClipboardPaste className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mt-3">
                                Paste Logic
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            }
        >
            <div className="space-y-8 relative">
                {/* Node Identity Zone */}
                <div className="flex flex-col gap-5">
                    <div className="space-y-1.5 px-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">
                            {isBulkGeneration ? 'Integrated Cluster' : 'Synthesis Target'}
                        </span>
                        <h3 className="text-[13px] font-black uppercase truncate tracking-[0.15em] text-foreground/90 tabular-nums leading-tight">
                            {isBulkGeneration ? 'Multiple Section Block' : section.title}
                        </h3>
                    </div>

                    {isGenerating && isBulkGeneration && (
                        <div className="space-y-3.5 p-5 rounded-2xl bg-primary/[0.03] border border-primary/10 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/70 leading-none">System Processing</span>
                                    {estimatedRemaining && (
                                        <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-wider mt-1">{estimatedRemaining}</span>
                                    )}
                                </div>
                                <span className="text-[10px] font-mono font-bold text-primary tabular-nums">{bulkProgress} / {bulkTotal}</span>
                            </div>
                            <Progress value={(bulkProgress / Math.max(bulkTotal, 1)) * 100} className="h-1 bg-primary/10" />
                        </div>
                    )}

                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={handleGenerateClick}
                                    disabled={!canGenerate && !isGenerating}
                                    variant={isGenerating ? "destructive" : "default"}
                                    className={cn(
                                        "w-full font-black h-12 gap-2.5 shadow-2xl shadow-primary/15 rounded-2xl uppercase tracking-[0.2em] text-[10px] relative overflow-hidden group/gen transition-all duration-500 ease-[0.22,1,0.36,1]",
                                        !isGenerating && "bg-primary hover:opacity-90 ring-1 ring-inset ring-white/20"
                                    )}
                                >
                                    {isGenerating ? (
                                        <>
                                            {isBulkGeneration ? (
                                                <Square className="h-4 w-4 fill-current" />
                                            ) : (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            )}
                                            <span>{isBulkGeneration ? 'Terminate Batch' : 'Abort Synthesis'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 shrink-0 transition-transform group-hover/gen:scale-110" />
                                            <span>
                                                {isBulkGeneration
                                                    ? `Generate ${selectedSectionIds.length} Nodes`
                                                    : 'Synthesize Section'}
                                            </span>
                                        </>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover/gen:translate-x-full transition-transform duration-1000 ease-in-out" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mt-3">
                                {isGenerating ? 'Stop current pipeline' : `Neural Cost: ${creditCost} Energy`}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Error Feedback State (Mock - can be expanded with real error from useAiActions) */}
                    {(generateSectionMutation.isError || generateProjectMutation.isError) && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider animate-in fade-in zoom-in-95">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>System synthesis failed. Check neural source.</span>
                        </div>
                    )}
                </div>

                {/* Synthesis Parameter Zone */}
                <div className="flex flex-col gap-4">
                    <SidebarSection title="Source Matrix" defaultOpen>
                        <ContextSelector
                            sectionId={section.id}
                            selectedSectionIds={selectedSectionIds.length > 1 ? selectedSectionIds : undefined}
                        />
                    </SidebarSection>
                    <SidebarSection title="Logic Directives" defaultOpen={false}>
                        <GuidelineEditor
                            itemId={section.id}
                            selectedIds={selectedSectionIds.length > 1 ? selectedSectionIds : undefined}
                        />
                    </SidebarSection>
                    <SidebarSection title="Style Controls" defaultOpen={false}>
                        <ControlPanel
                            section={section}
                            selectedIds={selectedSectionIds.length > 1 ? selectedSectionIds : undefined}
                        />
                    </SidebarSection>
                </div>
            </div>

            {/* Stable Version Footer */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-3 border-t border-primary/10 bg-background/40 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary/30 shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Synthesis Manifest</span>
                </div>
                <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums tracking-widest uppercase">v2.4.0-STABLE</span>
            </div>
        </SidebarContainer>
    );
}
