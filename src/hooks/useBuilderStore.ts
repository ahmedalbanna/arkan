// code explantion in docs/hooks/useBuilderStore.md

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "@/hooks";
import { Project, type ProjectProperties } from "@/lib/models/project"; // NEW: Import our main model
import type { ProjectState, SavedProject, AnyProjectProposal } from "@/lib/types";

// The new state is dramatically simplified
export interface BuilderState {
  project: Project | null;
  hasUnsavedChanges: boolean;
}

interface BuilderActions {
  newSession: () => void;
  loadProject: (savedProject: SavedProject) => void;
  setProject: (project: Project) => void; // To update the project instance
  setHasUnsavedChanges: (status: boolean) => void;
  getProjectState: () => ProjectState | null;

  // Setters for convenience
  setProjectName: (name: string) => void;
  setProjectIdea: (idea: string) => void;
  setProposal: (proposal: AnyProjectProposal | null) => void;
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

      setHasUnsavedChanges: (status) => set({ hasUnsavedChanges: status }),

      getProjectState: () => {
        return get().project?.toStateObject() ?? null;
      },

      // --- Actions that modify the project instance ---
      setProjectName: (name) => {
        const project = get().project;
        if (!project) return;
        project.name = name;
        // Create a new instance to trigger re-render
        get().setProject(new Project(project.toStateObject() as ProjectProperties));
      },

      setProjectIdea: (idea) => {
        const project = get().project;
        if (!project) return;
        project.projectIdea = idea;
        get().setProject(new Project(project.toStateObject() as ProjectProperties));
      },

      setProposal: (proposal) => {
        const project = get().project;
        if (!project) return;
        project.proposal = proposal;
        if (proposal?.title) {
          project.name = proposal.title;
        }
        get().setProject(new Project(project.toStateObject() as ProjectProperties));
      },
    }),
    {
      name: "arkan-builder-state-v3", // Version up to avoid conflicts
      storage: createJSONStorage(() => localStorage),

      // Persist the plain object version of the project
      partialize: (state) => ({
        project: state.project?.toStateObject(),
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