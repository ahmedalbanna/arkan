

'use client';

import { Agent } from '@/lib/models/agent';
import { type Section } from '@/lib/models/section';
import type { AgentPrompt } from '@/lib/types';
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
  oneTimeInstructions: Record<string, string>;
  selectedReportTemplateId: string;
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
  setOneTimeInstruction: (itemKey: string, value: string) => void;
  setSelectedReportTemplateId: (id: string) => void;
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

const initialState: GenerationUIState = {
  guidelineState: {},
  controlState: {},
  customGuidelineInput: {},
  oneTimeInstructions: {},
  selectedReportTemplateId: '',
  activePresentationId: null,
  advancedProposalFields: initialAdvancedFields,
};


export const useGenerationUIStore = create<GenerationUIState & GenerationUIActions>()(
  (set, get) => ({
    ...initialState,

    initializeDependentStates: (agents, sections) => {
      const { guidelineState, controlState } = get();
      if (Object.keys(guidelineState).length > 0 && Object.keys(controlState).length > 0) return;

      const newGuidelineState: Record<string, GuidelineState> = {};
      const newControlState: Record<string, ControlState> = {};

      agents.forEach(agent => {
        const prompt = agent.prompt as AgentPrompt;
        const itemKey = agent.id.replace('generate-', '').replace('-section', '').replace('-diagram', '');
        newGuidelineState[itemKey] = {
          checked: prompt?.guidelines?.map(g => g.isDefault) ?? [],
          custom: [],
        };
      });

      sections.forEach(section => {
        newControlState[section.id] = { ...defaultControlState };
      });

      set({ guidelineState: newGuidelineState, controlState: newControlState });
    },

    newSession: () => set(initialState),

    handleControlChange: (section, control, value) => set(state => ({
      controlState: { ...state.controlState, [section]: { ...(state.controlState[section] || defaultControlState), [control]: value } },
    })),

    handleGuidelineToggle: (itemKey, index, checked) => set(state => {
      const newGuidelines = { ...state.guidelineState };
      if (newGuidelines[itemKey]) {
        const newChecked = [...newGuidelines[itemKey].checked];
        newChecked[index] = checked;
        newGuidelines[itemKey] = { ...newGuidelines[itemKey], checked: newChecked };
      }
      return { guidelineState: newGuidelines };
    }),

    setCustomGuidelineInputForItem: (itemKey, value) => set(state => ({ customGuidelineInput: { ...state.customGuidelineInput, [itemKey]: value } })),

    handleAddCustomGuidelineForItem: (itemKey) => {
      const { guidelineState, customGuidelineInput } = get();
      const newGuideline = customGuidelineInput[itemKey]?.trim();
      if (newGuideline) {
        const newGuidelines = { ...guidelineState };
        if (!newGuidelines[itemKey]) newGuidelines[itemKey] = { checked: [], custom: [] };
        newGuidelines[itemKey].custom.push(newGuideline);
        set({ guidelineState: newGuidelines, customGuidelineInput: { ...customGuidelineInput, [itemKey]: '' } });
      }
    },

    handleRemoveCustomGuidelineForItem: (itemKey, index) => set(state => {
      const newGuidelines = { ...state.guidelineState };
      if (newGuidelines[itemKey]) newGuidelines[itemKey].custom.splice(index, 1);
      return { guidelineState: newGuidelines };
    }),

    setOneTimeInstruction: (itemKey, value) => set(state => ({ oneTimeInstructions: { ...state.oneTimeInstructions, [itemKey]: value } })),

    setSelectedReportTemplateId: (id) => set({ selectedReportTemplateId: id }),

    // From usePresentationStore
    setActivePresentationId: (id) => set({ activePresentationId: id }),

    // From useProposalGenerationStore
    setAdvancedField: (field, value) => set(state => ({ advancedProposalFields: { ...state.advancedProposalFields, [field]: value } })),
    resetAdvancedFields: () => set({ advancedProposalFields: initialAdvancedFields }),
  })
);
