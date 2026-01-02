
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { toast, useBuilderStore } from '@/hooks';
import { useMemo, useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';

export function useReportGenerationTools() {
    const { t } = useLocalization();
    const { 
        project, 
        updateProject,
        isProjectBuildMode,
        enterProjectBuildMode,
        exitProjectBuildMode,
        selectedSectionsForBuild,
        toggleChapterSelection,
        toggleSectionSelection,
        toggleSelectAll,
        onGenerateProject,
        projectMutation,
    } = useBuilderStore();

    const [newChapterTitle, setNewChapterTitle] = useState('');
    const [showTocInput, setShowTocInput] = useState(false);
    const [isGenerateTocOpen, setIsGenerateTocOpen] = useState(false);
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [isBuildProjectDialogOpen, setIsBuildProjectDialogOpen] = useState(false);

    const handleAddChapter = () => {
        updateProject(p => p.addChapter());
        toast({ title: "Chapter Created", description: `A new untitled chapter has been added.` });
    };

    const handleCreateFromToc = (tocText: string) => {
        if (!tocText.trim()) {
            toast({ title: "Table of Contents is empty", description: "Please paste the section titles into the text area.", variant: "destructive" });
            return;
        }

        updateProject(p => {
            if (!p) return;
            return p.with({ content: p.parseAndSetContentFromToc(tocText) });
        });
        
        toast({
            title: "Structure Created",
            description: `Created new chapters and sections from your input.`,
        });
        setShowTocInput(false);
        setNewChapterTitle('');
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || !project) return;
        const activeId = active.id.toString();
        const overId = over.id.toString();
        if (activeId === overId) return;

        updateProject(p => p.moveContentItem(activeId, overId));
    };

    const chaptersToBuild = useMemo(() => {
        if (!project) return [];
        return project.chapters
          .map(c => c.with({ sections: c.sections.filter(s => selectedSectionsForBuild.has(s.id))}))
          .filter(c => c.sections.length > 0);
    }, [project, selectedSectionsForBuild]);

    return {
        t,
        newChapterTitle,
        setNewChapterTitle,
        showTocInput,
        setShowTocInput,
        isGenerateTocOpen,
        setIsGenerateTocOpen,
        handleAddChapter,
        handleCreateFromToc,
        handleDragEnd,
        isTemplateDialogOpen,
        setIsTemplateDialogOpen,
        isBuildProjectDialogOpen,
        setIsBuildProjectDialogOpen,
        // State from Zustand
        project,
        isProjectBuildMode,
        enterProjectBuildMode,
        exitProjectBuildMode,
        selectedSectionsForBuild,
        toggleChapterSelection,
        toggleSectionSelection,
        toggleSelectAll,
        onGenerateProject,
        projectMutation,
        chaptersToBuild,
    };
}
