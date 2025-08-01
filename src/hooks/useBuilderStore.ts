// code explantion in docs/hooks/useBuilderStore.md

"use client";

import { create } from "zustand";
import { type AnyProjectProposal } from "@/ai/schemas";
import { toast } from "@/hooks/use-toast";
import { useReportStore } from "./useReportStore";
import { useDiagramStore } from "./useDiagramStore";
import { usePresentationStore } from "./usePresentationStore";
import { useCodeGeneratorStore } from "./useCodeGeneratorStore";
import { useProjectPlanStore } from "./useProjectPlanStore";
import { useCodebaseStore } from "./useCodebaseStore";
import { useAcademicSolverStore } from './useAcademicSolverStore';
import type { ProjectState } from "@/lib/types";

/**
 * Zustand store for managing the core state of the project builder.
 * This store handles the fundamental project data like the idea and the generated proposal,
 * and orchestrates the state of other, more specific stores.
 */

export interface BuilderState {
  name?: string;
  projectIdea: string;
  proposal: AnyProjectProposal | null;
  currentProjectId: string | null; // To track if we are editing a saved project
  hasUnsavedChanges: boolean; // To track if a save is needed
}

interface BuilderActions {
  // Basic Actions
  newSession: () => void;
  loadState: (state: ProjectState & { id?: string }) => void;
  setProjectName: (name: string) => void;
  setProjectIdea: (idea: string) => void;
  setCurrentProjectId: (id: string | null) => void;
  setHasUnsavedChanges: (status: boolean) => void;
  getFullState: () => ProjectState;
  // Proposal Actions
  setProposal: (proposal: AnyProjectProposal | null) => void;
  handleProposalUpdate: (path: string, value: any) => void;
}

const initialState: BuilderState = {
  name: undefined,
  projectIdea: "",
  proposal: null,
  currentProjectId: null,
  hasUnsavedChanges: false,
};

export const useBuilderStore = create<BuilderState & BuilderActions>()(
  (set, get) => ({
    ...initialState,

    // --- GENERIC ACTIONS ---
    newSession: () => {
      set(initialState);
      useReportStore.getState().newSession();
      useDiagramStore.getState().newSession();
      usePresentationStore.getState().newSession();
      useCodeGeneratorStore.getState().newSession();
      useProjectPlanStore.getState().newSession();
      useCodebaseStore.getState().newSession();
      useAcademicSolverStore.getState().newSession();
      toast({
        title: "New Session Started",
        description: "All project content has been cleared.",
      });
    },
    loadState: (newState) => {
      set({
        name: newState.name,
        projectIdea: newState.projectIdea || "",
        proposal: newState.proposal,
        currentProjectId: newState.id || null, // Set the current project ID
        hasUnsavedChanges: false, // Loading a project means it's saved
      });

      // Orchestrate loading state into other stores
      useReportStore.getState().loadState(newState);
      useDiagramStore.getState().loadState(newState);
      usePresentationStore.getState().loadState(newState);
      useCodeGeneratorStore.getState().loadState(newState);
      useProjectPlanStore.getState().loadState(newState);
      useCodebaseStore.getState().loadState(newState);
      useAcademicSolverStore.getState().loadState(newState);

      toast({
        title: "Project Loaded",
        description: `Successfully loaded "${newState.name || (newState.proposal as any)?.title || "project"
          }".`,
      });
    },
    // This method gathers the necessary data from different stores to form a complete ProjectState object.
    getFullState: () => ({
      name: get().name!,
      projectIdea: get().projectIdea,
      proposal: get().proposal,
      sections: useReportStore.getState().sections,
      diagrams: useDiagramStore.getState().diagrams,
      presentation: usePresentationStore.getState().presentation,
      codeGenerator: useCodeGeneratorStore.getState(),
      codebase: useCodebaseStore.getState().codebase,
      externalContext: useReportStore.getState().externalContext,
      projectPlan: useProjectPlanStore.getState().projectPlan,
      academicSolver: useAcademicSolverStore.getState(),
      translatedSections: useReportStore.getState().translatedSections,
      evaluation: useReportStore.getState().evaluation,
    }),
    setProjectName: (name) => set({ name, hasUnsavedChanges: true }),
    setProjectIdea: (idea) =>
      set({ projectIdea: idea, hasUnsavedChanges: true }),
    setCurrentProjectId: (id) => set({ currentProjectId: id }),
    setHasUnsavedChanges: (status) => set({ hasUnsavedChanges: status }),

    // --- PROPOSAL ACTIONS ---
    setProposal: (proposal) => {
      set({
        proposal: proposal,
        name: proposal?.title || undefined,
        // currentProjectId: null, Don't reset project ID on re-generation
        hasUnsavedChanges: true,
      });
      // Clear downstream states when a new proposal is set
      useReportStore.getState().newSession();
      useDiagramStore.getState().newSession();
      usePresentationStore.getState().newSession();
      useProjectPlanStore.getState().newSession();
      useCodebaseStore.getState().newSession();
    },
    handleProposalUpdate: (path, value) => {
      const { proposal } = get();
      if (!proposal) return;
      const newProposal = JSON.parse(JSON.stringify(proposal));
      let current = newProposal;
      const keys = path.split(".");
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      set({ proposal: newProposal, hasUnsavedChanges: true });
    },
  })
);
