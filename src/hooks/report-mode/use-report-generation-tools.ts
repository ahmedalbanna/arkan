
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
import { writingToolApi } from '@/services/api/writingToolsService';

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

    const [selectedSectionsForChapterGen, setSelectedSectionsForChapterGen] = useState<Record<string, Set<string>>>({});

    // New state for project-level build
    const [selectedChaptersForProjectGen, setSelectedChaptersForProjectGen] = useState<Set<string>>(new Set());
    const [isBuildProjectDialogOpen, setIsBuildProjectDialogOpen] = useState(false);

    const handleChapterSelectionToggle = (chapterId: string) => {
        setSelectedChaptersForProjectGen(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(chapterId)) {
                newSelection.delete(chapterId);
            } else {
                newSelection.add(chapterId);
            }
            return newSelection;
        });
    };

    const handleSectionSelectionToggle = (chapterId: string, sectionId: string) => {
        setSelectedSectionsForChapterGen(prev => {
            const newSelection = { ...prev };
            if (!newSelection[chapterId]) {
                newSelection[chapterId] = new Set();
            }
            const chapterSelection = new Set(newSelection[chapterId]);
            if (chapterSelection.has(sectionId)) {
                chapterSelection.delete(sectionId);
            } else {
                chapterSelection.add(sectionId);
            }
            newSelection[chapterId] = chapterSelection;
            return newSelection;
        });
    };

    const handleSelectAllSectionsInChapter = (chapterId: string, select: boolean) => {
        setSelectedSectionsForChapterGen(prev => {
            const newSelection = { ...prev };
            const chapter = project?.getChapter(chapterId);
            if (select && chapter) {
                newSelection[chapterId] = new Set(chapter.sections.map(s => s.id));
            } else {
                newSelection[chapterId] = new Set();
            }
            return newSelection;
        });
    };

    const handleEnterBuildMode = (chapterId: string) => {
        setChapterInBuildMode(chapterId);
    };

    const handleCancelBuildMode = () => {
        if (chapterInBuildMode) {
            setSelectedSectionsForChapterGen(prev => ({ ...prev, [chapterInBuildMode]: new Set() }));
        }
        setChapterInBuildMode(null);
    };

    const chapterMutation = useMutation({
        mutationKey: ['generateChapterContent'],
        mutationFn: async (chapterId: string) => {
            const selectedIds = selectedSectionsForChapterGen[chapterId];
            if (!project || !userProfile || !firebaseUser) throw new Error("Project or user not found.");
            if (!selectedIds || selectedIds.size === 0) {
                 toast({ title: 'No Sections Selected', description: 'Please select at least one section to build the chapter content.', variant: 'destructive' });
                 throw new Error('No sections selected.');
            }
            const chapter = project.getChapter(chapterId);
            if (!chapter) throw new Error("Chapter not found.");

            const token = await firebaseUser.getIdToken();
            const sectionsToGenerate = chapter.sections.filter(s => selectedIds.has(s.id));

            const sectionInstructions = sectionsToGenerate.map(section => {
                const contextSectionsContent = Object.keys(section.context.sections || {})
                    .filter(key => section.context.sections[key])
                    .map(key => {
                        const content = project.getSectionContent(key);
                        return `--- Context from Section: ${project.getSection(key)?.title} ---\n${content}`;
                    })
                    .join('\n\n');

                const externalContextContent = (project.externalContext || [])
                    .filter(item => section.context.externalContext?.[item.id])
                    .map(file => `--- Context from File: ${file.fileName} ---\n${file.content}`)
                    .join('\n\n');

                const fullContext = [contextSectionsContent, externalContextContent].filter(Boolean).join('\n\n');

                return {
                    title: section.title,
                    prompt: section.prompt,
                    guidelines: section.guidelines,
                    instructionText: section.instruction,
                    context: fullContext,
                };
            });

            const body = {
                flow: 'generate-chapter',
                chapterTitle: chapter.title,
                sectionInstructions: sectionInstructions,
            };

            const result = await writingToolApi<any, { markdownContent: string }>('/api/writing-tools/generate-chapter', { data: body, token });
            return { chapterId, content: result.markdownContent };
        },
        onSuccess: (data) => {
            updateProject(p => p.updateChapter(data.chapterId, c => {
                // When chapter content is generated, it replaces the content of the first selected section
                const firstSelectedId = Array.from(selectedSectionsForChapterGen[data.chapterId] || [])[0];
                if (firstSelectedId) {
                    const updatedProject = p.updateSection(firstSelectedId, s => s.with({ content: data.content }));
                    return updatedProject.getChapter(data.chapterId)!;
                }
                return c;
            }));
            refetchUser();
            toast({ title: 'Chapter Generated', description: 'The AI has generated the content for the chapter.' });
            handleCancelBuildMode(); // Exit build mode after successful generation
        },
        onError: (error: any) => {
            if (error.message !== 'No sections selected.') {
                toast({ title: 'Chapter Generation Error', description: error?.message || 'Failed to generate chapter content.', variant: 'destructive' });
            }
        }
    });
    
    // New Project-level generation mutation
    const projectMutation = useMutation({
        mutationKey: ['generateProjectContent'],
        mutationFn: async () => {
            if (!project || !firebaseUser || selectedChaptersForProjectGen.size === 0) {
                throw new Error("No chapters selected for project generation.");
            }

            const token = await firebaseUser.getIdToken();
            const chaptersToGenerate = project.chapters.filter(c => selectedChaptersForProjectGen.has(c.id));
            
            const chapterInstructions = chaptersToGenerate.map(chapter => {
                const sectionInstructions = chapter.sections.map(section => {
                    // Logic to gather context for each section
                    const contextSectionsContent = Object.keys(section.context.sections || {}).filter(key => section.context.sections[key]).map(key => `...`).join('\n\n');
                    return { title: section.title, prompt: section.prompt, context: contextSectionsContent };
                });
                return { chapterTitle: chapter.title, sectionInstructions };
            });

            const body = {
                flow: 'generate-project',
                projectName: project.name,
                chapterInstructions: chapterInstructions,
            };

            const result = await writingToolApi<any, { chapters: { chapterTitle: string, markdownContent: string }[] }>('/api/writing-tools/generate-project-content', { data: body, token });
            return result.chapters;
        },
        onSuccess: (generatedChapters) => {
            updateProject(p => {
                let newProject = p;
                generatedChapters.forEach(genChapter => {
                    const chapterToUpdate = newProject.chapters.find(c => c.title === genChapter.chapterTitle);
                    if (chapterToUpdate) {
                        // This logic assumes the generated content is for the whole chapter
                        // And places it in the first section.
                        newProject = newProject.updateSection(chapterToUpdate.sections[0].id, s => s.with({ content: genChapter.markdownContent }));
                    }
                });
                return newProject;
            });
            refetchUser();
            toast({ title: 'Project Built', description: 'Content for selected chapters has been generated.' });
            setIsBuildProjectDialogOpen(false);
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
        selectedSectionsForChapterGen,
        handleSectionSelectionToggle,
        handleSelectAllSectionsInChapter,
        chapterInBuildMode,
        handleEnterBuildMode,
        handleCancelBuildMode,
        isTemplateDialogOpen,
        setIsTemplateDialogOpen,
        selectedChaptersForProjectGen,
        handleChapterSelectionToggle,
        isBuildProjectDialogOpen,
        setIsBuildProjectDialogOpen,
    };
}
