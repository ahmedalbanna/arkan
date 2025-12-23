
'use client';

import { Chapter, ChapterProperties } from '@/lib/models/chapter';
import { Project, type ProjectProperties } from '@/lib/models/project';
import { localProjectService } from '@/services/local-project-service';
import React from 'react';
import { create } from 'zustand';

interface BuilderState {
    project: Project | null;
    hasUnsavedChanges: boolean;
    setHasUnsavedChanges: (hasChanges: boolean) => void;
    updateProject: (updater: (project: Project) => Project) => void;
    loadProject: (projectData: ProjectProperties) => void;
    newSession: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleUploadClick: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>, toast: any, t: any, router: any) => void;
    isCreateProjectOpen: boolean;
    setIsCreateProjectOpen: (isOpen: boolean) => void;
}

const createNewTemporaryProject = (): Project => new Project({});

const useBuilderStore = create<BuilderState>((set, get) => {
    const fileInputRef = React.createRef<HTMLInputElement>();

    return {
        project: createNewTemporaryProject(),
        hasUnsavedChanges: false,
        setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),

        loadProject: (projectData) => {
            const newProject = new Project(projectData);
            localStorage.setItem('lastActiveProjectId', newProject.id);
            set({ project: newProject, hasUnsavedChanges: false });
        },

        updateProject: (updater) => {
            set(state => {
                if (!state.project) return {};
                const newProject = updater(state.project);
                return { project: newProject, hasUnsavedChanges: true };
            });
        },

        newSession: () => {
            localStorage.removeItem('lastActiveProjectId');
            set({ project: createNewTemporaryProject(), hasUnsavedChanges: false });
        },

        fileInputRef,
        handleUploadClick: () => get().fileInputRef.current?.click(),
        onFileChange: async (e, toast, t, router) => {
            const file = e.target.files?.[0];
            const { loadProject } = get();
            if (file) {
                try {
                    const newProject = await Project.fromFile(file);
                    loadProject(newProject.toStateObject());
                    toast({ title: t('builder.toasts.projectLoadedTitle'), description: t('builder.toasts.projectLoadedDesc', { projectName: newProject.name }) });
                    router.push('/builder');
                } catch (err) {
                    toast({ title: t('builder.toasts.loadFailedTitle'), description: (err as Error).message, variant: 'destructive' });
                }
            }
            if (e.target) e.target.value = '';
        },
        isCreateProjectOpen: false,
        setIsCreateProjectOpen: (isOpen: boolean) => set({ isCreateProjectOpen: isOpen }),
    };
});

export { useBuilderStore };
