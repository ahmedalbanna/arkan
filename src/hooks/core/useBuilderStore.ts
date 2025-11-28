
'use client';

import { Chapter } from '@/lib/models/chapter';
import { Project, type ProjectProperties } from '@/lib/models/project';
import { localProjectService } from '@/services/local-project-service';
import React from 'react';
import { create } from 'zustand';

// This type includes both the state and the actions for the store
interface BuilderState {
    project: Project | null;
    hasUnsavedChanges: boolean;
    setHasUnsavedChanges: (hasChanges: boolean) => void;

    // --- Project lifecycle actions ---
    loadProject: (projectData: ProjectProperties) => void;
    updateProject: (updater: (project: Project) => void) => void;
    newSession: () => void;

    // --- UI and Session management actions ---
    isSavePromptOpen: boolean;
    setIsSavePromptOpen: (isOpen: boolean) => void;

    // States for dialogs
    newProjectName: string;
    setNewProjectName: (name: string) => void;
    newProjectDescription: string;
    setNewProjectDescription: (desc: string) => void;
    handleStartBuilding: (t: (key: string) => string, router: any) => void;
    isCreateProjectOpen: boolean,
    setIsCreateProjectOpen: (isOpen: boolean) => void;

    // File upload logic
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleUploadClick: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>, toast: any, t: any, router: any) => void;
}

const createNewTemporaryProject = (): Project => {
    return new Project({
        // The new Project() constructor will assign a UUID automatically
    });
};

// The create function now returns the combined state and actions
const useBuilderStore = create<BuilderState>((set, get) => {

    const fileInputRef = React.createRef<HTMLInputElement>();

    // Initial state setup
    return {
        project: null,
        hasUnsavedChanges: false,
        setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
        isSavePromptOpen: false,
        newProjectName: '',
        newProjectDescription: '',
        isCreateProjectOpen: false,
        fileInputRef,

        // --- Core Project Actions ---
        loadProject: (projectData) => {
            const newProject = new Project({
                ...projectData,
                chapters: (projectData.chapters || []).map(c => new Chapter(c as Chapter))
            });
            localStorage.setItem('lastActiveProjectId', newProject.id);
            set({ project: newProject, hasUnsavedChanges: false });
        },
        updateProject: (updater) => {
            set(state => {
                if (!state.project) return {};
                const newProjectInstance = new Project(JSON.parse(JSON.stringify(state.project.toStateObject())));
                updater(newProjectInstance);
                return { project: newProjectInstance, hasUnsavedChanges: true };
            });
        },
        newSession: () => {
            localStorage.removeItem('lastActiveProjectId');
            set({ project: createNewTemporaryProject(), hasUnsavedChanges: false });
        },

        // --- Dialog State Actions ---
        setIsSavePromptOpen: (isOpen) => set({ isSavePromptOpen: isOpen }),
        setNewProjectName: (name) => set({ newProjectName: name }),
        setNewProjectDescription: (desc) => set({ newProjectDescription: desc }),
        setIsCreateProjectOpen: (isOpen) => set({ isCreateProjectOpen: isOpen }),

        // --- Dialog Logic Actions ---
        handleStartBuilding: async (t, router) => {
            const { newProjectName, newProjectDescription, loadProject } = get();
            if (!newProjectName && !newProjectDescription) return;

            const newProjectData = {
                name: newProjectName || t('projects.untitled'),
                projectDescription: newProjectDescription,
            };
            const newProject = new Project(newProjectData);
            await localProjectService.saveProject(newProject.toStateObject());
            loadProject(newProject.toStateObject());
            router.push('/builder');
            set({ isCreateProjectOpen: false, newProjectName: '', newProjectDescription: '' });
        },

        // --- File Upload ---
        handleUploadClick: () => get().fileInputRef.current?.click(),
        onFileChange: (e, toast, t, router) => {
            const file = e.target.files?.[0];
            const { loadProject } = get();
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const projectData = JSON.parse(event.target?.result as string);
                        if (projectData && typeof projectData === 'object' && ('name' in projectData)) {
                            loadProject(projectData);
                            toast({ title: t('builder.toasts.projectLoadedTitle'), description: t('builder.toasts.projectLoadedDesc', { projectName: projectData.name }) });
                            router.push('/builder');
                        } else {
                            throw new Error(t('builder.errors.invalidProjectFile'));
                        }
                    } catch (err) {
                        toast({ title: t('builder.toasts.loadFailedTitle'), description: (err as Error).message, variant: 'destructive' });
                    }
                };
                reader.readAsText(file);
            }
            if (e.target) e.target.value = ''; // Reset file input
        },
    };
});


export { useBuilderStore };
