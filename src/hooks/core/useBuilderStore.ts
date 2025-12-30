
'use client';

import { Chapter, ChapterProperties, Section, TocSection } from '@/lib/models';
import { Project, type ProjectProperties } from '@/lib/models';
import { localProjectService } from '@/services/local-project-service';
import React, { useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { parseMarkdownToContent } from '../util/useMarkdownParser';
import type { ExternalContext, ExternalContextProperties, SectionName } from '@/lib/models';
import { toast } from '../util/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { PromptBuilder } from '@/lib/prompt-builder';
import { writingToolApi } from '@/services/api/writingToolsService';
import { generateReportSectionApi } from '@/services/api/reportService';
import { sectionKeys } from '@/lib/query-keys';

type ActiveView = 'cover-page' | 'report-content';

interface BuilderState {
    project: Project | null;
    activeView: ActiveView;
    hasUnsavedChanges: boolean;
    isStoreInitialized: boolean;
    
    // Section Selection for build mode
    selectedSectionsForBuild: Set<string>;
    handleSectionSelectionToggle: (sectionId: string) => void;
    handleChapterSelectionToggle: (chapterId: string, select: boolean) => void;
    handleSelectAllChapters: (select: boolean) => void;

    // Mutations
    sectionMutation: ReturnType<typeof useMutation>;
    chapterMutation: ReturnType<typeof useMutation>;
    projectMutation: ReturnType<typeof useMutation>;
    onGenerateSection: (sectionId: string) => void;
    onGenerateChapter: (chapterId: string) => void;
    onGenerateProject: () => void;
    
    // Core actions
    initializeStore: () => void;
    setActiveView: (view: ActiveView) => void;
    setHasUnsavedChanges: (hasChanges: boolean) => void;
    updateProject: (updater: (project: Project) => Project | void) => void;
    updateSection: (sectionId: string, updater: (section: Section) => Section) => void;
    setContentFromMarkdown: (markdown: string) => void;
    loadProject: (projectData: ProjectProperties) => void;
    loadProjectFromFile: (file: File) => Promise<void>;
    newSession: () => void;
    applyTableOfContents: (tocData: TocSection[]) => void;
}

const useBuilderStore = create<BuilderState>((set, get) => {
    // Note: React Query hooks can't be used directly inside create().
    // They must be initialized within a React component/hook context.
    // So we define them as null/placeholders here and initialize them in a wrapper hook.
    
    return {
        project: null,
        activeView: 'cover-page',
        hasUnsavedChanges: false,
        isStoreInitialized: false,

        selectedSectionsForBuild: new Set(),

        // Placeholder mutations, will be replaced by the hook
        sectionMutation: {} as ReturnType<typeof useMutation>,
        chapterMutation: {} as ReturnType<typeof useMutation>,
        projectMutation: {} as ReturnType<typeof useMutation>,

        onGenerateSection: () => {},
        onGenerateChapter: () => {},
        onGenerateProject: () => {},

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

        setActiveView: (view) => set({ activeView: view }),
        setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),

        loadProject: (projectData) => {
            const newProject = projectData instanceof Project ? projectData : new Project(projectData);
            localStorage.setItem('lastActiveProjectId', newProject.id);
            set({ project: newProject, hasUnsavedChanges: false, activeView: 'cover-page' });
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

        updateProject: (updater) => {
            set(state => {
                if (!state.project) return {};
                const currentProject = state.project;
                const result = updater(currentProject);
                const newProject = result instanceof Project ? result : currentProject;
                localStorage.setItem('lastActiveProjectId', newProject.id);
                return { project: newProject, hasUnsavedChanges: true };
            });
        },

        updateSection: (sectionId, updater) => {
            get().updateProject(p => p.updateSection(sectionId, updater));
        },
        
        setContentFromMarkdown: (markdown: string) => {
            set(state => {
                if (!state.project) return {};
                const newContent = parseMarkdownToContent(markdown, state.project.content);
                const newProject = state.project.with({ content: newContent });
                return { project: newProject, hasUnsavedChanges: true };
            });
        },
        
        applyTableOfContents: (tocData) => {
            set(state => {
                if (!state.project) return {};
                let newProject = state.project.with({ content: [] });
                tocData.forEach(chapterData => {
                    let newChapter = new Chapter({ title: chapterData.title, sections: [] });
                    chapterData.sections.forEach(sectionTitle => {
                        newChapter = newChapter.addSection(new Section({ title: sectionTitle, type: 'report' }));
                    });
                    newProject = newProject.addChapter(newChapter);
                });
                return { project: newProject, hasUnsavedChanges: true };
            });
            toast({
                title: 'Table of Contents Applied',
                description: `${tocData.length} chapters and their sections have been created.`,
            });
        },

        newSession: () => {
            if (window.confirm('Are you sure you want to start a new session? Any unsaved changes will be lost.')) {
                localStorage.removeItem('lastActiveProjectId');
                set({ project: createNewTemporaryProject(), hasUnsavedChanges: false, activeView: 'cover-page' });
            }
        },

        handleSectionSelectionToggle: (sectionId: string) => {
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

        handleChapterSelectionToggle: (chapterId: string, select: boolean) => {
            set(state => {
                const chapter = state.project?.getChapter(chapterId);
                if (!chapter) return {};

                const newSelection = new Set(state.selectedSectionsForBuild);
                chapter.sections.forEach(section => {
                    if (select) {
                        newSelection.add(section.id);
                    } else {
                        newSelection.delete(section.id);
                    }
                });
                return { selectedSectionsForBuild: newSelection };
            });
        },
        
        handleSelectAllChapters: (select: boolean) => {
            set(state => {
                if (!state.project) return {};
                const allSectionIds = new Set(state.project.sections.map(s => s.id));
                return { selectedSectionsForBuild: select ? allSectionIds : new Set() };
            });
        },
    };
});

const createNewTemporaryProject = (): Project => new Project({});

export const useInitializeBuilderStore = () => {
    const { initializeStore, isStoreInitialized } = useBuilderStore();
    useEffect(() => {
        initializeStore();
    }, [initializeStore]);
    return isStoreInitialized;
};

// This is the new wrapper hook that initializes the mutations
const useInitializedBuilderStore = () => {
    const store = useBuilderStore();
    const { userProfile, refetchUser, firebaseUser } = useAuth();
    const queryClient = useQueryClient();

    // Section Generation Mutation
    const sectionMutation = useMutation({
        mutationKey: ['generateReportSection'],
        mutationFn: async (sectionId: string) => {
            if (!store.project || !userProfile || !firebaseUser) throw new Error("Project or user not found.");
            const section = store.project.getSection(sectionId);
            if (!section) throw new Error("Section not found.");

            const token = await firebaseUser.getIdToken();
            const body = {
                sectionToGenerate: section.id as SectionName,
                prompt: section.buildActionPrompt(),
                otherSections: section.getContextAsRecord(store.project),
                externalContext: section.getExternalContextAsArray(store.project),
                guidelines: section.guidelines,
                instructionText: PromptBuilder.buildSectionPrompt(section, store.project),
            };
            const result = await generateReportSectionApi(body, token);
            const content = result?.[section.id] ?? Object.values(result || {})[0] as string | undefined;
            if (!content) throw new Error('Empty generation result');
            return { sectionId: section.id, content };
        },
        onSuccess: (data) => {
            store.updateProject(p => p.updateSection(data.sectionId, s => s.with({ content: data.content })));
            refetchUser();
            toast({ title: 'Section Generated', description: 'The AI has generated the content for your section.' });
        },
        onError: (error: any) => {
            toast({ title: 'Generation error', description: error.message || 'Failed to generate section', variant: 'destructive' });
        },
    });

    const getContextNames = (section: Section): string[] => {
        if (!store.project) return [];
        const sectionContexts = Object.keys(section.context?.sections || {})
            .filter(key => section.context.sections?.[key])
            .map(key => store.project?.getSection(key)?.title)
            .filter(Boolean) as string[];

        const fileContexts = Object.keys(section.context?.externalContext || {})
            .filter(key => section.context.externalContext?.[key])
            .map(key => store.project?.externalContext.find(f => f.id === key)?.fileName)
            .filter(Boolean) as string[];

        return [...sectionContexts, ...fileContexts];
    };

    const chaptersToBuild = useMemo(() => {
        if (!store.project) return [];
        return store.project.content
          .filter((item): item is Chapter => item instanceof Chapter)
          .map(c => c.with({ sections: c.sections.filter(s => store.selectedSectionsForBuild.has(s.id))}))
          .filter(c => c.sections.length > 0);
      }, [store.project, store.selectedSectionsForBuild]);

    // Chapter Generation Mutation
    const chapterMutation = useMutation({
        mutationKey: ['generateChapterContent'],
        mutationFn: async (chapterId: string) => {
            if (!store.project || !userProfile || !firebaseUser) throw new Error("Project or user not found.");
            
            const chapter = store.project.getChapter(chapterId);
            if (!chapter) throw new Error("Chapter not found.");
            
            const sectionsToGenerate = chapter.sections.filter(s => store.selectedSectionsForBuild.has(s.id));
            if (sectionsToGenerate.length === 0) throw new Error('No sections selected.');

            const token = await firebaseUser.getIdToken();
            const body = {
                chapterTitle: chapter.title,
                sectionInstructions: sectionsToGenerate.map(s => ({
                  title: s.title, prompt: s.buildActionPrompt(), guidelines: s.guidelines,
                  instructionText: PromptBuilder.buildSectionPrompt(s, store.project!), context: getContextNames(s).join(', ')
                }))
            };

            const result = await writingToolApi<any, { markdownContent: string }>(`/api/writing-tools/generate-chapter`, { data: body, token });
            return { chapterId, content: result.markdownContent };
        },
        onSuccess: (data) => {
            const chapter = store.project?.getChapter(data.chapterId);
            if (!chapter) return;
            const sections = chapter.sections.filter(s => store.selectedSectionsForBuild.has(s.id));
            if (sections.length === 0) return;

            store.updateProject(p => {
                let updatedProject = p;
                updatedProject = updatedProject.updateSection(sections[0].id, s => s.with({ content: data.content }));
                for (let i = 1; i < sections.length; i++) {
                    updatedProject = updatedProject.updateSection(sections[i].id, s => s.with({ content: '' }));
                }
                return updatedProject;
            });
            refetchUser();
            toast({ title: 'Chapter Generated', description: 'The AI has generated the content for the chapter.' });
        },
        onError: (error: any) => toast({ title: 'Chapter Generation Error', description: error.message, variant: 'destructive' })
    });
    
    // Project Generation Mutation
    const projectMutation = useMutation({
        mutationKey: ['generateProjectContent'],
        mutationFn: async () => {
            if (!store.project || !firebaseUser || store.selectedSectionsForBuild.size === 0) throw new Error("No sections selected for project generation.");
            const token = await firebaseUser.getIdToken();
            const body = {
                chapters: chaptersToBuild.map(c => ({
                    chapterTitle: c.title,
                    sectionInstructions: c.sections.map(s => ({
                        title: s.title, prompt: s.buildActionPrompt(), guidelines: s.guidelines,
                        instructionText: PromptBuilder.buildSectionPrompt(s, store.project!), context: getContextNames(s).join(', ')
                    }))
                }))
            };
            const result = await writingToolApi<any, { chapters: { chapterTitle: string, markdownContent: string }[] }>(`/api/generate/project`, { data: body, token });
            return result.chapters;
        },
        onSuccess: (generatedChapters) => {
            store.updateProject(p => {
                let newProject = p;
                generatedChapters.forEach(genChapter => {
                    const chapterToUpdate = newProject.chapters.find(c => c.title === genChapter.chapterTitle);
                    if (chapterToUpdate) {
                        const sectionsToUpdate = chapterToUpdate.sections.filter(s => store.selectedSectionsForBuild.has(s.id));
                        if(sectionsToUpdate.length > 0) {
                            newProject = newProject.updateSection(sectionsToUpdate[0].id, s => s.with({ content: genChapter.markdownContent }));
                            for (let i = 1; i < sectionsToUpdate.length; i++) {
                                newProject = newProject.updateSection(sectionsToUpdate[i].id, s => s.with({ content: '' }));
                            }
                        }
                    }
                });
                return newProject;
            });
            refetchUser();
            toast({ title: 'Project Built', description: 'Content for selected chapters has been generated.' });
        },
        onError: (error: any) => toast({ title: 'Project Build Error', description: error.message, variant: 'destructive' })
    });

    // Replace placeholders with real mutations
    store.sectionMutation = sectionMutation as any;
    store.chapterMutation = chapterMutation as any;
    store.projectMutation = projectMutation as any;
    store.onGenerateSection = (sectionId) => sectionMutation.mutate(sectionId);
    store.onGenerateChapter = (chapterId) => chapterMutation.mutate(chapterId);
    store.onGenerateProject = () => projectMutation.mutate();

    return { ...store, userProfile };
};

export { useInitializedBuilderStore as useBuilderStore };
