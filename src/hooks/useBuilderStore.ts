// code explantion in docs/hooks/useBuilderStore.md

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type AnyProjectProposal, ProjectStateSchema } from "@/ai/schemas";
import { toast } from "@/hooks/use-toast";
import { useReportStore } from "./useReportStore";
import { useDiagramStore } from "./useDiagramStore";
import { usePresentationStore } from "./usePresentationStore";
import { useCodeGeneratorStore } from "./useCodeGeneratorStore";
import { useProjectPlanStore } from "./useProjectPlanStore";
import { useCodebaseStore } from "./useCodebaseStore";
import { useAcademicSolverStore } from './useAcademicSolverStore';
import type { ProjectState, FullReportModeConfig, SavedProposalState } from "@/lib/types";

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
  reportConfig?: FullReportModeConfig | null; // Add reportConfig to the state
  generatedProposalState?: SavedProposalState | null;
}

interface BuilderActions {
  // Basic Actions
  newSession: () => void;
  loadState: (state: ProjectState & { id?: string }) => void;
  setProjectName: (name: string) => void;
  setProjectIdea: (idea: string) => void;
  setCurrentProjectId: (id: string | null) => void;
  setHasUnsavedChanges: (status: boolean) => void;
  setReportConfig: (config: FullReportModeConfig | null) => void; // Add setter for reportConfig
  setGeneratedProposalState: (state: SavedProposalState | null) => void;
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
  reportConfig: null,
  generatedProposalState: null,
};

export const useBuilderStore = create<BuilderState & BuilderActions>()(
  persist(
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
        // Clear persisted storage as well
        useBuilderStore.persist.clearStorage();
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
          reportConfig: newState.reportConfig, // Load the report config
          generatedProposalState: newState.generatedProposalState,
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
        reportConfig: get().reportConfig, // Include reportConfig in the full state
        generatedProposalState: get().generatedProposalState,
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
      setReportConfig: (config) => set({ reportConfig: config, hasUnsavedChanges: true }),
      setGeneratedProposalState: (state) => set({ generatedProposalState: state, hasUnsavedChanges: true }),

      // --- PROPOSAL ACTIONS ---
      setProposal: (proposal) => {
        set({
          proposal: proposal,
          name: (proposal?.title || 'new Project') as string,
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
    }),
    {
      name: "arkan-builder-state-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        name: state.name,
        projectIdea: state.projectIdea,
        proposal: state.proposal,
        currentProjectId: state.currentProjectId,
        reportConfig: state.reportConfig,
        generatedProposalState: state.generatedProposalState,
        // Include substore states for persistence
        sections: useReportStore.getState().sections,
        diagrams: useDiagramStore.getState().diagrams,
        presentation: usePresentationStore.getState().presentation,
        codeGenerator: useCodeGeneratorStore.getState(),
        projectPlan: useProjectPlanStore.getState().projectPlan,
        codebase: useCodebaseStore.getState().codebase,
        academicSolver: useAcademicSolverStore.getState(),
        // evaluation: useReportStore.getState().evaluation,
      }),
      merge: (persistedState: any, currentState) => {
        const state = persistedState as ProjectState;
        // This function runs on rehydration. We need to manually
        // load the state into the other stores.
        useReportStore.getState().loadState(state);
        useDiagramStore.getState().loadState(state);
        usePresentationStore.getState().loadState(state);
        useCodeGeneratorStore.getState().loadState(state);
        useProjectPlanStore.getState().loadState(state);
        useCodebaseStore.getState().loadState(state);
        useAcademicSolverStore.getState().loadState(state);

        // Return the state for the main builder store, ensuring hasUnsavedChanges is false on load
        return {
            ...currentState,
            ...state,
            hasUnsavedChanges: false,
        };
      },
    }
  )
);
