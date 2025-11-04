'use client';

import { create } from 'zustand';
import { Project, type ProjectProperties } from '@/lib/models/project';

interface BuilderState {
  project: Project | null;
  loadProject: (projectData: ProjectProperties) => void;
  updateProject: (updater: (project: Project) => void) => void;
  newSession: () => void;
}

const createNewTemporaryProject = (): Project => {
    return new Project({
        // The new Project() constructor will assign a UUID automatically
    });
};

const useBuilderStore = create<BuilderState>((set, get) => ({
    project: null,
    loadProject: (projectData: ProjectProperties) => {
        set({ project: new Project(projectData) });
    },
    updateProject: (updater) => {
        const currentProject = get().project;
        if (!currentProject) return;

        // Create a deep copy to ensure no shared references
        const newProjectInstance = new Project(JSON.parse(JSON.stringify(currentProject.toStateObject())));
        
        updater(newProjectInstance);
        newProjectInstance.hasUnsavedChanges = true;

        set({ project: newProjectInstance });
    },
    newSession: () => {
        set({ project: createNewTemporaryProject() });
    },
}));

export { useBuilderStore };
