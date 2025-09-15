

// code explantion in docs/hooks/useBuilderStore.md

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "@/hooks";
import { Project, type ProjectProperties } from "@/lib/models/project";
import type { ProjectState, SavedProject, AnyProjectProposal, ContextFileType } from "@/lib/types";

// The new state is dramatically simplified
export interface BuilderState {
  project: Project | null;
  hasUnsavedChanges: boolean;
}

interface BuilderActions {
  newSession: () => void;
  loadProject: (savedProject: SavedProject) => void;
  setProject: (project: Project) => void; // To update the project instance
  updateProject: (updater: (project: Project) => void) => void; // NEW: Helper for updates
  setHasUnsavedChanges: (status: boolean) => void;
  getProjectState: () => ProjectState | null;

  // Setters for convenience, now using updateProject
  setProjectName: (name: string) => void;
  setProjectIdea: (idea: string) => void;
  setProposal: (proposal: AnyProjectProposal | null) => void;
  addExternalContext: (fileName: string, content: string, type: ContextFileType) => void;
  removeExternalContext: (index: number) => void;
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
        set(initialState);
        useBuilderStore.persist.clearStorage();
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

      // NEW: Centralized update helper
      updateProject: (updater) => {
        const project = get().project ?? new Project({ id: `temp-${Date.now()}`, userId: 'anonymous', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as ProjectProperties);
        updater(project);
        get().setProject(new Project(project.toPlainObject() as ProjectProperties));
      },

      setHasUnsavedChanges: (status) => set({ hasUnsavedChanges: status }),

      getProjectState: () => {
        return get().project?.toStateObject() ?? null;
      },

      // --- Actions that modify the project instance ---
      setProjectName: (name) => {
        get().updateProject(p => { p.name = name; });
      },

      setProjectIdea: (idea) => {
         get().updateProject(p => { p.projectIdea = idea; });
      },

      setProposal: (proposal) => {
         get().updateProject(p => { p.setProposal(proposal); });
      },
      addExternalContext: (fileName, content, type) => {
         get().updateProject(p => { p.addExternalContext(fileName, content, type); });
      },
      removeExternalContext: (index) => {
         get().updateProject(p => { p.removeExternalContext(index); });
      },
    }),
    {
      name: "arkan-builder-state-v3", // Version up to avoid conflicts
      storage: createJSONStorage(() => localStorage),

      // Persist the plain object version of the project
      partialize: (state) => ({
        project: state.project?.toPlainObject(),
      }),

      // On rehydration, create a new Project instance from the persisted plain object
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
