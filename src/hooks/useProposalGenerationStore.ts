
'use client';

import { create } from "zustand";
import { PROPOSAL_TEMPLATES } from "@/lib/proposal-templates";
import { useBuilderStore } from "./useBuilderStore";

export interface AdvancedProposalFields {
    projectTitle: string;
    projectObjective: string;
    expectedOutcomes: string;
    stakeholders: string;
    projectContext: string;
    risksAndChallenges: string;
    projectRationale: string;
    additionalContext: string;
    methodology: string;
    timeline: string;
    budget: string;
}

interface ProposalGenerationState {
  selectedTemplateId: string;
  customGuidelines: string[];
  customGuidelineInput: string;
  advancedFields: AdvancedProposalFields;
}

interface ProposalGenerationActions {
  setSelectedTemplateId: (id: string) => void;
  addCustomGuideline: () => void;
  removeCustomGuideline: (index: number) => void;
  setCustomGuidelineInput: (value: string) => void;
  setAdvancedField: (field: keyof AdvancedProposalFields, value: string) => void;
  resetAdvancedFields: () => void;
}

const initialAdvancedFields: AdvancedProposalFields = {
    projectTitle: '',
    projectObjective: '',
    expectedOutcomes: '',
    stakeholders: '',
    projectContext: '',
    risksAndChallenges: '',
    projectRationale: '',
    additionalContext: '',
    methodology: '',
    timeline: '',
    budget: '',
};

const initialState: ProposalGenerationState = {
  selectedTemplateId: PROPOSAL_TEMPLATES[0].id,
  customGuidelines: [],
  customGuidelineInput: "",
  advancedFields: initialAdvancedFields,
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
    setAdvancedField: (field, value) => {
        set(state => ({
            advancedFields: {
                ...state.advancedFields,
                [field]: value
            }
        }));
         useBuilderStore.getState().setHasUnsavedChanges(true);
    },
    resetAdvancedFields: () => set({ advancedFields: initialAdvancedFields }),
  })
);
