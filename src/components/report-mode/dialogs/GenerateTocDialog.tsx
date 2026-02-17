
'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBuilderStore } from '@/hooks';
import { useGenerateTocLogic } from '@/hooks/writing-tools/use-generate-toc-logic';
import { Loader2, Sparkles } from 'lucide-react';
import { ScrollArea } from '../../ui/scroll-area';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '../../ui/card';

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
            // Reset state when dialog opens
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
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Generate Table of Contents with AI</DialogTitle>
                    <DialogDescription>
                        The AI will analyze your project description to suggest a logical chapter and section structure for your report.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <form id="toc-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>This information from your project settings will be used to generate the TOC.</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground italic">
                                <p><strong>Project Name:</strong> {project?.name}</p>
                                <p><strong>Description:</strong> {project?.projectDescription || "No description provided."}</p>
                            </CardContent>
                        </Card>
                        
                        <div>
                            <Label htmlFor="additional-instructions">Additional Instructions (Optional)</Label>
                            <Textarea
                                id="additional-instructions"
                                {...form.register('additionalInstructions')}
                                rows={3}
                                placeholder="e.g., 'Ensure there are at least 5 chapters.' or 'Focus on the implementation details.'"
                                disabled={mutation.isPending}
                            />
                        </div>
                    </form>

                    {(mutation.isPending || results) && (
                        <div className="space-y-2">
                            <Label>Suggested Structure</Label>
                            <ScrollArea className="h-48 rounded-md border p-4 bg-muted/50">
                                {mutation.isPending ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <ul className="space-y-3">
                                        {results?.tableOfContents.map((chapter, chapterIndex) => (
                                            <li key={chapterIndex}>
                                                <p className="font-semibold">{chapterIndex + 1}. {chapter.title}</p>
                                                <ul className="pl-6 mt-1 space-y-1 list-disc list-inside text-sm text-muted-foreground">
                                                    {chapter.sections.map((section, sectionIndex) => (
                                                        <li key={sectionIndex}>{section}</li>
                                                    ))}
                                                </ul>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </ScrollArea>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    {results && (
                        <Button type="button" onClick={handleApplyAndClose}>Apply to Project</Button>
                    )}
                    <Button type="submit" form="toc-form" disabled={mutation.isPending}>
                        {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                        Generate (0 Credits)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
