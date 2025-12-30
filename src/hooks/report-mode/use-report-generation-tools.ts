
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
    const { project, updateProject } = useBuilderStore();
    const { userProfile, refetchUser, firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const [newChapterTitle, setNewChapterTitle] = useState('');
    const [showTocInput, setShowTocInput] = useState(false);
    const [isGenerateTocOpen, setIsGenerateTocOpen] = useState(false);

    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [chapterInBuildMode, setChapterInBuildMode] = useState<string | null>(null);

    const [selectedSectionsForBuild, setSelectedSectionsForBuild] = useState<Set<string>>(new Set());
    const [isProjectBuildMode, setIsProjectBuildMode] = useState(false);

    const [isBuildProjectDialogOpen, setIsBuildProjectDialogOpen] = useState(false);

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
        // Pre-select all sections in this chapter when entering build mode for it
        const chapter = project?.getChapter(chapterId);
        if (chapter) {
            const sectionIds = new Set(chapter.sections.map(s => s.id));
            setSelectedSectionsForBuild(sectionIds);
        }
    };

    const handleCancelBuildMode = () => {
        setChapterInBuildMode(null);
        setSelectedSectionsForBuild(new Set()); // Clear selections
    };
    
    const finalProjectPrompt = useMemo(() => {
        if (!project || selectedSectionsForBuild.size === 0) return '';
        return PromptBuilder.buildProjectPrompt(project, selectedSectionsForBuild);
    }, [project, selectedSectionsForBuild]);

    const getContextNames = (section: Section): string[] => {
      if (!project) return [];
      const sectionContexts = Object.keys(section.context?.sections || {})
        .filter(key => section.context.sections[key])
        .map(key => project.getSection(key)?.title)
        .filter(Boolean) as string[];

      const fileContexts = Object.keys(section.context?.externalContext || {})
        .filter(key => section.context.externalContext[key])
        .map(key => project.externalContext.find(f => f.id === key)?.fileName)
        .filter(Boolean) as string[];

      return [...sectionContexts, ...fileContexts];
    };

    const chaptersToBuild = useMemo(() => {
      if (!project) return [];
      return project.content
        .map(c => ({
          ...c,
          sections: c.sections.filter(s => selectedSectionsForBuild.has(s.id))
        }))
        .filter(c => c.sections.length > 0);
    }, [project, selectedSectionsForBuild]);


    const chapterMutation = useMutation({
        mutationKey: ['generateChapterContent'],
        mutationFn: async (chapterId: string) => {
            if (!project || !userProfile || !firebaseUser) throw new Error("Project or user not found.");
            
            const chapter = project.getChapter(chapterId);
            if (!chapter) throw new Error("Chapter not found.");
            
            const sectionsToGenerate = chapter.sections.filter(s => selectedSectionsForBuild.has(s.id));

            if (sectionsToGenerate.length === 0) {
                 toast({ title: 'No Sections Selected', description: 'Please select at least one section to build the chapter content.', variant: 'destructive' });
                 throw new Error('No sections selected.');
            }

            const token = await firebaseUser.getIdToken();
            const body = {
                flow: 'generate-chapter',
                chapterTitle: chapter.title,
                sectionInstructions: sectionsToGenerate.map(s => ({
                  title: s.title,
                  prompt: s.buildActionPrompt(),
                  guidelines: s.guidelines,
                  instructionText: PromptBuilder.buildSectionPrompt(s, project),
                  context: getContextNames(s).join(', ')
                }))
            };

            const result = await writingToolApi<any, { markdownContent: string }>(`/api/writing-tools/generate-chapter`, { data: body, token });
            return { chapterId, content: result.markdownContent };
        },
        onSuccess: (data) => {
            const chapter = project?.getChapter(data.chapterId);
            if (!chapter) return;
            const sections = chapter.sections.filter(s => selectedSectionsForBuild.has(s.id));
            if (sections.length === 0) return;

            updateProject(p => {
                let updatedProject = p;
                const newContent = data.content;
                
                // Clear all selected sections first
                for (const sec of sections) {
                    updatedProject = updatedProject.updateSection(sec.id, s => s.with({ content: '' }));
                }

                // Put all content into the first selected section
                updatedProject = updatedProject.updateSection(sections[0].id, s => s.with({ content: newContent }));

                return updatedProject;
            });
            refetchUser();
            toast({ title: 'Chapter Generated', description: 'The AI has generated the content for the chapter.' });
            handleCancelBuildMode();
        },
        onError: (error: any) => {
            if (error.message !== 'No sections selected.') {
                toast({ title: 'Chapter Generation Error', description: error?.message || 'Failed to generate chapter content.', variant: 'destructive' });
            }
        }
    });
    
    const projectMutation = useMutation({
        mutationKey: ['generateProjectContent'],
        mutationFn: async () => {
            if (!project || !firebaseUser || selectedSectionsForBuild.size === 0) {
                throw new Error("No sections selected for project generation.");
            }

            const token = await firebaseUser.getIdToken();
            
            const body = {
                flow: 'generate-project-from-full-prompt',
                fullPrompt: finalProjectPrompt,
            };

            const result = await writingToolApi<any, { chapters: { chapterTitle: string, markdownContent: string }[] }>(`/api/writing-tools/generate-project-from-full-prompt`, { data: body, token });
            return result.chapters;
        },
        onSuccess: (generatedChapters) => {
            updateProject(p => {
                let newProject = p;
                generatedChapters.forEach(genChapter => {
                    const chapterToUpdate = newProject.chapters.find(c => c.title === genChapter.chapterTitle);
                    if (chapterToUpdate) {
                        newProject = newProject.updateSection(chapterToUpdate.sections[0].id, s => s.with({ content: genChapter.markdownContent }));
                    }
                });
                return newProject;
            });
            refetchUser();
            toast({ title: 'Project Built', description: 'Content for selected chapters has been generated.' });
            setIsBuildProjectDialogOpen(false);
            exitProjectBuildMode();
        },
        onError: (error: any) => {
            toast({ title: 'Project Build Error', description: error?.message || 'Failed to build project content.', variant: 'destructive' });
        }
    });

    const sectionMutation = useMutation({
        mutationKey: ['generateReportSection'],
        mutationFn: async (sectionId: string) => {
            if (!project || !userProfile || !firebaseUser) throw new Error("Project or user not found.");

            const section = project.getSection(sectionId);
            if (!section) throw new Error("Section not found.");

            const token = await firebaseUser.getIdToken();
            const body = {
                flow: 'generate-section',
                sectionToGenerate: section.id as SectionName,
                prompt: section.buildActionPrompt(), // Use the builder
                system: section.buildSystemPrompt(), // Use the builder
                otherSections: {}, 
                externalContext: [],
                guidelines: section.guidelines,
                instructionText: PromptBuilder.buildSectionPrompt(section, project),
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
        sectionMutation.mutate(sectionId as string);
    };

    const onGenerateChapter = (chapterId: string) => {
        chapterMutation.mutate(chapterId);
    };

    const onGenerateProject = () => {
        projectMutation.mutate();
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
            const newProject = project.with({ content: [] }); // Start with clean content
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
        sectionMutation,
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
        onGenerateSection,
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
        // new properties for the dialog
        chaptersToBuild,
        getContextNames
    };
}
