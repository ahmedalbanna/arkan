'use client';

import React, { useCallback } from 'react';
import { Edit, Link as LinkIcon, Loader2, Layout, PlusCircle, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { useChapterActions } from '@/modules/ai-content/adapters/hooks/report-mode/use-chapter-actions';
import { ContextSelector } from './controls/ContextSelector';
import { SidebarContainer } from '../layout/SidebarContainer';

/**
 * ChapterGenerationHUD — Context-sensitive AI operations for Chapters.
 * Implements high-density parameter tuning and bulk processing.
 */

interface ChapterGenerationHUDProps {
    chapter: Chapter | null;
    className?: string;
    onClose?: () => void;
}

export function ChapterGenerationHUD({ chapter, className, onClose }: ChapterGenerationHUDProps) {
    const chapterActions = useChapterActions(chapter!);

    const {
        manipulationType,
        setManipulationType,
        manipulationTypes,
        isProcessing,
        processedText,
        handleApplyToNewSection,
        form,
        onSubmit,
        compressionRatio,
        setCompressionRatio,
        styles,
    } = chapterActions;

    const handleSubmit = useCallback(onSubmit, [onSubmit]);
    const handleApply = useCallback(handleApplyToNewSection, [handleApplyToNewSection]);

    if (!chapter) {
        return (
            <SidebarContainer title="Chapter Neural Core" icon={<Layout className="h-3.5 w-3.5" />}>
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-40">
                    <div className="p-5 rounded-[24px] bg-primary/5 border border-primary/10 shadow-inner">
                        <Layout className="h-8 w-8 text-primary/40" />
                    </div>
                    <div className="space-y-1.5 px-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">No selection</p>
                        <p className="text-[11px] font-medium leading-relaxed italic text-muted-foreground/60">
                            Select a chapter in the navigator to perform bulk AI operations.
                        </p>
                    </div>
                </div>
            </SidebarContainer>
        );
    }

    return (
        <SidebarContainer
            title="Chapter Neural Core"
            icon={<Layout className="h-3.5 w-3.5" />}
        >
            <div className="space-y-8 relative">
                {/* Chapter Identity & Trigger */}
                <div className="flex flex-col gap-5">
                    <div className="space-y-1.5 px-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Active Chapter</span>
                        <h3 className="text-[13px] font-black uppercase truncate tracking-[0.15em] text-foreground/90 tabular-nums leading-tight">
                            {chapter.title}
                        </h3>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3.5">
                            <Button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full font-black h-12 gap-2.5 shadow-xl shadow-primary/10 rounded-2xl uppercase tracking-[0.2em] text-[10px] relative overflow-hidden group/gen transition-all duration-500 ease-[0.22,1,0.36,1]"
                            >
                                {isProcessing ? (
                                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                                ) : (
                                    <Wand2 className="h-4 w-4 shrink-0 transition-transform group-hover/gen:rotate-12" />
                                )}
                                <span>Generate Chapter</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/gen:translate-x-full transition-transform duration-1000 ease-in-out" />
                            </Button>

                            {processedText && !isProcessing && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleApply}
                                    className="w-full font-black h-10 gap-2 border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 rounded-xl uppercase tracking-widest text-[9px] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    Materialize Logic
                                </Button>
                            )}
                        </form>
                    </Form>
                </div>

                {/* Cognitive Configuration */}
                <Tabs defaultValue="actions" className="w-full flex flex-col gap-6">
                    <TabsList className="grid w-full grid-cols-2 h-11 rounded-2xl bg-muted/20 p-1 gap-1 border border-border/40 backdrop-blur-md">
                        <TabsTrigger value="actions" className="gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg px-2 transition-all rounded-xl">
                            <Edit className="h-3.5 w-3.5 shrink-0" />
                            <span>Neural Logic</span>
                        </TabsTrigger>
                        <TabsTrigger value="context" className="gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg px-2 transition-all rounded-xl">
                            <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                            <span>Source Core</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative min-h-[320px]">
                        <TabsContent value="actions" className="m-0 focus-visible:ring-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-6">
                                <div className="space-y-3.5 px-1">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Operation Vector</Label>
                                    <Select value={manipulationType} onValueChange={(v) => setManipulationType(v as any)}>
                                        <SelectTrigger className="h-11 text-[11px] font-bold bg-muted/20 border-border/40 rounded-xl focus:ring-primary/20 transition-all hover:border-primary/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-primary/10 shadow-2xl backdrop-blur-3xl">
                                            {manipulationTypes.map(type => (
                                                <SelectItem key={type.value} value={type.value} className="text-[11px] font-medium py-3 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer">
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {manipulationType === 'rewrite' && (
                                    <div className="space-y-3.5 animate-in fade-in duration-300 px-1">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Linguistic Style</Label>
                                        <Select onValueChange={(val) => form.setValue('rewriteStyle', val)} defaultValue={form.getValues('rewriteStyle')}>
                                            <SelectTrigger className="h-11 text-[11px] font-bold bg-muted/20 border-border/40 rounded-xl">
                                                <SelectValue placeholder="Select style" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-primary/10">
                                                {styles.map(s => <SelectItem key={s} value={s} className="text-[11px] font-medium py-3">{s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {manipulationType === 'summarize' && (
                                    <div className="space-y-5 animate-in fade-in duration-300 px-1">
                                        <div className="flex justify-between items-center px-1">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Density Vector</Label>
                                            <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary shadow-inner tabular-nums">{compressionRatio}%</Badge>
                                        </div>
                                        <div className="px-1">
                                            <Slider value={[compressionRatio]} onValueChange={(v) => setCompressionRatio(v[0])} min={10} max={90} step={5} className="py-2" />
                                        </div>
                                    </div>
                                )}

                                {manipulationType === 'style-editor' && (
                                    <div className="space-y-5 animate-in fade-in duration-300 px-1">
                                        <div className="space-y-3.5">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Target Persona</Label>
                                            <Input {...form.register('targetAudience')} placeholder="e.g., Clinical, Academic, Executive" className="h-11 text-[11px] font-bold bg-muted/20 border-border/40 rounded-xl focus-visible:ring-primary/10 shadow-inner" />
                                        </div>
                                        <div className="space-y-3.5">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Intellectual Tone</Label>
                                            <Input {...form.register('tone')} placeholder="e.g., Sophisticated, Analytical" className="h-11 text-[11px] font-bold bg-muted/20 border-border/40 rounded-xl focus-visible:ring-primary/10 shadow-inner" />
                                        </div>
                                    </div>
                                )}

                                {manipulationType === 'readability-enhancer' && (
                                    <div className="space-y-3.5 animate-in fade-in duration-300 px-1">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Complexity Level</Label>
                                        <Select onValueChange={(val) => form.setValue('targetLevel', val)} defaultValue={form.getValues('targetLevel')}>
                                            <SelectTrigger className="h-11 text-[11px] font-bold bg-muted/20 border-border/40 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-primary/10">
                                                <SelectItem value="elementary" className="text-[11px] font-medium py-3">Elementary</SelectItem>
                                                <SelectItem value="middle-school" className="text-[11px] font-medium py-3">Intermediate</SelectItem>
                                                <SelectItem value="high-school" className="text-[11px] font-medium py-3">Advanced</SelectItem>
                                                <SelectItem value="college" className="text-[11px] font-medium py-3">Undergraduate</SelectItem>
                                                <SelectItem value="graduate" className="text-[11px] font-medium py-3">Expert Core</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            <Separator className="bg-primary/10 h-px" />

                            <div className="p-5 rounded-[24px] border border-dashed border-primary/10 bg-primary/[0.02] text-center space-y-2 group/info hover:bg-primary/[0.04] transition-all">
                                <p className="text-[9px] text-primary/40 italic leading-relaxed font-medium uppercase tracking-widest group-hover:text-primary/60 transition-colors px-4">
                                    Unified Neural Processing — All chapter nodes will be updated simultaneously.
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="context" className="m-0 focus-visible:ring-0 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-5">
                                <div className="space-y-1.5 px-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Chapter Sources</span>
                                    <p className="text-[10px] text-muted-foreground italic font-medium leading-relaxed px-1">
                                        Define the context hierarchy for all sections within this chapter.
                                    </p>
                                </div>
                                <ContextSelector 
                                    sectionId={chapter.id || ''} 
                                    selectedSectionIds={chapter.sections.map(s => s.id)}
                                />
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            {/* Stable Version Footer */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-3 border-t border-primary/10 bg-background/40 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary/30 shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Chapter Manifest</span>
                </div>
                <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums tracking-widest uppercase">v2.4.0-STABLE</span>
            </div>
        </SidebarContainer>
    );
}
