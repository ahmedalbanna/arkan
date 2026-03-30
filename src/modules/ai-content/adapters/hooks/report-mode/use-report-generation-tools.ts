
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { toast, useBuilderStore } from '@/hooks';
import { useMemo, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { DragEndEvent } from '@dnd-kit/core';
import { useAiActions } from './use-ai-actions';
import { applyReportTemplate } from '@/modules/projects/infrastructure/io/template';

export function useReportGenerationTools() {
    const { t } = useLocalization();
    const { project, updateProject } = useBuilderStore();

    const [isBuildProjectDialogOpen, setIsBuildProjectDialogOpen] = useState(false);

    // Local state for build mode
    const [isProjectBuildMode, setIsProjectBuildMode] = useState(false);
    const [selectedSectionsForBuild, setSelectedSectionsForBuild] = useState<Set<string>>(new Set());

    const { generateProjectMutation } = useAiActions();

    const enterProjectBuildMode = useCallback(() => setIsProjectBuildMode(true), []);
    const exitProjectBuildMode = useCallback(() => {
        setIsProjectBuildMode(false);
        setSelectedSectionsForBuild(new Set());
    }, []);

    const toggleSectionSelection = useCallback((sectionId: string) => {
        setSelectedSectionsForBuild(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(sectionId)) newSelection.delete(sectionId);
            else newSelection.add(sectionId);
            return newSelection;
        });
    }, []);

    const toggleChapterSelection = useCallback((chapterId: string, select: boolean) => {
        if (!project) return;
        const chapter = project.getChapter(chapterId);
        if (!chapter) return;

        setSelectedSectionsForBuild(prev => {
            const newSelection = new Set(prev);
            chapter.sections.forEach(s => {
                if (select) newSelection.add(s.id);
                else newSelection.delete(s.id);
            });
            return newSelection;
        });
    }, [project]);
    
    const toggleSelectAll = useCallback((select: boolean) => {
        if (!project) return;
        if (select) {
            const allSectionIds = new Set(project.sections.map(s => s.id));
            setSelectedSectionsForBuild(allSectionIds);
        } else {
            setSelectedSectionsForBuild(new Set());
        }
    }, [project]);

    const handleAddChapter = useCallback(() => {
        updateProject(p => p.addChapter(uuidv4()));
        toast({ title: "Chapter Created", description: `A new untitled chapter has been added.` });
    }, [updateProject]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || !project) return;
        const activeId = active.id.toString();
        const overId = over.id.toString();
        if (activeId === overId) return;

        updateProject(p => p.moveContentItem(activeId, overId));
    }, [project, updateProject]);

    const chaptersToBuild = useMemo(() => {
        if (!project) return [];
        return project.chapters
          .map(c => c.withProps({ sections: c.sections.filter(s => selectedSectionsForBuild.has(s.id)).map(s => s.toProperties())}))
          .filter(c => c.sections.length > 0);
    }, [project, selectedSectionsForBuild]);

    const onGenerateProject = useCallback(() => {
        if (project && selectedSectionsForBuild.size > 0) {
          generateProjectMutation.mutate({ project, selectedSectionIds: selectedSectionsForBuild });
          setIsBuildProjectDialogOpen(false); // Close dialog on confirm
        }
    }, [project, selectedSectionsForBuild, generateProjectMutation, setIsBuildProjectDialogOpen]);

    return {
        t,
        handleAddChapter,
        handleDragEnd,
        isBuildProjectDialogOpen,
        setIsBuildProjectDialogOpen,
        project,
        isProjectBuildMode,
        enterProjectBuildMode,
        exitProjectBuildMode,
        selectedSectionsForBuild,
        toggleChapterSelection,
        toggleSectionSelection,
        toggleSelectAll,
        onGenerateProject,
        projectMutation: generateProjectMutation,
        chaptersToBuild,
    };
}
