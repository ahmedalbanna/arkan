'use client';

import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBuilderStore } from '@/hooks';
import { useGenerateTocLogic } from '@/hooks/writing-tools/use-generate-toc-logic';
import { Loader2, Sparkles } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from '@/hooks';
import { useEffect } from 'react';

interface GenerateTocDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GenerateTocDialog({ isOpen, onOpenChange }: GenerateTocDialogProps) {
    const { project, updateProject } = useBuilderStore();
    const { form, mutation, onSubmit, results } = useGenerateTocLogic();

    useEffect(() => {
        if (project?.projectDescription) {
            form.setValue('projectDescription', project.projectDescription);
        }
    }, [project, form, isOpen]);

    function handleApplyToc() {
        if (!results) return;

        updateProject(p => {
            let newProject = p.with({ chapters: [] }); // Start with a clean slate
            results.tableOfContents.forEach(chapterData => {
                newProject = newProject.addChapter(chapterData.title);
                const newChapterId = newProject.chapters[newProject.chapters.length - 1].id;
                chapterData.sections.forEach(sectionTitle => {
                    newProject = newProject.addSectionToChapter(newChapterId, sectionTitle);
                });
            });
            return newProject;
        });

        toast({
            title: 'Table of Contents Applied',
            description: `${results.tableOfContents.length} chapters and their sections have been created.`,
        });
        onOpenChange(false);
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
                <div className="py-4 space-y-4">
                    <form id="toc-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label htmlFor="project-description">Project Description</Label>
                            <Textarea
                                id="project-description"
                                {...form.register('projectDescription')}
                                rows={6}
                                placeholder="The AI will use your main project description to generate the TOC..."
                                disabled={mutation.isPending}
                            />
                            {form.formState.errors.projectDescription && (
                                <p className="text-sm text-destructive mt-1">{form.formState.errors.projectDescription.message}</p>
                            )}
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
                        <Button type="button" onClick={handleApplyToc}>Apply to Project</Button>
                    )}
                    <Button type="submit" form="toc-form" disabled={mutation.isPending || !form.formState.isValid}>
                        {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                        Generate (1 Credit)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

    