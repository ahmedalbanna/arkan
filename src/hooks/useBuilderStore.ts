
"use client";

import { toast } from "@/hooks";
import { Project, type ProjectProperties } from "@/lib/models/project";
import type { ContextFileType, SavedProject } from "@/lib/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
  replaceExternalContext: (index: number, newItem: { fileName: string, content: string, type: ContextFileType }) => void;
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
        const currentProject = get().project ?? new Project({ id: `temp-${Date.now()}`, userId: 'anonymous', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as ProjectProperties);
        updater(currentProject);
        // Create a new instance and set unsaved changes to true
        set({ project: new Project(currentProject.toJSON() as ProjectProperties), hasUnsavedChanges: true });
      },

      addExternalContext: (fileName: string, content: string, type: ContextFileType) => {
        get().updateProject(p => p.addExternalContext(fileName, content, type));
      },

      replaceExternalContext: (index: number, newItem: { fileName: string, content: string, type: ContextFileType }) => {
        get().updateProject(p => {
          if (p.externalContext) {
            p.externalContext[index] = newItem;
          }
        });
      },

      setHasUnsavedChanges: (status) => set({ hasUnsavedChanges: status }),
    }),
    {
      name: "arkan-builder-state-v3",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        project: state.project?.toJSON(),
      }),

      merge: (persistedState: any, currentState) => {
        if (persistedState?.project) {
          const project = new Project(persistedState.project as ProjectProperties);
          return {
            ...currentState,
            project,
            hasUnsavedChanges: false,
          };
        }
        return currentState;
      },
    }
  )
);
