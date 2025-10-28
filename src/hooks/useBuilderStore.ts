
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "@/hooks";
import { Project, type ProjectProperties } from "@/lib/models/project";
import type { SavedProject, ContextFileType } from "@/lib/types";

// The new state is dramatically simplified
export interface BuilderState {
  project: Project | null;
  hasUnsavedChanges: boolean;
}

interface BuilderActions {
  newSession: () => void;
  loadProject: (savedProject: SavedProject) => void;
  setProject: (project: Project) => void; // To update the project instance
  updateProject: (updater: (project: Project) => void) => void;
  setHasUnsavedChanges: (status: boolean) => void;
  // Add new actions for direct manipulation, which will call the updater
  addExternalContext: (fileName: string, content: string, type: ContextFileType) => void;
  removeExternalContext: (index: number) => void;
  updateExternalContextType: (index: number, type: ContextFileType) => void;
}

const initialState: BuilderState = {
  project: null,
  hasUnsavedChanges: false,
};

export const useBuilderStore = create<BuilderState & BuilderActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      newSession: () => {
        set({ project: new Project({ id: `temp-${Date.now()}`, userId: 'anonymous', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as ProjectProperties), hasUnsavedChanges: false });
        toast({
          title: "New Session Started",
          description: "All project content has been cleared.",
        });
      },

      loadProject: (savedProject) => {
        const project = new Project(savedProject as ProjectProperties);
        set({
          project: project,
          hasUnsavedChanges: false,
        });
        toast({
          title: "Project Loaded",
          description: `Successfully loaded "${project.name || "project"}".`,
        });
      },

      setProject: (project) => {
        set({ project, hasUnsavedChanges: true });
      },

      updateProject: (updater) => {
        set((state) => {
            const currentProject = state.project ?? new Project({ id: `temp-${Date.now()}`, userId: 'anonymous', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as ProjectProperties);
            // Create a new instance from the current one's state to ensure React detects the change
            const newProject = new Project(currentProject.toJSON() as ProjectProperties);
            updater(newProject); // Apply mutations to the new instance
            return { project: newProject, hasUnsavedChanges: true };
        });
      },

      setHasUnsavedChanges: (status) => {
        set({ hasUnsavedChanges: status });
      },
      
      addExternalContext: (fileName, content, type) => {
        get().updateProject(p => p.addExternalContext(fileName, content, type));
      },

      removeExternalContext: (index: number) => {
        get().updateProject(p => p.removeExternalContext(index));
      },

      updateExternalContextType: (index: number, type: ContextFileType) => {
        get().updateProject(p => p.updateExternalContextType(index, type));
      }
    }),
    {
      name: "arkan-builder-state-v3", // Version bump to prevent conflicts with old structure
      storage: createJSONStorage(() => localStorage),

      // We only need to persist the project object itself
      partialize: (state) => ({
        project: state.project?.toJSON(),
      }),

      // On rehydration, create a new Project instance from the persisted plain object
      merge: (persistedState: any, currentState) => {
        if (persistedState?.project) {
          const project = new Project(persistedState.project as ProjectProperties);
          return {
            ...currentState,
            project,
            hasUnsavedChanges: false, // Reset on load
          };
        }
        return currentState;
      },
    }
  )
);
