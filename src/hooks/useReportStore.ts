
// code explantion in docs/hooks/useReportStore.md

'use client';

import { create } from 'zustand';
import { type SectionName, type DiagramType } from '@/ai/schemas';
import type { EvaluateReportOutput } from '@/ai/flows/evaluate-report';
import { sectionConfig } from '@/lib/report-config';
import { AGENTS, type AgentPrompt } from '@/lib/agents';
import { REPORT_GENERATION_TEMPLATES } from '@/lib/report-generation-templates';
import { useBuilderStore } from './useBuilderStore';

// Type definitions
export interface GuidelineState {
  checked: boolean[];
  custom: string[];
}

export interface ControlState {
  formality: number;
  tone: 'professional' | 'academic' | 'casual' | 'persuasive' | 'none';
  wordCount: string;
}

export interface ExternalContext {
    fileName: string;
    content: string;
}

export interface ReportState {
  sections: { [key in SectionName]?: string };
  evaluation: EvaluateReportOutput | null;
  // UI States
  externalContext: ExternalContext[];
  guidelineState: Record<string, GuidelineState>;
  controlState: Record<SectionName, ControlState>;
  customGuidelineInput: Record<string, string>;
  contextSelection: Record<string, { sections: Record<string, boolean>; diagrams: Record<string, boolean>; externalContext: boolean[]; proposal: boolean; projectPlan: boolean }>;
  selectedReportTemplateId: string;
  selectedPresentationTemplateId: string;
}

interface ReportActions {
    newSession: () => void;
    loadState: (state: Partial<Pick<ReportState, 'sections' | 'evaluation' | 'externalContext'>>) => void;
    setSection: (key: SectionName, content: string) => void;
    setAllSections: (sections: { [key in SectionName]?: string }) => void;
    setEvaluation: (evaluation: EvaluateReportOutput | null) => void;
    addExternalContext: (fileName: string, content: string) => void;
    removeExternalContext: (index: number) => void;
    handleControlChange: (section: SectionName, control: keyof ControlState, value: any) => void;
    handleGuidelineToggle: (itemKey: string, index: number, checked: boolean) => void;
    setCustomGuidelineInputForItem: (itemKey: string, value: string) => void;
    handleAddCustomGuidelineForItem: (itemKey: string) => void;
    handleRemoveCustomGuidelineForItem: (itemKey: string, index: number) => void;
    toggleContextSelection: (itemKey: string, type: 'sections' | 'diagrams' | 'externalContext' | 'proposal' | 'projectPlan', contextKey: string | number | null, isSelected: boolean) => void;
    setSelectedReportTemplateId: (id: string) => void;
    setSelectedPresentationTemplateId: (id: string) => void;
}

const getDefaultGuidelineState = () => {
    const state: Record<string, GuidelineState> = {};
    AGENTS.forEach(agent => {
        const prompt = agent.prompt as AgentPrompt;
        if (prompt && prompt.guidelines) {
            const itemKey = agent.id.replace('generate-', '').replace('-section', '').replace('-diagram', '');
            state[itemKey] = {
                checked: prompt.guidelines.map(g => g.isDefault),
                custom: [],
            };
        }
    });
    return state;
};

const defaultControlState = {
    formality: 50,
    tone: 'professional' as const,
    wordCount: '',
};

const initialState: ReportState = {
  sections: {},
  evaluation: null,
  externalContext: [],
  guidelineState: getDefaultGuidelineState(),
  controlState: Object.keys(sectionConfig).reduce((acc, key) => ({ ...acc, [key]: defaultControlState }), {} as Record<SectionName, ControlState>),
  customGuidelineInput: {},
  contextSelection: {},
  selectedReportTemplateId: REPORT_GENERATION_TEMPLATES[0].id,
  selectedPresentationTemplateId: 'software-presentation',
};


export const useReportStore = create<ReportState & ReportActions>()(
    (set, get) => ({
      ...initialState,
      newSession: () => set(initialState),
      loadState: (newState) => {
        if (newState.sections) set({ sections: newState.sections });
        if (newState.evaluation) set({ evaluation: newState.evaluation });
        if (newState.externalContext) set({ externalContext: newState.externalContext });
      },
      setSection: (key, content) => {
        set(state => ({ sections: { ...state.sections, [key]: content } }));
        useBuilderStore.getState().setHasUnsavedChanges(true);
      },
      setAllSections: (newSections) => {
        set(state => ({
            sections: {
                ...state.sections,
                ...newSections
            }
        }));
        useBuilderStore.getState().setHasUnsavedChanges(true);
      },
      setEvaluation: (evaluation) => {
        set({ evaluation });
        useBuilderStore.getState().setHasUnsavedChanges(true);
      },
      addExternalContext: (fileName, content) => {
        set((state) => ({ externalContext: [...state.externalContext, { fileName, content }] }));
        useBuilderStore.getState().setHasUnsavedChanges(true);
      },
      removeExternalContext: (index) => {
        set((state) => ({
            externalContext: state.externalContext.filter((_, i) => i !== index),
        }));
        useBuilderStore.getState().setHasUnsavedChanges(true);
      },
      handleControlChange: (section, control, value) => {
        set(state => ({
            controlState: {
                ...state.controlState,
                [section]: { ...state.controlState[section], [control]: value }
            }
        }));
        useBuilderStore.getState().setHasUnsavedChanges(true);
      },
      handleGuidelineToggle: (itemKey, index, checked) => {
        set(state => {
            const newGuidelineState = { ...state.guidelineState };
            if (!newGuidelineState[itemKey]) {
                const agent = AGENTS.find(a => a.id.includes(itemKey));
                const prompt = agent?.prompt as AgentPrompt;
                newGuidelineState[itemKey] = {
                    checked: prompt?.guidelines?.map(g => g.isDefault) || [],
                    custom: [],
                };
            }
            newGuidelineState[itemKey].checked[index] = checked;
            return { guidelineState: newGuidelineState };
        });
        useBuilderStore.getState().setHasUnsavedChanges(true);
      },
      setCustomGuidelineInputForItem: (itemKey, value) => {
        set(state => ({ customGuidelineInput: { ...state.customGuidelineInput, [itemKey]: value } }));
      },
      handleAddCustomGuidelineForItem: (itemKey) => {
          const { guidelineState, customGuidelineInput } = get();
          const newGuideline = customGuidelineInput[itemKey]?.trim();
          if (newGuideline) {
              const newGuidelines = { ...guidelineState };
              if (!newGuidelines[itemKey]) {
                newGuidelines[itemKey] = { checked: [], custom: [] };
              }
              newGuidelines[itemKey].custom.push(newGuideline);
              set({
                  guidelineState: newGuidelines,
                  customGuidelineInput: { ...customGuidelineInput, [itemKey]: '' }
              });
              useBuilderStore.getState().setHasUnsavedChanges(true);
          }
      },
      handleRemoveCustomGuidelineForItem: (itemKey, index) => {
          set(state => {
              const newGuidelines = { ...state.guidelineState };
              if (newGuidelines[itemKey]) {
                  newGuidelines[itemKey].custom.splice(index, 1);
              }
              return { guidelineState: newGuidelines };
          });
          useBuilderStore.getState().setHasUnsavedChanges(true);
      },
      toggleContextSelection: (itemKey, type, contextKey, isSelected) => {
        set(state => {
            const newSelection = JSON.parse(JSON.stringify(state.contextSelection));
            if (!newSelection[itemKey]) {
                newSelection[itemKey] = { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };
            }
            if (type === 'proposal' || type === 'projectPlan') {
                 newSelection[itemKey][type] = isSelected;
            } else if (type === 'externalContext') {
                if (typeof contextKey === 'number') {
                    if (!Array.isArray(newSelection[itemKey].externalContext)) {
                        newSelection[itemKey].externalContext = [];
                    }
                    newSelection[itemKey].externalContext[contextKey] = isSelected;
                }
            } else if (contextKey) {
                newSelection[itemKey][type][contextKey as string] = isSelected;
            }
            return { contextSelection: newSelection };
        });
        useBuilderStore.getState().setHasUnsavedChanges(true);
      },
      setSelectedReportTemplateId: (id: string) => {
        set({ selectedReportTemplateId: id });
        useBuilderStore.getState().setHasUnsavedChanges(true);
      },
      setSelectedPresentationTemplateId: (id: string) => {
        set({ selectedPresentationTemplateId: id });
        useBuilderStore.getState().setHasUnsavedChanges(true);
      },
    })
);
