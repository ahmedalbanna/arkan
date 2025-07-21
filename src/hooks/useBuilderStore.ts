
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type ProjectProposal } from '@/ai/schemas';
import { toast } from '@/hooks/use-toast';
import { useReportStore } from './useReportStore';
import { useDiagramStore } from './useDiagramStore';
import { usePresentationStore } from './usePresentationStore';
import { useCodeGeneratorStore } from './useCodeGeneratorStore';
import type { ProjectState } from '@/lib/types';

export interface BuilderState {
  projectIdea: string;
  proposal: ProjectProposal | null;
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
    setProjectIdea: (idea: string) => void;
    setCurrentProjectId: (id: string | null) => void;
    setHasUnsavedChanges: (status: boolean) => void;
    getFullState: () => ProjectState;
    // Proposal Actions
    setProposal: (proposal: ProjectProposal | null) => void;
    handleProposalUpdate: (path: string, value: any) => void;
    // UI State Actions
    setSelectedTemplateId: (id: string) => void;
    addCustomGuideline: () => void;
    removeCustomGuideline: (index: number) => void;
    setCustomGuidelineInput: (value: string) => void;
}

const initialState: BuilderState = {
  projectIdea: '',
  proposal: null,
  currentProjectId: null,
  hasUnsavedChanges: false,
  selectedTemplateId: 'default-software',
  customGuidelines: [],
  customGuidelineInput: '',
};


export const useBuilderStore = create<BuilderState & BuilderActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // --- GENERIC ACTIONS ---
      newSession: () => {
        set(initialState);
        // Reset other stores as well
        useReportStore.getState().newSession();
        useDiagramStore.getState().newSession();
        usePresentationStore.getState().newSession();
        useCodeGeneratorStore.getState().newSession();
        toast({ title: 'New Session Started', description: 'All content has been cleared.' });
      },
      loadState: (newState) => {
        set({
            projectIdea: newState.projectIdea || '',
            proposal: newState.proposal || null,
            currentProjectId: newState.id || null, // Set the current project ID
            hasUnsavedChanges: false, // Loading a project means it's saved
        });
        
        // Load state for other stores if present
        useReportStore.getState().loadState(newState);
        useDiagramStore.getState().loadState(newState);
        usePresentationStore.getState().loadState(newState);
        
        toast({ title: 'Project Loaded', description: `Successfully loaded "${newState.proposal?.title || 'project'}".` });
      },
      getFullState: () => ({
        projectIdea: get().projectIdea,
        proposal: get().proposal,
        sections: useReportStore.getState().sections,
        diagrams: useDiagramStore.getState().diagrams,
        presentation: usePresentationStore.getState().presentation,
      }),
      setProjectIdea: (idea) => set({ projectIdea: idea, hasUnsavedChanges: true }),
      setCurrentProjectId: (id) => set({ currentProjectId: id }),
      setHasUnsavedChanges: (status) => set({ hasUnsavedChanges: status }),
      
      // --- PROPOSAL ACTIONS ---
      setProposal: (proposal) => {
        set({
          proposal,
          // When a new proposal is generated, it's not a saved project yet.
          currentProjectId: null,
          hasUnsavedChanges: true,
        });
        // Clear downstream states when a new proposal is set
        useReportStore.getState().newSession();
        useDiagramStore.getState().newSession();
        usePresentationStore.getState().newSession();
      },
      handleProposalUpdate: (path, value) => {
          const { proposal } = get();
          if (!proposal) return;
          const newProposal = JSON.parse(JSON.stringify(proposal));
          let current = newProposal;
          const keys = path.split('.');
          for (let i = 0; i < keys.length - 1; i++) { current = current[keys[i]]; }
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
                  customGuidelineInput: '',
                  hasUnsavedChanges: true,
              });
          }
      },
      removeCustomGuideline: (index) => set(state => ({ 
        customGuidelines: state.customGuidelines.filter((_, i) => i !== index),
        hasUnsavedChanges: true,
      })),
      setCustomGuidelineInput: (value) => set({ customGuidelineInput: value }),
    }),
    {
      name: 'arkan-builder-state',
      storage: createJSONStorage(() => localStorage),
      // Only persist user-generated content, not transient UI state
      partialize: (state) => ({
        projectIdea: state.projectIdea,
        proposal: state.proposal,
        currentProjectId: state.currentProjectId,
        hasUnsavedChanges: state.hasUnsavedChanges, // Keep this to track across sessions
        // Persist other stores
        sections: useReportStore.getState().sections,
        diagrams: useDiagramStore.getState().diagrams,
        presentation: usePresentationStore.getState().presentation,
        codeGenerator: useCodeGeneratorStore.getState(),
      }),
      // Custom merge function to handle loading from storage
      merge: (persistedState: any, currentState) => {
        const merged: any = { ...currentState, ...persistedState };
        // Now, we need to hydrate the other stores from the persisted state
        // This is a bit of a trick to make all stores persist under one key
        useReportStore.getState().loadState(persistedState);
        useDiagramStore.getState().loadState(persistedState);
        usePresentationStore.getState().loadState(persistedState);
        useCodeGeneratorStore.getState().loadState(persistedState);
        return merged;
      },
    }
  )
);

    