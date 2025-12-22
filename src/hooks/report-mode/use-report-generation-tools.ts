
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
import { Chapter } from '@/lib/models';

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
        const updatedProject = project?.addChapter();
        if (updatedProject) {
            updateProject(() => updatedProject);
            toast({ title: "Chapter Created", description: `A new untitled chapter has been added.` });
        }
    };

    const handleAddSectionToChapter = (chapterId: string) => {
        const updatedProject = project?.addSectionToChapter(chapterId, "New Section");
        if (updatedProject) {
            updateProject(() => updatedProject);
        }
    };

    const handleDeleteSection = (chapterId: string, sectionId: string) => {
        const chapter = project?.getChapter(chapterId);
        if (chapter) {
            const updatedChapter = chapter.removeSection(sectionId);
            const updatedProject = project!.updateChapter(chapterId, () => updatedChapter);
            updateProject(() => updatedProject);
        }
    };

    const handleDeleteChapter = (chapterId: string) => {
        const updatedProject = project?.removeChapter(chapterId);
        if (updatedProject) {
            updateProject(() => updatedProject);
            toast({ title: "Chapter Deleted", description: 'The chapter has been removed from your project.' });
        }
    };

    const handleCreateFromToc = (tocText: string) => {
        if (!tocText.trim()) {
            toast({ title: "Table of Contents is empty", description: "Please paste the section titles into the text area.", variant: "destructive" });
            return;
        }

        const lines = tocText.split('\n').map(line => line.trim()).filter(Boolean);
        let chaptersCreated = 0;
        let sectionsCreated = 0;

        let newProject = project ? project.with({ chapters: [] }) : new Project({ chapters: [] });
        let currentChapter: Chapter | null = null;

        lines.forEach(line => {
            const isChapter = !line.match(/^s*d+.d+/);
            if (isChapter) {
                const chapterTitle = line.replace(/^d+.?s*/, '').trim();
                if (chapterTitle) {
                    newProject = newProject.addChapter(chapterTitle);
                    currentChapter = newProject.chapters[newProject.chapters.length - 1];
                    chaptersCreated++;
                }
            } else if (currentChapter) {
                const sectionTitle = line.replace(/^d+.d+.?s*/, '').trim();
                if (sectionTitle) {
                    newProject = newProject.addSectionToChapter(currentChapter.id, sectionTitle);
                    sectionsCreated++;
                }
            }
        });

        updateProject(() => newProject);

        toast({
            title: "Structure Created",
            description: `Created ${chaptersCreated} chapters and ${sectionsCreated} sections.`,
        });
        setShowTocInput(false);
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
            const oldIndex = project.chapters.findIndex(c => c.id === activeId);
            const newIndex = project.chapters.findIndex(c => c.id === overId);
            const updatedProject = project.updateChaptersOrder(arrayMove(project.chapters.map(c => c.id), oldIndex, newIndex));
            updateProject(() => updatedProject);
        } else {
            const activeContainer = project.chapters?.find(c => c.sections.some(s => s.id === activeId));
            const overContainer = project.chapters?.find(c => c.sections.some(s => s.id === overId)) || project.chapters?.find(c => c.id === overId);

            if (!activeContainer || !overContainer) return;

            if (activeContainer.id === overContainer.id) {
                const updatedProject = project.updateChapter(activeContainer.id, c => {
                    const oldIndex = c.sections.findIndex(s => s.id === activeId);
                    const newIndex = c.sections.findIndex(s => s.id === overId);
                    return c.with({ sections: arrayMove([...c.sections], oldIndex, newIndex) });
                });
                updateProject(() => updatedProject);
            } else {
                const updatedProject = project.moveSectionToChapter(activeId, activeContainer.id, overContainer.id);
                updateProject(() => updatedProject);
            }
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
        handleCreateFromToc,
        handleDragEnd,
        handleDeleteSection,
        handleDeleteChapter,
        handleAddSectionToChapter,
    };
}
