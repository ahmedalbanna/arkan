// code explantion in docs/hooks/useBuilderStore.md

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type AnyProjectProposal, AnyProjectProposalSchema } from "@/ai/schemas";
import { toast } from "@/hooks/use-toast";
import { useReportStore } from "./useReportStore";
import { useDiagramStore } from "./useDiagramStore";
import { usePresentationStore } from "./usePresentationStore";
import { useCodeGeneratorStore } from "./useCodeGeneratorStore";
import { useProjectPlanStore } from "./useProjectPlanStore";
import { useCodebaseStore } from "./useCodebaseStore";
import { useAcademicSolverStore } from './useAcademicSolverStore';
import type { ProjectState } from "@/lib/types";
import { PROPOSAL_TEMPLATES } from "@/lib/proposal-templates";
import { z } from "zod";

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
  // UI States for proposal generation
  selectedTemplateId: string;
  customGuidelines: string[];
  customGuidelineInput: string;
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
  // UI State Actions
  setSelectedTemplateId: (id: string) => void;
  addCustomGuideline: () => void;
  removeCustomGuideline: (index: number) => void;
  setCustomGuidelineInput: (value: string) => void;
}

const initialState: BuilderState = {
  name: undefined,
  projectIdea: "",
  proposal: null,
  currentProjectId: null,
  hasUnsavedChanges: false,
  selectedTemplateId: PROPOSAL_TEMPLATES[0].id,
  customGuidelines: [],
  customGuidelineInput: "",
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
        toast({
          title: "New Session Started",
          description: "All project content has been cleared.",
        });
      },
      loadState: (newState) => {
        let loadedProposal: AnyProjectProposal | null = null;
        if (newState.proposal) {
          // Attempt to parse the loaded proposal with the flexible schema
          const parseResult = AnyProjectProposalSchema.safeParse(newState.proposal);
          if (parseResult.success) {
            loadedProposal = parseResult.data;
          } else {
            console.error("Failed to parse loaded proposal state:", parseResult.error);
            // Optionally show a toast or handle the error appropriately
            toast({ title: "Error loading proposal", description: "The loaded proposal data was invalid.", variant: "destructive" });
          }
        }

        set({
          name: newState.name,
          projectIdea: newState.projectIdea || "",
          proposal: loadedProposal, // Assign the parsed and validated proposal
          currentProjectId: newState.id || null, // Set the current project ID
          hasUnsavedChanges: false, // Loading a project means it's saved
        });

        useReportStore.getState().loadState({ ...newState });
        useDiagramStore.getState().loadState({ ...newState });
        usePresentationStore.getState().loadState({ ...newState });
        useCodeGeneratorStore.getState().loadState({ codeGenerator: newState.codeGenerator });
        useProjectPlanStore.getState().loadState({ projectPlan: newState.projectPlan });
        useCodebaseStore.getState().loadState({ codebase: newState.codebase });
        useAcademicSolverStore.getState().loadState({ academicSolver: newState.academicSolver });

        toast({
          title: "Project Loaded",
          description: `Successfully loaded "${newState.name || newState.proposal?.title || "project"
            }".`,
        });
      },
      // This method gathers the necessary data from different stores to form a complete ProjectState object.
      getFullState: () => ({
        name: get().name!, // Assuming name will be set before saving/getting full state
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
        agents: useReportStore.getState().guidelineState, // This should be guidelineState, not the agent list
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
          name: proposal?.title || undefined, // Ensure name is string or undefined
          // When a new proposal is generated, it's not a saved project yet.
          currentProjectId: null,
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

      // --- UI STATE ACTIONS ---
      setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),
      addCustomGuideline: () => {
        const { customGuidelines, customGuidelineInput } = get();
        const newGuideline = customGuidelineInput.trim();
        if (newGuideline) {
          set({
            customGuidelines: [...customGuidelines, newGuideline],
            customGuidelineInput: "",
            hasUnsavedChanges: true,
          });
        }
      },
      removeCustomGuideline: (index) =>
        set((state) => ({
          customGuidelines: state.customGuidelines.filter(
            (_, i) => i !== index
          ),
          hasUnsavedChanges: true,
        })),
      setCustomGuidelineInput: (value) => set({ customGuidelineInput: value }),
    }),
    {
      name: "arkan-builder-state-v4", // Bump version to avoid conflicts
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasUnsavedChanges(false);
        }
      },
      partialize: (state) => ({
        name: state.name,
        projectIdea: state.projectIdea,
        proposal: state.proposal,
        currentProjectId: state.currentProjectId,
        // Downstream states are loaded in the merge function, not part of the main builder store partial
      }),
      merge: (persistedState: any, currentState) => {
        const merged: any = { ...currentState, ...persistedState };

        // Ensure name is treated as string | undefined
        if (typeof persistedState.name !== 'string' && persistedState.name !== undefined) {
          merged.name = undefined; // Reset invalid name
          console.warn("Invalid 'name' type found in persisted state. Resetting to undefined.");
        }


        // Attempt to parse the loaded proposal with the schema during merge
        let loadedProposal: AnyProjectProposal | null = null;
        if (persistedState.proposal) {
          const parseResult = AnyProjectProposalSchema.safeParse(persistedState.proposal);
          if (parseResult.success) {
            loadedProposal = parseResult.data;
          } else {
            console.error("Failed to parse persisted proposal state during merge:", parseResult.error);
            // Optionally show a toast or handle the error appropriately
            toast({ title: "Error loading saved proposal", description: "The saved proposal data was invalid.", variant: "destructive" });
          }
        }

        useReportStore.getState().loadState({ ...persistedState });
        useDiagramStore.getState().loadState({ ...persistedState });
        usePresentationStore.getState().loadState({ ...persistedState });
        useCodeGeneratorStore.getState().loadState({ codeGenerator: persistedState.codeGenerator });
        useProjectPlanStore.getState().loadState({ projectPlan: persistedState.projectPlan });
        useCodebaseStore.getState().loadState({ codebase: persistedState.codebase });
        useAcademicSolverStore.getState().loadState({ academicSolver: persistedState.academicSolver });

        return { ...merged, proposal: loadedProposal, hasUnsavedChanges: false };
      },
    }
  )
);
