
'use client';

import React from 'react';
import { create } from 'zustand';
import { Project, type ProjectProperties } from '@/lib/models/project';
import { useToast } from '@/hooks';
import { useRouter } from 'next/navigation';
import { Chapter } from '@/lib/models';

// This type includes both the state and the actions for the store
interface BuilderState {
  project: Project | null;
  hasUnsavedChanges: boolean;
  
  // --- Project lifecycle actions ---
  loadProject: (projectData: ProjectProperties) => void;
  updateProject: (updater: (project: Project) => void) => void;
  newSession: () => void;
  
  // --- UI and Session management actions ---
  isSaving: boolean;
  saveProject: () => void;
  isSavePromptOpen: boolean;
  setIsSavePromptOpen: (isOpen: boolean) => void;
  isSaveAsOpen: boolean;
  setIsSaveAsOpen: (isOpen: boolean) => void;
  
  // States for dialogs
  newProjectName: string;
  setNewProjectName: (name: string) => void;
  newProjectDescription: string;
  setNewProjectDescription: (desc: string) => void;
  handleStartBuilding: (t: (key: string) => string, router: any) => void;
  isCreateProjectOpen: boolean,
  setIsCreateProjectOpen: (isOpen: boolean) => void;

  saveAsName: string;
  setSaveAsName: (name: string) => void;
  handleSaveFromPrompt: (toast: any, t: any) => void;
  handleDownloadAs: () => void;
  
  // File upload logic
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleUploadClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, toast: any, t: any, router: any) => void;
  
  hasContent: boolean;
}

const createNewTemporaryProject = (): Project => {
    return new Project({
        // The new Project() constructor will assign a UUID automatically
    });
};

// The create function now returns the combined state and actions
const useBuilderStore = create<BuilderState>((set, get) => {
    // This function is outside the React component tree, so we cannot use hooks here directly.
    // We will pass hook-based functions like t and toast into the actions that need them.
    
    const fileInputRef = React.createRef<HTMLInputElement>();

    // Initial state setup
    return {
        project: null,
        hasUnsavedChanges: false,
        isSaving: false,
        isSavePromptOpen: false,
        isSaveAsOpen: false,
        newProjectName: '',
        newProjectDescription: '',
        isCreateProjectOpen: false,
        saveAsName: '',
        hasContent: false,
        fileInputRef,

        // --- Core Project Actions ---
        loadProject: (projectData) => {
            // Re-instantiate the Project and its nested classes from plain data
            const newProject = new Project({
                ...projectData,
                chapters: (projectData.chapters || []).map(c => new Chapter(c as Chapter))
            });
            set({ project: newProject, hasUnsavedChanges: false });
        },
        updateProject: (updater) => {
            set(state => {
                if (!state.project) return {};
                // Create a new instance for immutability
                const newProjectInstance = new Project(JSON.parse(JSON.stringify(state.project.toStateObject())));
                updater(newProjectInstance);
                return { project: newProjectInstance, hasUnsavedChanges: true };
            });
        },
        newSession: () => {
            set({ project: createNewTemporaryProject(), hasUnsavedChanges: false });
        },

        // --- Dialog State Actions ---
        setIsSavePromptOpen: (isOpen) => set({ isSavePromptOpen: isOpen }),
        setIsSaveAsOpen: (isOpen) => set({ isSaveAsOpen: isOpen }),
        setNewProjectName: (name) => set({ newProjectName: name }),
        setNewProjectDescription: (desc) => set({ newProjectDescription: desc }),
        setIsCreateProjectOpen: (isOpen) => set({ isCreateProjectOpen: isOpen }),
        setSaveAsName: (name) => set({ saveAsName: name }),

        // --- Dialog Logic Actions ---
        handleStartBuilding: (t, router) => {
            const { newProjectName, newProjectDescription, loadProject } = get();
            if (!newProjectName && !newProjectDescription) return;

            const newProjectData = {
                id: '',
                userId: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                name: newProjectName || t('projects.untitled'),
                projectDescription: newProjectDescription,
                chapters: [],
                externalContext: [],
            };
            loadProject(newProjectData);
            router.push('/builder'); 
            set({ isCreateProjectOpen: false, newProjectName: '', newProjectDescription: '' });
        },
        handleSaveFromPrompt: (toast, t) => {
            const { project, saveAsName, saveProject } = get();
            if (project && saveAsName) {
                project.name = saveAsName;
                saveProject();
                set({ isSavePromptOpen: false, saveAsName: '' });
            } else {
                toast({ title: t('projects.nameRequiredToastTitle'), description: t('projects.nameRequiredToastDesc'), variant: 'destructive' });
            }
        },

        handleDownloadAs: () => {
            const { project, saveAsName } = get();
            if (!project) return;
            const projectData = JSON.stringify(project.toStateObject(), null, 2);
            const blob = new Blob([projectData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${(saveAsName || project.name || 'project').replace(/\s+/g, '_')}.arkan`;
            a.click();
            URL.revokeObjectURL(url);
            set({ isSaveAsOpen: false });
        },

        // --- Session Actions (placeholder, logic will be in the hook that uses the store) ---
        saveProject: () => { console.log("Save action needs to be triggered from a component with the useSaveProject hook."); },
        
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
                        // More robust validation
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

// Selector hook to get a memoized 'hasContent' value
const useHasContent = () => useBuilderStore(state => !!state.project);

// Subscribe to the store to update the 'hasContent' property
useBuilderStore.subscribe(
  (state) => state.project, // Listen to changes in the project object
  (project) => {
    // Update the 'hasContent' flag based on whether a project exists
    useBuilderStore.setState({ hasContent: !!project });
  }
);


export { useBuilderStore };
