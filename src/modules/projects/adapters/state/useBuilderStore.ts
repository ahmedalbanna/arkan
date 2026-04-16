'use client';

import { toast } from '@/hooks/util/use-toast';
import { parseMarkdownToContent } from '@/hooks/util/useMarkdownParser';
import { projectFromFile } from '@/hooks/util/project-file-io';
import { container } from '@/infrastructure/di/container';
import { LocalProjectService } from '@/infrastructure/storage/LocalProjectService';
import { useEditorStore } from '@/modules/ai-content/adapters/state/use-editor-store';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Project, type ProjectProperties } from '@/modules/projects/domain/entities/Project';
import { User } from '@/modules/users/domain/entities/User';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface BuilderState {
    project: Project | null;
    userProfile: User | null;
    hasUnsavedChanges: boolean;
    isStoreInitialized: boolean;
    version: number;
    selectedFileId: string | null;
    comparisonSnapshotId: string | null;
    historyStack: ProjectProperties[];
    autoSaveEnabled: boolean;
    lastAutoSaveTime: number | null;

    initializeStore: () => void;
    setUserProfile: (userProfile: User | null) => void;
    setHasUnsavedChanges: (hasChanges: boolean) => void;
    updateProject: (updater: (project: Project) => void | Project) => void;
    undo: () => void;
    redo: () => void;
    updateProjectFromMarkdown: (markdown: string) => void;
    syncProjectStructure: () => void;
    loadProject: (projectData: ProjectProperties) => void;
    loadProjectFromFile: (file: File) => Promise<void>;
    newSession: () => void;
    applyTableOfContents: (tocMarkdown: string) => void;
    selectFile: (fileId: string | null) => void;
    setComparisonSnapshotId: (snapshotId: string | null) => void;
    setAutoSaveEnabled: (enabled: boolean) => void;
    autoSave: () => Promise<void>;
    getProjectStats: () => { chapters: number; sections: number; words: number };
}

const createNewTemporaryProject = (): Project => new Project({
    id: uuidv4(),
    name: 'Untitled Project',
    meta: {
        author: 'User',
        version: '1.0.0',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    }
} as any);

const MAX_HISTORY_SIZE = 50;
const AUTO_SAVE_DELAY_MS = 30000; // 30 seconds
const AUTO_SAVE_DEBOUNCE_MS = 2000;

const useBuilderStore = create<BuilderState>()(
    persist(
        (set, get) => ({
            project: null,
            userProfile: null,
            hasUnsavedChanges: false,
            isStoreInitialized: false,
            version: 0,
            selectedFileId: null,
            comparisonSnapshotId: null,
            historyStack: [],
            autoSaveEnabled: true,
            lastAutoSaveTime: null,

            initializeStore: () => {
                if (get().isStoreInitialized) return;

                const load = async () => {
                    try {
                        const lastProjectId = localStorage.getItem('lastActiveProjectId');
                        let projectToLoad: ProjectProperties | undefined;
                        const service = container.resolve(LocalProjectService);

                        if (lastProjectId) {
                            projectToLoad = await service.getProject(lastProjectId);
                        }

                        if (projectToLoad) {
                            set({
                                project: new Project(projectToLoad),
                                isStoreInitialized: true,
                                version: 0,
                                selectedFileId: null
                            });
                        } else {
                            set({
                                project: createNewTemporaryProject(),
                                isStoreInitialized: true,
                                version: 0,
                                selectedFileId: null
                            });
                        }
                    } catch (error) {
                        console.error('Failed to initialize store:', error);
                        set({
                            project: createNewTemporaryProject(),
                            isStoreInitialized: true,
                            version: 0,
                            selectedFileId: null
                        });
                    }
                };

                load();
            },

            selectFile: (fileId) => set({ selectedFileId: fileId }),

            setComparisonSnapshotId: (snapshotId) => set({ comparisonSnapshotId: snapshotId }),

            setUserProfile: (userProfile) => set({ userProfile }),

            setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),

            updateProject: (updater) => {
                const currentProject = get().project;
                const currentHistory = get().historyStack;

                set(state => {
                    if (!state.project) return {};

                    // Push to history before updating
                    const newHistory = [...currentHistory, state.project.toStateObject()].slice(-MAX_HISTORY_SIZE);

                    const newProject = new Project(state.project.toStateObject());
                    const result = updater(newProject);
                    const finalProject = result instanceof Project ? result : newProject;

                    // Save to storage
                    const service = container.resolve(LocalProjectService);
                    service.saveProject(finalProject.toStateObject()).catch(console.error);
                    localStorage.setItem('lastActiveProjectId', finalProject.id);

                    // Trigger auto-save if enabled
                    if (get().autoSaveEnabled) {
                        const now = Date.now();
                        const lastSave = get().lastAutoSaveTime;
                        if (!lastSave || now - lastSave > AUTO_SAVE_DELAY_MS) {
                            setTimeout(() => get().autoSave(), AUTO_SAVE_DEBOUNCE_MS);
                        }
                    }

                    return {
                        project: finalProject,
                        historyStack: newHistory,
                        hasUnsavedChanges: true,
                        version: state.version + 1
                    };
                });
            },

            undo: () => {
                const history = get().historyStack;
                if (history.length === 0) {
                    toast({
                        title: 'Nothing to Undo',
                        description: 'No previous actions to revert.',
                    });
                    return;
                }

                const previousState = history[history.length - 1];
                const newHistory = history.slice(0, -1);

                const restoredProject = new Project(previousState);
                const service = container.resolve(LocalProjectService);
                service.saveProject(restoredProject.toStateObject());

                set({
                    project: restoredProject,
                    historyStack: newHistory,
                    hasUnsavedChanges: true,
                    version: get().version + 1
                });

                toast({
                    title: 'Undo Successful',
                    description: 'Reverted to previous state.',
                });
            },

            redo: () => {
                // Redo functionality would require storing future states
                toast({
                    title: 'Redo',
                    description: 'Redo functionality coming soon.',
                });
            },

            updateProjectFromMarkdown: (markdown: string) => {
                get().updateProject(p => p.updateMarkdown(markdown));
            },

            syncProjectStructure: () => {
                get().updateProject(p => p.syncStructure(parseMarkdownToContent));
            },

            loadProject: (projectData) => {
                const newProject = projectData instanceof Project ? projectData : new Project(projectData);
                localStorage.setItem('lastActiveProjectId', newProject.id);
                const service = container.resolve(LocalProjectService);
                service.saveProject(newProject.toStateObject());
                set({
                    project: newProject,
                    hasUnsavedChanges: false,
                    version: 0,
                    selectedFileId: null,
                    historyStack: [],
                });

                toast({
                    title: 'Project Loaded',
                    description: `"${newProject.name}" is ready.`,
                });
            },

            loadProjectFromFile: async (file: File) => {
                try {
                    const newProject = await projectFromFile(file);
                    get().loadProject(newProject.toStateObject());
                    toast({
                        title: 'Project Loaded',
                        description: `Successfully loaded "${newProject.name}".`
                    });
                } catch (err) {
                    toast({
                        title: 'Load Failed',
                        description: (err as Error).message,
                        variant: 'destructive'
                    });
                }
            },

            newSession: () => {
                if (get().hasUnsavedChanges) {
                    if (typeof window !== 'undefined' && !window.confirm('Start a new session? Any unsaved changes will be lost.')) {
                        return;
                    }
                }

                const currentProject = get().project;
                if (currentProject) {
                    set({
                        project: createNewTemporaryProject(),
                        hasUnsavedChanges: false,
                        version: 0,
                        selectedFileId: null,
                        historyStack: [],
                    });
                    localStorage.removeItem('lastActiveProjectId');

                    const editor = useEditorStore.getState().activeEditor;
                    if (editor && !editor.isDestroyed) {
                        editor.commands.clearContent(true);
                    }

                    toast({
                        title: 'New Project Started',
                        description: 'Your workspace has been cleared.'
                    });
                }
            },

            applyTableOfContents: (tocMarkdown: string) => {
                get().updateProject(p => {
                    if (!p) return p;
                    const newContent = p.parseAndSetContentFromToc(tocMarkdown, uuidv4);
                    return p.withProps({ content: [...newContent] });
                });

                toast({
                    title: 'Structure Updated',
                    description: 'Table of contents has been applied.',
                });
            },

            setAutoSaveEnabled: (enabled) => {
                set({ autoSaveEnabled: enabled });
                localStorage.setItem('autoSaveEnabled', String(enabled));
            },

            autoSave: async () => {
                const { project, autoSaveEnabled, hasUnsavedChanges } = get();
                if (!autoSaveEnabled || !hasUnsavedChanges || !project) return;

                try {
                    const service = container.resolve(LocalProjectService);
                    await service.saveProject(project.toStateObject());
                    set({
                        hasUnsavedChanges: false,
                        lastAutoSaveTime: Date.now(),
                    });

                    // Silent toast for auto-save
                    console.log('[AutoSave] Project saved successfully');
                } catch (error) {
                    console.error('[AutoSave] Failed to save project:', error);
                }
            },

            getProjectStats: () => {
                const { project } = get();
                if (!project) return { chapters: 0, sections: 0, words: 0 };

                const chapters = project.content.filter(c => c instanceof Chapter).length;
                const sections = project.content.reduce((acc, c) =>
                    acc + (c instanceof Chapter ? c.sections.length : 1), 0
                );

                // Rough word count estimation
                const words = project.content.reduce((acc, c) => {
                    if (c instanceof Chapter) {
                        return acc + c.sections.reduce((sum, s) => sum + (s.content?.split(/\s+/).length || 0), 0);
                    }
                    return acc + (c.content?.split(/\s+/).length || 0);
                }, 0);

                return { chapters, sections, words };
            },
        }),
        {
            name: 'builder-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                autoSaveEnabled: state.autoSaveEnabled,
                userProfile: state.userProfile,
            }),
        }
    )
);

export function useInitializeBuilderStore() {
    const { initializeStore, isStoreInitialized } = useBuilderStore();

    useEffect(() => {
        if (!isStoreInitialized) {
            initializeStore();
        }
    }, [initializeStore, isStoreInitialized]);

    // Setup auto-save interval
    useEffect(() => {
        if (!isStoreInitialized) return;

        const interval = setInterval(() => {
            const { autoSaveEnabled, hasUnsavedChanges } = useBuilderStore.getState();
            if (autoSaveEnabled && hasUnsavedChanges) {
                useBuilderStore.getState().autoSave();
            }
        }, AUTO_SAVE_DELAY_MS);

        return () => clearInterval(interval);
    }, [isStoreInitialized]);

    return isStoreInitialized;
}

export { useBuilderStore };
