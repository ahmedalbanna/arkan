
'use client';

import { create } from "zustand";
import { PROPOSAL_TEMPLATES } from "@/lib/proposal-templates";
import { useBuilderStore } from "./useBuilderStore";

interface ProposalGenerationState {
  selectedTemplateId: string;
  customGuidelines: string[];
  customGuidelineInput: string;
}

interface ProposalGenerationActions {
  setSelectedTemplateId: (id: string) => void;
  addCustomGuideline: () => void;
  removeCustomGuideline: (index: number) => void;
  setCustomGuidelineInput: (value: string) => void;
}

const initialState: ProposalGenerationState = {
  selectedTemplateId: PROPOSAL_TEMPLATES[0].id,
  customGuidelines: [],
  customGuidelineInput: "",
};

export const useProposalGenerationStore = create<ProposalGenerationState & ProposalGenerationActions>()(
  (set, get) => ({
    ...initialState,
    setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),
    addCustomGuideline: () => {
      const { customGuidelines, customGuidelineInput } = get();
      const newGuideline = customGuidelineInput.trim();
      if (newGuideline) {
        set({
          customGuidelines: [...customGuidelines, newGuideline],
          customGuidelineInput: "",
        });
        useBuilderStore.getState().setHasUnsavedChanges(true);
      }
    },
    removeCustomGuideline: (index) =>
      set((state) => ({
        customGuidelines: state.customGuidelines.filter(
          (_, i) => i !== index
        ),
      })),
    setCustomGuidelineInput: (value) => set({ customGuidelineInput: value }),
  })
);
