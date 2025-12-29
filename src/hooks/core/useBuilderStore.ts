
'use client';

import { Chapter, ChapterProperties } from '@/lib/models/chapter';
import { Project, type ProjectProperties } from '@/lib/models/project';
import { localProjectService } from '@/services/local-project-service';
import React, { useEffect } from 'react';
import { create } from 'zustand';

type ActiveView = 'cover-page' | 'report-content';

interface BuilderState {
    project: Project | null;
    activeView: ActiveView;
    hasUnsavedChanges: boolean;
    isStoreInitialized: boolean;
    initializeStore: () => void;
    setActiveView: (view: ActiveView) => void;
    setHasUnsavedChanges: (hasChanges: boolean) => void;
    updateProject: (updater: (project: Project) => Project) => void;
    loadProject: (projectData: ProjectProperties) => void;
    newSession: () => void;
}

const createNewTemporaryProject = (): Project => new Project({});

const useBuilderStore = create<BuilderState>((set, get) => {

    return {
        project: null, // Start with null until initialized
        activeView: 'cover-page',
        hasUnsavedChanges: false,
        isStoreInitialized: false,

        initializeStore: () => {
            if (get().isStoreInitialized) return;

            const lastProjectId = localStorage.getItem('lastActiveProjectId');
            if (lastProjectId) {
                localProjectService.getProject(lastProjectId).then(projectData => {
                    if (projectData) {
                        set({ project: new Project(projectData), isStoreInitialized: true });
                    } else {
                        // Project not found, create a new one
                        set({ project: createNewTemporaryProject(), isStoreInitialized: true });
                    }
                }).catch(() => {
                    // Error loading, create a new one
                    set({ project: createNewTemporaryProject(), isStoreInitialized: true });
                });
            } else {
                // No last project, create a new one
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

        updateProject: (updater) => {
            set(state => {
                if (!state.project) return {};
                const newProject = updater(state.project);
                localStorage.setItem('lastActiveProjectId', newProject.id);
                return { project: newProject, hasUnsavedChanges: true };
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

// Custom hook to initialize the store on client mount
export const useInitializeBuilderStore = () => {
    const { initializeStore, isStoreInitialized } = useBuilderStore();
    useEffect(() => {
        initializeStore();
    }, [initializeStore]);
    return isStoreInitialized;
};


export { useBuilderStore };
