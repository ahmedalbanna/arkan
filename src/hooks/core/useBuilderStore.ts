
'use client';

import { Chapter, Project, Section, TocSection, type ProjectProperties } from '@/lib/models';
import { localProjectService } from '@/services/local-project-service';
import { useEffect } from 'react';
import { create } from 'zustand';
import { toast } from '../util/use-toast';
import { parseMarkdownToContent } from '../util/useMarkdownParser';

type ActiveView = 'cover-page' | 'report-content';

interface BuilderState {
    project: Project | null;
    activeView: ActiveView;
    hasUnsavedChanges: boolean;
    isStoreInitialized: boolean;

    // UI State for creating a new project
    isCreateProjectOpen: boolean;
    setIsCreateProjectOpen: (isOpen: boolean) => void;

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
    return {
        project: null,
        activeView: 'cover-page',
        hasUnsavedChanges: false,
        isStoreInitialized: false,
        isCreateProjectOpen: false,

        setIsCreateProjectOpen: (isOpen: boolean) => set({ isCreateProjectOpen: isOpen }),

        initializeStore: () => {
            if (get().isStoreInitialized) return;

            const lastProjectId = localStorage.getItem('lastActiveProjectId');
            if (lastProjectId) {
                localProjectService.getProject(lastProjectId).then(projectData => {
                    if (projectData) {
                        set({ project: new Project(projectData), isStoreInitialized: true });
                    } else {
                        // If project not found in local DB, create a new one
                        set({ project: createNewTemporaryProject(), isStoreInitialized: true });
                    }
                }).catch(() => {
                    // On error, also create a new project
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
            set({ project: newProject, hasUnsavedChanges: false, activeView: 'cover-page', isCreateProjectOpen: false });
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
                // The updater can either return a new Project instance or mutate the draft
                const newProject = result instanceof Project ? result : currentProject;

                // Always set a new timestamp and save to local storage
                const finalProject = newProject.with({ meta: { ...newProject.meta, updated: new Date().toISOString() } });
                localStorage.setItem('lastActiveProjectId', finalProject.id);

                return { project: finalProject, hasUnsavedChanges: true };
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
                let newProject = state.project.with({ content: [] }); // Start with clean content
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

// Re-export the store hook
export { useBuilderStore };

