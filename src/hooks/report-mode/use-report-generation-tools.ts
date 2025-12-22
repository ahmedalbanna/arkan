
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { toast, useBuilderStore } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { SectionName } from '@/ai/schemas';
import { generateReportSectionApi } from '@/services/api/reportService';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Chapter, Project } from '@/lib/models';

export function useReportGenerationTools() {
    const { t } = useLocalization();
    const { project, updateProject } = useBuilderStore();
    const { userProfile, refetchUser, firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const [newChapterTitle, setNewChapterTitle] = useState('');
    const [showTocInput, setShowTocInput] = useState(false);
    const [isGenerateTocOpen, setIsGenerateTocOpen] = useState(false);

    const agentMutation = useMutation({
        mutationKey: ['generateReportSection'],
        mutationFn: async (sectionId: string) => {
            if (!project || !userProfile || !firebaseUser) throw new Error("Project or user not found.");

            const section = project.getSection(sectionId);
            if (!section) throw new Error("Section not found.");

            const token = await firebaseUser.getIdToken();
            const context = section.context;

            let otherSectionsContext: Record<string, string> = {};
            Object.keys(context.sections || {}).forEach(key => {
                if (context.sections[key]) {
                    const content = project.getSectionContent(key);
                    if (content) otherSectionsContext[key] = content;
                }
            });

            const externalContextFiles = (project.externalContext || []).filter(item => context.externalContext?.[item.id]);
            const body = {
                flow: 'generate-section',
                sectionToGenerate: section.id as SectionName,
                prompt: section.prompt,
                otherSections: otherSectionsContext,
                externalContext: externalContextFiles,
                guidelines: section.guidelines,
                instructionText: section.instruction,
            };

            const result = await generateReportSectionApi(body, token);
            const content = result?.[section.id] ?? Object.values(result || {})[0] as string | undefined;
            if (!content) {
                toast({ title: 'Generation failed', description: `No content returned for section ${section.id}.`, variant: 'destructive' });
                throw new Error('Empty generation result');
            }
            return { sectionId: section.id, content };
        },
        onSuccess: (data) => {
            updateProject(p => p.updateSection(data.sectionId, s => s.with({ content: data.content })));
            refetchUser();
            toast({ title: 'Section Generated', description: 'The AI has generated the content for your section.' });
        },
        onError: (error: any) => {
            toast({ title: 'Generation error', description: error?.message || 'Failed to generate section', variant: 'destructive' });
        },
    });

    const onGenerateSection = (sectionId: SectionName) => {
        agentMutation.mutate(sectionId as string);
    };

    const handleAddChapter = () => {
        updateProject(p => p.addChapter());
        toast({ title: "Chapter Created", description: `A new untitled chapter has been added.` });
    };

    const handleAddSection = (chapterId: string) => {
        updateProject(p => p.addSectionToChapter(chapterId, 'Untitled Section'));
        toast({ title: "Section Added", description: `A new section has been added.` });
    };

    const handleCreateFromToc = (tocText: string) => {
        if (!tocText.trim()) {
            toast({ title: "Table of Contents is empty", description: "Please paste the section titles into the text area.", variant: "destructive" });
            return;
        }

        updateProject(p => {
            let newProject = p.with({ chapters: [] }); // Clear existing chapters
            const lines = tocText.split('\n').map(line => line.trim()).filter(Boolean);
            let currentChapterId: string | null = null;
            let chaptersCreated = 0;
            let sectionsCreated = 0;

            lines.forEach(line => {
                const isSection = line.match(/^\s*\d+\.\d+/); // Matches "1.1", " 2.3 ", etc.
                const isChapter = !isSection;

                if (isChapter) {
                    const chapterTitle = line.replace(/^\d+\.?\s*/, '').trim();
                    if (chapterTitle) {
                        newProject = newProject.addChapter(chapterTitle);
                        currentChapterId = newProject.chapters[newProject.chapters.length - 1].id;
                        chaptersCreated++;
                    }
                } else if (currentChapterId) {
                    const sectionTitle = line.replace(/^\d+\.\d+\.?\s*/, '').trim();
                    if (sectionTitle) {
                        newProject = newProject.addSectionToChapter(currentChapterId, sectionTitle);
                        sectionsCreated++;
                    }
                }
            });
            toast({
                title: "Structure Created",
                description: `Created ${chaptersCreated} chapters and ${sectionsCreated} sections.`,
            });
            setShowTocInput(false);
            setNewChapterTitle('');
            return newProject;
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || !project) return;
        const activeId = active.id.toString();
        const overId = over.id.toString();
        if (activeId === overId) return;

        const isChapterDrag = project.chapters?.some(c => c.id === activeId);

        if (isChapterDrag) {
            if (!project.chapters?.some(c => c.id === overId)) return;
            updateProject(p => {
                const oldIndex = p.chapters.findIndex(c => c.id === activeId);
                const newIndex = p.chapters.findIndex(c => c.id === overId);
                return p.updateChaptersOrder(arrayMove(p.chapters.map(c => c.id), oldIndex, newIndex));
            });
        } else {
             updateProject(p => {
                const activeContainer = p.chapters?.find(c => c.sections.some(s => s.id === activeId));
                const overContainer = p.chapters?.find(c => c.sections.some(s => s.id === overId)) || p.chapters?.find(c => c.id === overId);

                if (!activeContainer || !overContainer) return p;

                if (activeContainer.id === overContainer.id) {
                    return p.updateChapter(activeContainer.id, c => {
                        const oldIndex = c.sections.findIndex(s => s.id === activeId);
                        const newIndex = c.sections.findIndex(s => s.id === overId);
                        return c.with({ sections: arrayMove([...c.sections], oldIndex, newIndex) });
                    });
                } else {
                    return p.moveSectionToChapter(activeId, activeContainer.id, overContainer.id);
                }
             });
        }
    };

    return {
        t,
        project,
        agentMutation,
        userProfile,
        newChapterTitle,
        setNewChapterTitle,
        showTocInput,
        setShowTocInput,
        isGenerateTocOpen,
        setIsGenerateTocOpen,
        onGenerateSection,
        handleAddChapter,
        handleAddSection,
        handleCreateFromToc,
        handleDragEnd,
    };
}
