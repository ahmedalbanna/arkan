
'use client';

import { Chapter, Project, Section, TocSection, type ProjectProperties } from '@/lib/models';
import { localProjectService } from '@/services/local-project-service';
import { useEffect } from 'react';
import { create } from 'zustand';
import { useAuth } from '@/context/AuthContext';
import { toast } from '../util/use-toast';
import { parseMarkdownToContent } from '../util/useMarkdownParser';
import { useMutation } from '@tanstack/react-query';
import { generateReportSectionApi } from '@/services/api/reportService';
import { useAiActions } from '../report-mode/use-ai-actions';
import { writingToolApi } from '@/services/api/writingToolsService';
import { PromptBuilder } from '@/lib/prompt-builder';
import type { SectionName } from '@/ai/schemas';

type ActiveView = 'cover-page' | 'report-content';

interface BuilderState {
    project: Project | null;
    hasUnsavedChanges: boolean;
    isStoreInitialized: boolean;
    sectionMutation: any; // Simplified for this example, consider a more specific type
    chapterMutation: any;
    projectMutation: any;
    selectedSectionsForBuild: Set<string>;
    isProjectBuildMode: boolean;
    
    initializeStore: () => void;
    setHasUnsavedChanges: (hasChanges: boolean) => void;
    updateProject: (updater: (project: Project) => void | Project) => void;
    loadProject: (projectData: ProjectProperties) => void;
    loadProjectFromFile: (file: File) => Promise<void>;
    newSession: () => void;
    applyTableOfContents: (tocData: TocSection[]) => void;
    setContentFromMarkdown: (markdown: string) => void;

    // Actions moved from hooks
    onGenerateSection: (sectionId: string) => void;
    onGenerateChapter: (chapterId: string) => void;
    onGenerateProject: () => void;

    // Build mode state management
    enterProjectBuildMode: () => void;
    exitProjectBuildMode: () => void;
    toggleSectionSelection: (sectionId: string) => void;
    toggleChapterSelection: (chapterId: string, select: boolean) => void;
    toggleSelectAll: (select: boolean) => void;
}

const createNewTemporaryProject = (): Project => new Project({});

const useBuilderStore = create<BuilderState>((set, get) => ({
    project: null,
    hasUnsavedChanges: false,
    isStoreInitialized: false,
    sectionMutation: null,
    chapterMutation: null,
    projectMutation: null,
    selectedSectionsForBuild: new Set(),
    isProjectBuildMode: false,

    initializeStore: () => {
        if (get().isStoreInitialized) return;
        const lastProjectId = localStorage.getItem('lastActiveProjectId');
        if (lastProjectId) {
            localProjectService.getProject(lastProjectId).then(projectData => {
                if (projectData) {
                    set({ project: new Project(projectData), isStoreInitialized: true });
                } else {
                    set({ project: createNewTemporaryProject(), isStoreInitialized: true });
                }
            }).catch(() => {
                set({ project: createNewTemporaryProject(), isStoreInitialized: true });
            });
        } else {
            set({ project: createNewTemporaryProject(), isStoreInitialized: true });
        }
    },

    setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),

    updateProject: (updater) => {
        set(state => {
            if (!state.project) return {};
            const newProject = new Project(state.project.toStateObject());
            const result = updater(newProject);
            return { project: result instanceof Project ? result : newProject, hasUnsavedChanges: true };
        });
    },

    loadProject: (projectData) => {
        const newProject = projectData instanceof Project ? projectData : new Project(projectData);
        localStorage.setItem('lastActiveProjectId', newProject.id);
        set({ project: newProject, hasUnsavedChanges: false });
    },

    loadProjectFromFile: async (file: File) => {
        try {
            const newProject = await Project.fromFile(file);
            get().loadProject(newProject.toStateObject());
            toast({ title: 'Project Loaded', description: `Successfully loaded "${newProject.name}".` });
        } catch (err) {
            toast({ title: 'Load Failed', description: (err as Error).message, variant: 'destructive' });
        }
    },

    newSession: () => {
        if (window.confirm('Are you sure you want to start a new session? Any unsaved changes will be lost.')) {
            localStorage.removeItem('lastActiveProjectId');
            set({ project: createNewTemporaryProject(), hasUnsavedChanges: false });
        }
    },

    applyTableOfContents: (tocData) => {
        get().updateProject(p => {
            p.content = tocData.map(chapterData => {
                const sections = chapterData.sections.map(sectionTitle => new Section({ title: sectionTitle, type: 'report' }));
                return new Chapter({ title: chapterData.title, sections });
            });
        });

        toast({
            title: 'Table of Contents Applied',
            description: `${tocData.length} chapters and their sections have been created.`,
        });
    },
    
    setContentFromMarkdown: (markdown: string) => {
        get().updateProject(p => {
           return p.with({ content: parseMarkdownToContent(markdown, p.content) });
        });
    },

    // AI Actions
    onGenerateSection: (sectionId: string) => {
        const { sectionMutation } = get();
        if (sectionMutation) {
            sectionMutation.mutate(sectionId);
        }
    },
    onGenerateChapter: (chapterId: string) => {
        const { chapterMutation, project, selectedSectionsForBuild } = get();
        if (chapterMutation && project) {
            const chapter = project.getChapter(chapterId);
            if (chapter) {
                const sectionsToBuild = chapter.sections.filter(s => selectedSectionsForBuild.has(s.id));
                chapterMutation.mutate({ chapter, project, sectionsToBuild });
            }
        }
    },
    onGenerateProject: () => {
        const { projectMutation, project, selectedSectionsForBuild } = get();
        if (projectMutation && project) {
            projectMutation.mutate({ project, selectedSectionIds: selectedSectionsForBuild });
        }
    },

    // Build Mode Actions
    enterProjectBuildMode: () => set({ isProjectBuildMode: true }),
    exitProjectBuildMode: () => set({ isProjectBuildMode: false, selectedSectionsForBuild: new Set() }),
    toggleSectionSelection: (sectionId: string) => {
        set(state => {
            const newSelection = new Set(state.selectedSectionsForBuild);
            if (newSelection.has(sectionId)) {
                newSelection.delete(sectionId);
            } else {
                newSelection.add(sectionId);
            }
            return { selectedSectionsForBuild: newSelection };
        });
    },
    toggleChapterSelection: (chapterId, select) => {
        set(state => {
            const chapter = state.project?.getChapter(chapterId);
            if (!chapter) return {};
            const newSelection = new Set(state.selectedSectionsForBuild);
            chapter.sections.forEach(s => {
                if (select) newSelection.add(s.id);
                else newSelection.delete(s.id);
            });
            return { selectedSectionsForBuild: newSelection };
        });
    },
    toggleSelectAll: (select) => {
        set(state => {
            if (!state.project) return {};
            const allSectionIds = new Set(state.project.sections.map(s => s.id));
            return { selectedSectionsForBuild: select ? allSectionIds : new Set() };
        });
    },
}));

export function useInitializeBuilderStore() {
    const { initializeStore, isStoreInitialized, project, updateProject } = useBuilderStore();
    const { firebaseUser, refetchUser } = useAuth();
    
    // Initialize the main store on mount
    useEffect(() => {
        if (!isStoreInitialized) {
            initializeStore();
        }
    }, [initializeStore, isStoreInitialized]);

    // This hook now also initializes the mutations and attaches them to the store.
    // This is a bit of a workaround to get react-query hooks into a zustand store.
    useEffect(() => {
        // Since mutations can't be stored directly, we store an object that can call them.
        useBuilderStore.setState({
            sectionMutation: useMutation({
                mutationKey: ['generateReportSection'],
                mutationFn: async (sectionId: string) => {
                    const currentProject = useBuilderStore.getState().project;
                    if (!currentProject || !firebaseUser) throw new Error("Project or user not found.");
                    
                    const section = currentProject.getSection(sectionId);
                    if (!section) throw new Error("Section not found.");
            
                    const token = await firebaseUser.getIdToken();
                    const body = {
                        sectionToGenerate: section.id as SectionName,
                        prompt: section.buildActionPrompt(),
                        otherSections: section.getContextAsRecord(currentProject),
                        externalContext: section.getExternalContextAsArray(currentProject),
                        guidelines: section.guidelines,
                        instructionText: PromptBuilder.buildSectionPrompt(section, currentProject),
                    };
                    const result = await generateReportSectionApi(body, token);
                    const content = result?.[section.id] ?? Object.values(result || {})[0] as string | undefined;
                    if (!content) throw new Error('Empty generation result');
                    return { sectionId: section.id, content };
                },
                onSuccess: (data) => {
                    updateProject(p => p.updateSection(data.sectionId, s => s.with({ content: data.content })));
                    refetchUser();
                },
                onError: (error: any) => {
                    toast({ title: 'Section Generation Error', description: error.message || 'Failed to generate section', variant: 'destructive' });
                    throw error;
                },
            }),
            chapterMutation: useMutation({
                 mutationKey: ['generateChapterContent'],
                 mutationFn: async (variables: { chapter: Chapter, project: Project, sectionsToBuild: Section[] }) => {
                    const { chapter, project, sectionsToBuild } = variables;
                    if (!firebaseUser) throw new Error("User not found.");
                    if (sectionsToBuild.length === 0) throw new Error('No sections selected.');
            
                    const token = await firebaseUser.getIdToken();
                    const body = {
                        chapterTitle: chapter.title,
                        sectionInstructions: sectionsToBuild.map(s => ({
                          title: s.title, prompt: s.buildActionPrompt(), guidelines: s.guidelines,
                          instructionText: PromptBuilder.buildSectionPrompt(s, project), context: '' // Context handled differently now
                        }))
                    };
            
                    const result = await writingToolApi<any, { markdownContent: string }>(`/api/writing-tools/generate-chapter`, { data: body, token });
                    return { chapterId: chapter.id, content: result.markdownContent, sectionsToBuild };
                },
                onSuccess: (data) => {
                    updateProject(p => {
                        let updatedProject = p;
                        const parsedContent = parseMarkdownToContent(data.content, updatedProject.content);
                        // This logic assumes the AI returns content for all sections in the correct order.
                        const newChapter = parsedContent[0];
                        if (newChapter instanceof Chapter) {
                            updatedProject = updatedProject.updateChapter(data.chapterId, c => c.with({ sections: newChapter.sections }));
                        }
                        return updatedProject;
                    });
                    refetchUser();
                    toast({ title: 'Chapter Generated', description: 'The AI has generated the content for the chapter.' });
                },
                onError: (error: any) => toast({ title: 'Chapter Generation Error', description: error.message, variant: 'destructive' })
            }),
            projectMutation: useMutation({
                mutationKey: ['generateProjectContent'],
                mutationFn: async ({ project, selectedSectionIds }: { project: Project; selectedSectionIds: Set<string> }) => {
                    if (!firebaseUser) throw new Error("User not found.");
                    if (selectedSectionIds.size === 0) throw new Error('No sections were selected for generation.');
                    
                    for (const sectionId of selectedSectionIds) {
                        const sectionMutation = useBuilderStore.getState().sectionMutation;
                        await sectionMutation.mutateAsync(sectionId);
                    }
                },
                onSuccess: () => toast({ title: "Project Build Complete", description: "All selected sections have been successfully generated." }),
                onError: (error: Error) => toast({ title: "Project Build Failed", description: error.message, variant: "destructive" }),
            }),
        });
    }, [firebaseUser, isStoreInitialized, refetchUser, updateProject]);

    return isStoreInitialized;
};

export { useBuilderStore };
