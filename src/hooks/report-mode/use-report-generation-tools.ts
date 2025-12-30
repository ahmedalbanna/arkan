
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { toast, useBuilderStore } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useMemo, useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Chapter, Section } from '@/lib/models';
import { useAiActions } from './use-ai-actions';

export function useReportGenerationTools() {
    const { t } = useLocalization();
    const { 
        project, 
        updateProject,
    } = useBuilderStore();

    const {
        sectionMutation,
        chapterMutation,
        projectMutation,
        getContextNames
    } = useAiActions();
    
    const [newChapterTitle, setNewChapterTitle] = useState('');
    const [showTocInput, setShowTocInput] = useState(false);
    const [isGenerateTocOpen, setIsGenerateTocOpen] = useState(false);
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

    // State for build modes
    const [isProjectBuildMode, setIsProjectBuildMode] = useState(false);
    const [isBuildProjectDialogOpen, setIsBuildProjectDialogOpen] = useState(false);
    const [chapterInBuildMode, setChapterInBuildMode] = useState<string | null>(null);

    // State for section selection
    const [selectedSectionsForBuild, setSelectedSectionsForBuild] = useState<Set<string>>(new Set());

    const enterProjectBuildMode = () => setIsProjectBuildMode(true);
    const exitProjectBuildMode = () => {
        setIsProjectBuildMode(false);
        setSelectedSectionsForBuild(new Set()); // Clear selection on exit
    };
    
    const handleSectionSelectionToggle = (sectionId: string) => {
        setSelectedSectionsForBuild(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(sectionId)) {
                newSelection.delete(sectionId);
            } else {
                newSelection.add(sectionId);
            }
            return newSelection;
        });
    };

    const handleChapterSelectionToggle = (chapterId: string, select: boolean) => {
        const chapter = project?.getChapter(chapterId);
        if (!chapter) return;

        setSelectedSectionsForBuild(prev => {
            const newSelection = new Set(prev);
            chapter.sections.forEach(section => {
                if (select) {
                    newSelection.add(section.id);
                } else {
                    newSelection.delete(section.id);
                }
            });
            return newSelection;
        });
    };
    
    const handleSelectAllChapters = (select: boolean) => {
        if (!project) return;
        const allSectionIds = new Set(project.sections.map(s => s.id));
        setSelectedSectionsForBuild(select ? allSectionIds : new Set());
    };

    const handleEnterBuildMode = (chapterId: string) => {
        setChapterInBuildMode(chapterId);
        const chapter = project?.getChapter(chapterId);
        if (chapter) {
            // Select all sections within this chapter when entering build mode for it
            const sectionIds = new Set(chapter.sections.map(s => s.id));
            setSelectedSectionsForBuild(sectionIds);
            setIsBuildProjectDialogOpen(true);
        }
    };
    
    const onGenerateProject = () => {
        if (!project) return;
        projectMutation.mutate(project, {
            onSuccess: () => setIsBuildProjectDialogOpen(false),
        });
    };

    const onGenerateChapter = (chapterId: string) => {
        if (!project) return;
        const chapter = project.getChapter(chapterId);
        if (!chapter) return;

        // Use the selected sections from the state
        const sectionsToBuild = chapter.sections.filter(s => selectedSectionsForBuild.has(s.id));
        if (sectionsToBuild.length === 0) {
            toast({ title: 'No Sections Selected', description: 'Please select at least one section to build the chapter content.', variant: 'destructive' });
            return;
        }

        chapterMutation.mutate({ chapter, project, sectionsToBuild }, {
            onSuccess: () => {
                setIsBuildProjectDialogOpen(false);
                setChapterInBuildMode(null);
                setSelectedSectionsForBuild(new Set());
            }
        });
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

    const chaptersToBuild = useMemo(() => {
        if (!project) return [];
        
        if(chapterInBuildMode) {
            const chapter = project.getChapter(chapterInBuildMode);
            if (!chapter) return [];
            // When building a single chapter, ensure we only consider its selected sections
            const relevantSections = chapter.sections.filter(s => selectedSectionsForBuild.has(s.id));
            return [chapter.with({ sections: relevantSections })];
        }
  
        // For full project build
        return project.content
          .filter((item): item is Chapter => item instanceof Chapter)
          .map(c => c.with({ sections: c.sections.filter(s => selectedSectionsForBuild.has(s.id))}))
          .filter(c => c.sections.length > 0);
      }, [project, selectedSectionsForBuild, chapterInBuildMode]);

    return {
        t,
        project,
        chapterMutation,
        projectMutation,
        onGenerateProject,
        onGenerateChapter,
        newChapterTitle,
        setNewChapterTitle,
        showTocInput,
        setShowTocInput,
        isGenerateTocOpen,
        setIsGenerateTocOpen,
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
        isTemplateDialogOpen,
        setIsTemplateDialogOpen,
        isBuildProjectDialogOpen,
        setIsBuildProjectDialogOpen,
        isProjectBuildMode,
        enterProjectBuildMode,
        exitProjectBuildMode,
        chaptersToBuild,
        getContextNames,
    };
}
