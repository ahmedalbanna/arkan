
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type ProjectProposal } from '@/ai/schemas';
import { toast } from '@/hooks/use-toast';
import { useReportStore } from './useReportStore';
import { useDiagramStore } from './useDiagramStore';
import { usePresentationStore } from './usePresentationStore';
import { useCodeGeneratorStore } from './useCodeGeneratorStore';

export interface BuilderState {
  projectIdea: string;
  proposal: ProjectProposal | null;
  // UI States for proposal generation
  selectedTemplateId: string;
  customGuidelines: string[];
  customGuidelineInput: string;
}

interface BuilderActions {
    // Basic Actions
    newSession: () => void;
    loadState: (state: Partial<BuilderState & ReturnType<typeof useReportStore.getState> & ReturnType<typeof useDiagramStore.getState> & ReturnType<typeof usePresentationStore.getState> & ReturnType<typeof useCodeGeneratorStore.getState>>) => void;
    setProjectIdea: (idea: string) => void;
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
  selectedTemplateId: 'default',
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
        const { proposal } = newState;
        if(proposal) set({ proposal });
        
        // Load state for other stores if present
        useReportStore.getState().loadState(newState as any);
        useDiagramStore.getState().loadState(newState as any);
        usePresentationStore.getState().loadState(newState as any);
        useCodeGeneratorStore.getState().loadState(newState as any);

        toast({ title: 'Project Loaded', description: `Successfully loaded "${proposal?.title || 'project'}".` });
      },
      setProjectIdea: (idea) => set({ projectIdea: idea }),
      
      // --- PROPOSAL ACTIONS ---
      setProposal: (proposal) => {
        set({
          proposal,
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
          set({ proposal: newProposal });
      },
      
      // --- UI STATE ACTIONS ---
      setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),
      addCustomGuideline: () => {
          const { customGuidelines, customGuidelineInput } = get();
          const newGuideline = customGuidelineInput.trim();
          if (newGuideline) {
              set({
                  customGuidelines: [...customGuidelines, newGuideline],
                  customGuidelineInput: ''
              });
          }
      },
      removeCustomGuideline: (index) => set(state => ({ customGuidelines: state.customGuidelines.filter((_, i) => i !== index) })),
      setCustomGuidelineInput: (value) => set({ customGuidelineInput: value }),
    }),
    {
      name: 'arkan-builder-state',
      storage: createJSONStorage(() => localStorage),
      // Only persist user-generated content, not transient UI state
      partialize: (state) => ({
        projectIdea: state.projectIdea,
        proposal: state.proposal,
      }),
    }
  )
);
