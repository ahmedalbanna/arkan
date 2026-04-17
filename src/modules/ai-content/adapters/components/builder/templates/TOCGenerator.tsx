'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter, 
    DialogClose 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sparkles, ListTree, CheckCircle2, Database, Binary } from 'lucide-react';
import { useBuilderStore } from '@/hooks';
import { useGenerateTocLogic } from '@/modules/ai-content/adapters/hooks/use-generate-toc-logic';
import { cn } from '@/infrastructure/utils/cn';

/**
 * TOCGenerator — AI orchestration interface for document structural synthesis.
 * Derives a high-coherence hierarchy from project metadata and user constraints.
 */

interface TOCGeneratorProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onApply: (generatedMarkdown: string) => void;
}

export function TOCGenerator({ isOpen, onOpenChange, onApply }: TOCGeneratorProps) {
    const { project } = useBuilderStore();
    const { form, mutation, onSubmit, results, generatedMarkdown } = useGenerateTocLogic();

    useEffect(() => {
        if (project?.projectDescription && isOpen) {
            form.setValue('projectDescription', project.projectDescription);
        }
        if (isOpen) {
            form.reset({ projectDescription: project?.projectDescription || '', additionalInstructions: '' });
        }
    }, [project, form, isOpen]);

    const handleApplyAndClose = () => {
        if (generatedMarkdown) {
            onApply(generatedMarkdown);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden flex flex-col gap-0 border-primary/10 shadow-2xl rounded-[32px] bg-background/80 backdrop-blur-3xl">
                
                {/* HUD Header — Neural Architect Identity */}
                <header className="px-10 py-8 border-b border-primary/10 bg-primary/[0.02] relative overflow-hidden shrink-0">
                    {/* Dot-grid atmosphere (28px standard) */}
                    <div
                        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)',
                            backgroundSize: '28px 28px',
                        }}
                    />
                    
                    <div className="flex flex-col gap-4 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="h-12 w-12 rounded-[20px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group/logo relative">
                                <div className="absolute inset-0 bg-primary/5 blur-lg group-hover:blur-xl transition-all" />
                                <Sparkles className="h-6 w-6 text-primary relative z-10 group-hover:rotate-12 transition-transform duration-500" />
                            </div>
                            <div className="space-y-1">
                                <DialogTitle className="text-[20px] font-black uppercase tracking-tight text-foreground/90">Neural Synthesis Architect</DialogTitle>
                                <div className="flex items-center gap-2.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70">Structural Engine Engaged</p>
                                </div>
                            </div>
                        </div>
                        <DialogDescription className="text-[12px] text-muted-foreground/70 italic max-w-3xl leading-relaxed mt-1 font-medium pl-[68px]">
                            The AI Architect analyzes your project parameters to derive a high-coherence Table of Contents. Refine the suggested hierarchy before materializing the structure.
                        </DialogDescription>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden relative min-h-0 flex flex-col">
                    <ScrollArea className="h-full custom-scrollbar">
                        <div className="p-10 space-y-10 relative">
                            {/* Depth architectural line */}
                            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
                            
                            <div className="grid gap-12 md:grid-cols-2 relative z-10">
                                {/* Left Column — Source Parameters */}
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2.5 px-1 group/label">
                                            <Database className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Source Matrix</Label>
                                        </div>
                                        <div className="rounded-[24px] border border-primary/10 bg-muted/5 shadow-inner overflow-hidden relative group/card">
                                            <div className="p-6 space-y-5">
                                                <div className="space-y-1.5">
                                                    <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Manifest Identity</p>
                                                    <p className="text-[14px] font-black uppercase tracking-tight truncate text-foreground/80">{project?.name}</p>
                                                </div>
                                                <Separator className="bg-primary/5" />
                                                <div className="space-y-1.5">
                                                    <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Logic Base</p>
                                                    <p className="text-[11px] text-muted-foreground/70 line-clamp-6 leading-relaxed italic font-serif font-medium">
                                                        {project?.projectDescription || "No intellectual brief provided."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <form id="toc-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2.5 px-1 group/label">
                                                <Binary className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                                                <Label htmlFor="additional-instructions" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Cognitive Constraints</Label>
                                            </div>
                                            <Textarea
                                                id="additional-instructions"
                                                {...form.register('additionalInstructions')}
                                                rows={5}
                                                placeholder="e.g., 'Optimize for exactly 6 chapters with a heavy focus on technical implementation details.'"
                                                disabled={mutation.isPending}
                                                className="relative min-h-[120px] text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-2xl shadow-inner transition-all resize-none p-4 leading-relaxed font-serif italic"
                                            />
                                        </div>
                                        <Button 
                                            type="submit" 
                                            disabled={mutation.isPending} 
                                            className="w-full h-12 text-[10px] font-black uppercase tracking-[0.25em] gap-3 shadow-2xl shadow-primary/20 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.98] ring-1 ring-inset ring-white/20"
                                        >
                                            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                            Analyze & Architect
                                        </Button>
                                    </form>
                                </div>

                                {/* Right Column — Suggested Hierarchy */}
                                <div className="space-y-4 flex flex-col min-h-0">
                                    <div className="flex items-center gap-2.5 px-1">
                                        <ListTree className="h-3.5 w-3.5 text-primary/60" />
                                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Synthesized Hierarchy</Label>
                                    </div>
                                    
                                    <div className="flex-1 min-h-[400px] relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 to-transparent rounded-[32px] blur opacity-40" />
                                        <ScrollArea className="absolute inset-0 rounded-[28px] border border-primary/10 bg-black/5 dark:bg-white/[0.02] p-8 shadow-inner custom-scrollbar relative z-10">
                                            {mutation.isPending ? (
                                                <div className="flex flex-col items-center justify-center h-full py-16 space-y-4 opacity-40">
                                                    <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                                                    <p className="text-[10px] uppercase tracking-[0.25em] font-black">Compiling Logic Matrix...</p>
                                                </div>
                                            ) : results ? (
                                                <div className="space-y-8 animate-in fade-in duration-700">
                                                    {results.tableOfContents.map((chapter, idx) => (
                                                        <div key={idx} className="space-y-4">
                                                            <div className="flex items-center gap-4 group/chapter">
                                                                <span className="text-[10px] font-black bg-primary/10 text-primary w-7 h-7 rounded-xl border border-primary/20 flex items-center justify-center shrink-0 shadow-inner group-hover/chapter:bg-primary group-hover/chapter:text-white transition-all duration-500">{idx + 1}</span>
                                                                <h4 className="text-[13px] font-black uppercase tracking-widest text-foreground/90">{chapter.title}</h4>
                                                            </div>
                                                            <div className="pl-11 space-y-2.5 border-l border-primary/10 ml-3.5">
                                                                {chapter.sections.map((section, sIdx) => (
                                                                    <div key={sIdx} className="flex items-center gap-3 group/item">
                                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary/20 group-hover/item:bg-primary group-hover/item:scale-125 transition-all duration-500 shadow-[0_0_8px_rgba(var(--primary),0)] group-hover/item:shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                                                                        <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors font-medium leading-tight">{section}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-30">
                                                    <div className="p-6 rounded-full bg-muted/20 border border-dashed border-muted-foreground/40 mb-4">
                                                        <ListTree className="h-10 w-10 text-muted-foreground stroke-[1]" />
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] px-12 leading-relaxed">
                                                        Initialize scanning to materialize architectural logic.
                                                    </p>
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                <footer className="px-10 py-5 border-t border-primary/10 bg-background/40 backdrop-blur-xl flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-1 rounded-full bg-primary/30" />
                        <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.25em]">
                            Neural Architecture Pipeline · Production Core
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <DialogClose asChild>
                            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-[0.2em] h-9 px-6 rounded-xl transition-all hover:bg-red-500/5 hover:text-red-600">
                                Discard Manifest
                            </Button>
                        </DialogClose>
                        {results && (
                            <Button 
                                type="button" 
                                onClick={handleApplyAndClose}
                                className="h-9 px-8 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 bg-primary hover:opacity-90 gap-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 ring-1 ring-inset ring-white/20"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Apply Blueprint
                            </Button>
                        )}
                    </div>
                </footer>
            </DialogContent>
        </Dialog>
    );
}
