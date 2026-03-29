'use client';

import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBuilderStore, useToast } from '@/hooks';
import { useGenerateTocLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-generate-toc-logic';
import { Loader2, Sparkles, ListTree, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface GenerateTocDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onApply: (generatedMarkdown: string) => void;
}

export function GenerateTocDialog({ isOpen, onOpenChange, onApply }: GenerateTocDialogProps) {
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

    function handleApplyAndClose() {
        if (generatedMarkdown) {
            onApply(generatedMarkdown);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden flex flex-col gap-0 border-primary/10 shadow-2xl rounded-[28px]">
                <header className="px-8 py-6 border-b border-border/40 bg-background/40 backdrop-blur-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-radial-gradient from-primary/5 to-transparent opacity-50" />
                    <div className="flex flex-col gap-1 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <DialogTitle className="text-[18px] font-bold font-headline tracking-tight">Document Architecture Manifest</DialogTitle>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Architectural Engine Engaged</p>
                                </div>
                            </div>
                        </div>
                        <DialogDescription className="text-[11px] text-muted-foreground italic max-w-2xl leading-relaxed mt-2 pl-13">
                            The AI Architect will analyze your project parameters to derive a high-coherence Table of Contents. You can refine the suggested structure before final application.
                        </DialogDescription>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden relative min-h-0 bg-background flex flex-col">
                    <ScrollArea className="h-full">
                        <div className="p-8 space-y-8 relative">
                            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
                            <div className="grid gap-8 md:grid-cols-2 relative z-10">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Source Parameters</Label>
                                        <div className="rounded-2xl border border-primary/10 bg-muted/5 shadow-inner overflow-hidden">
                                            <div className="p-4 space-y-3">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Project Title</p>
                                                    <p className="text-[13px] font-bold tracking-tight truncate">{project?.name}</p>
                                                </div>
                                                <Separator className="bg-primary/5" />
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Base Description</p>
                                                    <p className="text-[11px] text-muted-foreground line-clamp-4 leading-relaxed italic font-serif">{project?.projectDescription || "No description provided."}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <form id="toc-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="additional-instructions" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Architectural Constraints</Label>
                                            <Textarea
                                                id="additional-instructions"
                                                {...form.register('additionalInstructions')}
                                                rows={4}
                                                placeholder="e.g., 'Target exactly 6 chapters with a heavy focus on technical implementation details.'"
                                                disabled={mutation.isPending}
                                                className="relative min-h-[100px] text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl shadow-inner transition-all resize-none p-3 leading-relaxed font-serif italic"
                                            />
                                        </div>
                                        <Button type="submit" disabled={mutation.isPending} className="w-full h-9 text-[10px] font-black uppercase tracking-[0.2em] gap-2 shadow-lg shadow-primary/20 rounded-xl transition-all">
                                            {mutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                            Analyze & Architect
                                        </Button>
                                    </form>
                                </div>

                                <div className="space-y-4 flex flex-col min-h-0">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Suggested Hierarchy</Label>
                                    <div className="flex-1 min-h-[350px] relative group">
                                        <ScrollArea className="absolute inset-0 rounded-2xl border border-primary/10 bg-muted/5 p-6 shadow-inner">
                                            {mutation.isPending ? (
                                                <div className="flex flex-col items-center justify-center h-full py-12 space-y-3 opacity-50">
                                                    <Loader2 className="h-7 w-7 animate-spin text-primary/40" />
                                                    <p className="text-[9px] uppercase tracking-[0.2em] font-black">Compiling Logic</p>
                                                </div>
                                            ) : results ? (
                                                <div className="space-y-6 animate-in fade-in duration-500">
                                                    {results.tableOfContents.map((chapter, idx) => (
                                                        <div key={idx} className="space-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-black bg-primary/10 text-primary w-6 h-6 rounded-lg border border-primary/10 flex items-center justify-center shrink-0 shadow-inner">{idx + 1}</span>
                                                                <h4 className="text-[12px] font-black uppercase tracking-[0.1em] text-foreground">{chapter.title}</h4>
                                                            </div>
                                                            <div className="pl-9 space-y-2 border-l border-primary/10 ml-3">
                                                                {chapter.sections.map((section, sIdx) => (
                                                                    <div key={sIdx} className="flex items-center gap-2 group/item">
                                                                        <div className="h-1 w-1 rounded-full bg-primary/20 group-hover/item:bg-primary transition-colors" />
                                                                        <span className="text-[11px] text-muted-foreground/80 leading-tight group-hover/item:text-foreground transition-colors font-medium">{section}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-40">
                                                    <ListTree className="h-8 w-8 mb-2 stroke-[1.5]" />
                                                    <p className="text-[9px] uppercase tracking-[0.2em] font-black">Architecture Pending</p>
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                <footer className="px-8 py-4 border-t border-border/40 bg-muted/5 flex items-center justify-between">
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">
                        AI Architect • V1.0 Stable
                    </p>
                    <div className="flex items-center gap-3">
                        <DialogClose asChild>
                            <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-[0.2em] h-8 px-4 rounded-lg transition-all hover:bg-destructive/5 hover:text-destructive">
                                Discard
                            </Button>
                        </DialogClose>
                        {results && (
                            <Button 
                                type="button" 
                                onClick={handleApplyAndClose}
                                className="h-8 px-6 text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 gap-2 rounded-lg transition-all hover:scale-105"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Apply Blueprint
                            </Button>
                        )}
                    </div>
                </footer>
            </DialogContent>
        </Dialog>
    );
}
