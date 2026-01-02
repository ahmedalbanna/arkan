
'use client';

import { Chapter, Project, Section, TocSection, type ProjectProperties } from '@/lib/models';
import { localProjectService } from '@/services/local-project-service';
import { useEffect } from 'react';
import { create } from 'zustand';
import { toast } from '../util/use-toast';
import { parseMarkdownToContent } from '../util/useMarkdownParser';

interface BuilderState {
    project: Project | null;
    hasUnsavedChanges: boolean;
    isStoreInitialized: boolean;
    selectedSectionsForBuild: Set<string>;
    isProjectBuildMode: boolean;
    
    initializeStore: () => void;
    setHasUnsavedChanges: (hasChanges: boolean) => void;
    updateProject: (updater: (project: Project) => void | Project) => void;
    updateSection: (sectionId: string, updater: (section: Section) => Section | void) => void;
    loadProject: (projectData: ProjectProperties) => void;
    loadProjectFromFile: (file: File) => Promise<void>;
    newSession: () => void;
    applyTableOfContents: (tocData: TocSection[]) => void;
    setContentFromMarkdown: (markdown: string) => void;

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

    updateSection: (sectionId, updater) => {
        get().updateProject(p => p.updateSection(sectionId, s => {
            const result = updater(s);
            return result || s;
        }));
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
    const { initializeStore, isStoreInitialized } = useBuilderStore();
    
    // Initialize the main store on mount
    useEffect(() => {
        if (!isStoreInitialized) {
            initializeStore();
        }
    }, [initializeStore, isStoreInitialized]);

    return isStoreInitialized;
};

export { useBuilderStore };
