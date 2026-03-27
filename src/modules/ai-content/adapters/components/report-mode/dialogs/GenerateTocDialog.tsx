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
            <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden flex flex-col gap-0 border-none shadow-2xl">
                <header className="px-8 py-6 border-b bg-muted/10">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <DialogTitle className="text-xl font-bold font-headline tracking-tight">Document Architecture Manifest</DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground italic max-w-2xl leading-relaxed">
                            The AI Architect will analyze your project parameters to derive a high-coherence Table of Contents. You can refine the suggested structure before final application.
                        </DialogDescription>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden relative min-h-0 bg-background flex flex-col">
                    <ScrollArea className="h-full">
                        <div className="p-8 space-y-8">
                            <div className="grid gap-8 md:grid-cols-2">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source Parameters</Label>
                                        <Card className="border-border/40 bg-muted/5 shadow-none">
                                            <CardContent className="p-4 space-y-3">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-primary/60 uppercase">Project Title</p>
                                                    <p className="text-xs font-semibold truncate">{project?.name}</p>
                                                </div>
                                                <Separator className="bg-border/40" />
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-primary/60 uppercase">Base Description</p>
                                                    <p className="text-[11px] text-muted-foreground line-clamp-4 leading-relaxed italic">{project?.projectDescription || "No description provided."}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <form id="toc-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="additional-instructions" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Architectural Constraints</Label>
                                            <Textarea
                                                id="additional-instructions"
                                                {...form.register('additionalInstructions')}
                                                rows={4}
                                                placeholder="e.g., 'Target exactly 6 chapters with a heavy focus on technical implementation details.'"
                                                disabled={mutation.isPending}
                                                className="text-xs bg-muted/5 focus-visible:ring-1 resize-none p-3 leading-relaxed"
                                            />
                                        </div>
                                        <Button type="submit" disabled={mutation.isPending} className="w-full font-bold h-10 gap-2 shadow-md">
                                            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                            Analyze & Architect
                                        </Button>
                                    </form>
                                </div>

                                <div className="space-y-4 flex flex-col min-h-0">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Suggested Hierarchy</Label>
                                    <div className="flex-1 min-h-[350px] relative group">
                                        <ScrollArea className="absolute inset-0 rounded-xl border bg-[#f8fafc] dark:bg-black/20 p-6 shadow-inner">
                                            {mutation.isPending ? (
                                                <div className="flex flex-col items-center justify-center h-full py-12 space-y-3 opacity-50">
                                                    <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                                                    <p className="text-[10px] uppercase tracking-widest font-bold">Compiling Logic</p>
                                                </div>
                                            ) : results ? (
                                                <div className="space-y-6 animate-in fade-in duration-500">
                                                    {results.tableOfContents.map((chapter, idx) => (
                                                        <div key={idx} className="space-y-2.5">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-bold bg-primary/10 text-primary w-5 h-5 rounded flex items-center justify-center shrink-0">{idx + 1}</span>
                                                                <h4 className="text-xs font-bold uppercase tracking-wide text-foreground">{chapter.title}</h4>
                                                            </div>
                                                            <div className="pl-8 space-y-1.5 border-l-2 border-muted/30 ml-2.5">
                                                                {chapter.sections.map((section, sIdx) => (
                                                                    <div key={sIdx} className="flex items-center gap-2 group/item">
                                                                        <div className="h-1 w-1 rounded-full bg-muted-foreground/30 group-hover/item:bg-primary transition-colors" />
                                                                        <span className="text-[11px] text-muted-foreground leading-tight group-hover/item:text-foreground transition-colors">{section}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-40">
                                                    <ListTree className="h-10 w-10 mb-3" />
                                                    <p className="text-[10px] uppercase tracking-widest font-bold">Architecture Pending</p>
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                        AI Architect • V1.0 Stable
                    </p>
                    <div className="flex items-center gap-3">
                        <DialogClose asChild>
                            <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-wider h-9">
                                Discard
                            </Button>
                        </DialogClose>
                        {results && (
                            <Button 
                                type="button" 
                                onClick={handleApplyAndClose}
                                className="font-bold h-9 px-6 shadow-lg shadow-primary/20 gap-2"
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
