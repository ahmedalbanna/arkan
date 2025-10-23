
'use client';

import { Agent } from '@/lib/models/agent';
import { type Section } from '@/lib/models/section';
import type { AgentPrompt } from '@/lib/models/agent';
import { create } from 'zustand';

// State definitions for UI controls and selections, consolidated from old stores.

export interface GuidelineState {
  checked: boolean[];
  custom: string[];
}

export interface ControlState {
  formality: number;
  tone: 'professional' | 'academic' | 'casual' | 'persuasive' | 'none';
  wordCount: string;
}

interface ContextSelectionValue {
  sections: Record<string, boolean>;
  diagrams: Record<string, boolean>;
  externalContext: boolean[];
  proposal: boolean;
  projectPlan: boolean;
}

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

interface GenerationUIState {
  // From useReportStore
  guidelineState: Record<string, GuidelineState>;
  controlState: Record<string, ControlState>;
  customGuidelineInput: Record<string, string>;
  selectedReportTemplateId: string;
  contextSelection: Record<string, ContextSelectionValue>;
  // From usePresentationStore
  activePresentationId: string | null;
  // From useProposalGenerationStore
  advancedProposalFields: AdvancedProposalFields;
}

interface GenerationUIActions {
  initializeDependentStates: (agents: Agent[], sections: Section[]) => void;
  newSession: () => void;
  // Report Store Actions
  handleControlChange: (section: string, control: keyof ControlState, value: any) => void;
  handleGuidelineToggle: (itemKey: string, index: number, checked: boolean) => void;
  setCustomGuidelineInputForItem: (itemKey: string, value: string) => void;
  handleAddCustomGuidelineForItem: (itemKey: string) => void;
  handleRemoveCustomGuidelineForItem: (itemKey: string, index: number) => void;
  setSelectedReportTemplateId: (id: string) => void;
  toggleContextSelection: (itemKey: string, type: 'proposal' | 'projectPlan' | 'sections' | 'diagrams' | 'externalContext', subKey: string | number | null, checked: boolean) => void;
  // Presentation Store Actions
  setActivePresentationId: (id: string | null) => void;
  // Proposal Store Actions
  setAdvancedField: (field: keyof AdvancedProposalFields, value: string) => void;
  resetAdvancedFields: () => void;
}

const defaultControlState: ControlState = {
  formality: 50,
  tone: 'professional',
  wordCount: '',
};

const initialAdvancedFields: AdvancedProposalFields = {
  projectTitle: '', projectObjective: '', expectedOutcomes: '', stakeholders: '',
  projectContext: '', risksAndChallenges: '', projectRationale: '', additionalContext: '',
  methodology: '', timeline: '', budget: '',
};

const defaultGuidelineState: GuidelineState = {
    checked: [],
    custom: [],
}

const defaultContextSelection: ContextSelectionValue = {
    proposal: false,
    projectPlan: false,
    sections: {},
    diagrams: {},
    externalContext: [],
}

const initialState: GenerationUIState = {
  guidelineState: {},
  controlState: {},
  customGuidelineInput: {},
  selectedReportTemplateId: '',
  contextSelection: {},
  activePresentationId: null,
  advancedProposalFields: initialAdvancedFields,
};


export const useGenerationUIStore = create<GenerationUIState & GenerationUIActions>()(
  (set, get) => ({
    ...initialState,

    initializeDependentStates: (agents, sections) => {
      const { guidelineState, controlState, contextSelection } = get();
      if (Object.keys(guidelineState).length > 0 && Object.keys(controlState).length > 0) return;

      const newGuidelineState: Record<string, GuidelineState> = {};
      const newControlState: Record<string, ControlState> = {};
      const newContextSelection: Record<string, ContextSelectionValue> = {};

      const allItems = [...agents, ...sections];

      allItems.forEach(item => {
        const prompt = (item as Agent).prompt as AgentPrompt | undefined;
        const itemKey = item.id.replace('generate-', '').replace('-section', '').replace('-diagram', '');
        
        newGuidelineState[itemKey] = {
          checked: prompt?.guidelines?.map(g => g.isDefault) ?? [],
          custom: [],
        };
        newControlState[itemKey] = { ...defaultControlState };
        newContextSelection[itemKey] = { ...defaultContextSelection };
      });

      set({ guidelineState: newGuidelineState, controlState: newControlState, contextSelection: newContextSelection });
    },

    newSession: () => set(initialState),

    handleControlChange: (section, control, value) => set(state => ({
      controlState: { ...state.controlState, [section]: { ...(state.controlState[section] || defaultControlState), [control]: value } },
    })),

    handleGuidelineToggle: (itemKey, index, checked) => set(state => {
      const newGuidelines = { ...state.guidelineState };
      const currentGuidelines = newGuidelines[itemKey] || defaultGuidelineState;
      const newChecked = [...currentGuidelines.checked];
      newChecked[index] = checked;
      newGuidelines[itemKey] = { ...currentGuidelines, checked: newChecked };
      
      return { guidelineState: newGuidelines };
    }),

    setCustomGuidelineInputForItem: (itemKey, value) => set(state => ({ customGuidelineInput: { ...state.customGuidelineInput, [itemKey]: value } })),

    handleAddCustomGuidelineForItem: (itemKey) => {
      const { guidelineState, customGuidelineInput } = get();
      const newGuideline = customGuidelineInput[itemKey]?.trim();
      if (newGuideline) {
        const newGuidelines = { ...guidelineState };
        const currentGuidelines = newGuidelines[itemKey] || defaultGuidelineState;
        newGuidelines[itemKey] = { ...currentGuidelines, custom: [...currentGuidelines.custom, newGuideline]};
        set({ guidelineState: newGuidelines, customGuidelineInput: { ...customGuidelineInput, [itemKey]: '' } });
      }
    },

    handleRemoveCustomGuidelineForItem: (itemKey, index) => set(state => {
      const newGuidelines = { ...state.guidelineState };
      if (newGuidelines[itemKey]) {
          const updatedCustom = [...newGuidelines[itemKey].custom];
          updatedCustom.splice(index, 1);
          newGuidelines[itemKey] = { ...newGuidelines[itemKey], custom: updatedCustom };
      }
      return { guidelineState: newGuidelines };
    }),

    setSelectedReportTemplateId: (id) => set({ selectedReportTemplateId: id }),

    toggleContextSelection: (itemKey, type, subKey, checked) => set(state => {
      const newContextSelection = { ...state.contextSelection };
      const currentItemSelection = newContextSelection[itemKey] || { ...defaultContextSelection };

      let updatedSelectionPart;

      if (type === 'sections' || type === 'diagrams') {
        const currentSubSelection = currentItemSelection[type] || {};
        updatedSelectionPart = { ...currentItemSelection, [type]: { ...currentSubSelection, [subKey as string]: checked } };
      } else if (type === 'externalContext') {
         const currentSubSelection = currentItemSelection[type] || [];
         const newSelection = [...currentSubSelection];
         newSelection[subKey as number] = checked;
         updatedSelectionPart = { ...currentItemSelection, [type]: newSelection };
      } else {
        updatedSelectionPart = { ...currentItemSelection, [type]: checked };
      }
      
      newContextSelection[itemKey] = updatedSelectionPart;
      return { contextSelection: newContextSelection };
    }),

    // From usePresentationStore
    setActivePresentationId: (id) => set({ activePresentationId: id }),

    // From useProposalGenerationStore
    setAdvancedField: (field, value) => set(state => ({ advancedProposalFields: { ...state.advancedProposalFields, [field]: value } })),
    resetAdvancedFields: () => set({ advancedProposalFields: initialAdvancedFields }),
  })
);
