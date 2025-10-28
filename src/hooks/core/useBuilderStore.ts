
'use client';

import { create } from 'zustand';
import { Project, type ProjectProperties } from '@/lib/models/project';

interface BuilderState {
  project: Project | null;
  loadProject: (projectData: ProjectProperties) => void;
  updateProject: (updater: (project: Project) => void) => void;
  newSession: () => void;
}

const useBuilderStore = create<BuilderState>((set, get) => ({
  project: null,
  loadProject: (projectData) => {
    set({ project: new Project(projectData) });
  },
  updateProject: (updater) => {
    const currentProject = get().project;
    if (currentProject) {
      // Create a new instance from the old one's state
      const newProjectInstance = new Project(currentProject.toStateObject());
      // Apply updates
      updater(newProjectInstance);
      // Mark that there are changes to be saved
      newProjectInstance.hasUnsavedChanges = true;
      // Set the new instance in the store
      set({ project: newProjectInstance });
    }
  },
  newSession: () => {
    set({ project: null });
  }
}));

export { useBuilderStore };
