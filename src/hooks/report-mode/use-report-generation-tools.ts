
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { toast, useBuilderStore } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { SectionName } from '@/ai/schemas';
import { generateReportSectionApi } from '@/services/api/reportService';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Chapter, Project, Section } from '@/lib/models';
import { writingToolApi } from '@/services/api/writingToolsService';
import { PromptBuilder } from '@/lib/prompt-builder';

export function useReportGenerationTools() {
    const { t } = useLocalization();
    const { 
        project, 
        updateProject,
        chapterMutation,
        projectMutation,
        onGenerateChapter,
        onGenerateProject,
        selectedSectionsForBuild,
        handleChapterSelectionToggle,
        handleSelectAllChapters,
        handleSectionSelectionToggle,
     } = useBuilderStore();
    const { userProfile, refetchUser, firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const [newChapterTitle, setNewChapterTitle] = useState('');
    const [showTocInput, setShowTocInput] = useState(false);
    const [isGenerateTocOpen, setIsGenerateTocOpen] = useState(false);

    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [chapterInBuildMode, setChapterInBuildMode] = useState<string | null>(null);

    const [isProjectBuildMode, setIsProjectBuildMode] = useState(false);

    const [isBuildProjectDialogOpen, setIsBuildProjectDialogOpen] = useState(false);

    const enterProjectBuildMode = () => setIsProjectBuildMode(true);
    const exitProjectBuildMode = () => {
        setIsProjectBuildMode(false);
        // Using the store's action to reset selection
        useBuilderStore.setState({ selectedSectionsForBuild: new Set() });
    };

    const handleEnterBuildMode = (chapterId: string) => {
        setChapterInBuildMode(chapterId);
        const chapter = project?.getChapter(chapterId);
        if (chapter) {
            const sectionIds = new Set(chapter.sections.map(s => s.id));
             // Using the store's action to set selection
            useBuilderStore.setState({ selectedSectionsForBuild: sectionIds });
            setIsBuildProjectDialogOpen(true);
        }
    };

    const handleCancelBuildMode = () => {
        setChapterInBuildMode(null);
        // Using the store's action to reset selection
        useBuilderStore.setState({ selectedSectionsForBuild: new Set() });
    };
    
    const finalProjectPrompt = useMemo(() => {
        if (!project || selectedSectionsForBuild.size === 0) return '';
        return PromptBuilder.buildProjectPrompt(project, selectedSectionsForBuild);
    }, [project, selectedSectionsForBuild]);

    const getContextNames = (section: Section): string[] => {
      if (!project) return [];
      const sectionContexts = Object.keys(section.context?.sections || {})
        .filter(key => section.context.sections?.[key])
        .map(key => project.getSection(key)?.title)
        .filter(Boolean) as string[];

      const fileContexts = Object.keys(section.context?.externalContext || {})
        .filter(key => section.context.externalContext?.[key])
        .map(key => project.externalContext.find(f => f.id === key)?.fileName)
        .filter(Boolean) as string[];

      return [...sectionContexts, ...fileContexts];
    };

    const chaptersToBuild = useMemo(() => {
      if (!project) return [];
      
      if(chapterInBuildMode) {
        const chapter = project.getChapter(chapterInBuildMode);
        return chapter ? [chapter] : [];
      }

      return project.content
        .filter((item): item is Chapter => item instanceof Chapter)
        .map(c => c.with({ sections: c.sections.filter(s => selectedSectionsForBuild.has(s.id))}))
        .filter(c => c.sections.length > 0);
    }, [project, selectedSectionsForBuild, chapterInBuildMode]);

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

        if (project) {
            const newProject = project.with({ content: [] }); 
            const lines = tocText.split('\n').filter(line => line.trim() !== '');
            let currentChapter: Chapter | null = null;
    
            lines.forEach(line => {
                const isSection = line.startsWith('  ') || line.startsWith('\t');
                const title = line.trim().replace(/^\d+\.\d*\s*/, '');
    
                if (!isSection) {
                    if (currentChapter) {
                        newProject.addChapter(currentChapter);
                    }
                    currentChapter = new Chapter({ title, sections: [] });
                } else if (currentChapter) {
                    currentChapter = currentChapter.addSection(new Section({ title, type: 'report' }));
                }
            });
    
            if (currentChapter) {
                newProject.addChapter(currentChapter);
            }
            
            updateProject(_ => newProject);

            toast({
                title: "Structure Created",
                description: `Created ${newProject.chapters.length} chapters and their sections.`,
            });
            setShowTocInput(false);
            setNewChapterTitle('');
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || !project) return;
        const activeId = active.id.toString();
        const overId = over.id.toString();
        if (activeId === overId) return;

        updateProject(p => {
            const activeItem = p.findContentItem(activeId);
            const overItem = p.findContentItem(overId);

            if (!activeItem || !overItem) return p;

            if (activeItem.parentChapterId === null && overItem.parentChapterId === null) {
                const oldIndex = p.content.findIndex(item => item.id === activeId);
                const newIndex = p.content.findIndex(item => item.id === overId);
                return p.with({ content: arrayMove([...p.content], oldIndex, newIndex) });
            }

            if (activeItem.parentChapterId && activeItem.parentChapterId === overItem.parentChapterId) {
                return p.updateChapter(activeItem.parentChapterId, c => {
                    const oldIndex = c.sections.findIndex(s => s.id === activeId);
                    const newIndex = c.sections.findIndex(s => s.id === overId);
                    return c.with({ sections: arrayMove([...c.sections], oldIndex, newIndex) });
                });
            }
            return p; 
        });
    };

    return {
        t,
        project,
        chapterMutation,
        projectMutation,
        onGenerateProject,
        userProfile,
        newChapterTitle,
        setNewChapterTitle,
        showTocInput,
        setShowTocInput,
        isGenerateTocOpen,
        setIsGenerateTocOpen,
        onGenerateChapter,
        handleAddChapter,
        handleAddSection,
        handleCreateFromToc,
        handleDragEnd,
        selectedSectionsForBuild,
        handleSectionSelectionToggle,
        handleChapterSelectionToggle,
        handleSelectAllChapters,
        chapterInBuildMode,
        handleEnterBuildMode,
        handleCancelBuildMode,
        isTemplateDialogOpen,
        setIsTemplateDialogOpen,
        isBuildProjectDialogOpen,
        setIsBuildProjectDialogOpen,
        isProjectBuildMode,
        enterProjectBuildMode,
        exitProjectBuildMode,
        finalProjectPrompt,
        chaptersToBuild,
        getContextNames
    };
}
