
// code explantion in docs/hooks/useReportStore.md

'use client';

import { create } from 'zustand';
import { useAgentStore, type AgentWithComponent } from './useAgentStore';
import { useSectionStore } from './useSectionStore';
import type { AgentPrompt } from '@/lib/types';

// Type definitions for UI states. This store no longer holds project data.
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

// The state is now purely for UI control
interface ReportUIState {
  guidelineState: Record<string, GuidelineState>;
  controlState: Record<string, ControlState>;
  customGuidelineInput: Record<string, string>;
  contextSelection: Record<string, ContextSelectionValue>;
  selectedReportTemplateId: string;
  selectedPresentationTemplateId: string;
  templateSectionOrders: Record<string, string[]>;
}

interface ReportUIActions {
    initializeDependentStates: () => void;
    newSession: () => void; // Resets the UI state
    handleControlChange: (section: string, control: keyof ControlState, value: any) => void;
    handleGuidelineToggle: (itemKey: string, index: number, checked: boolean) => void;
    setCustomGuidelineInputForItem: (itemKey: string, value: string) => void;
    handleAddCustomGuidelineForItem: (itemKey: string) => void;
    handleRemoveCustomGuidelineForItem: (itemKey: string, index: number) => void;
    toggleContextSelection: (itemKey: string, type: 'sections' | 'diagrams' | 'externalContext' | 'proposal' | 'projectPlan', contextKey: string | number | null, isSelected: boolean) => void;
    initializeContextSelection: (itemKey: string, defaultContextIds: string[], externalContextCount: number) => void;
    setSelectedReportTemplateId: (id: string) => void;
    setSelectedPresentationTemplateId: (id: string) => void;
    setSectionOrderForTemplate: (templateId: string, orderedSectionIds: string[]) => void;
    getSectionOrderForTemplate: (templateId: string) => string[];
}

const getDefaultGuidelineState = (agents: Record<string, AgentWithComponent>): Record<string, GuidelineState> => {
  const state: Record<string, GuidelineState> = {};
  Object.values(agents).forEach(agent => {
    const prompt = agent.prompt as AgentPrompt;
    if (prompt && prompt.guidelines) {
      const itemKey = agent.id.replace('generate-', '').replace('-section', '').replace('-diagram', '');
      state[itemKey] = {
        checked: prompt.guidelines.map(g => g.isDefault),
        custom: [],
      };
    }
  });
  const presentationAgent = Object.values(agents).find(a => a.id === 'generate-presentation');
  if (presentationAgent) {
    const presentationPrompt = presentationAgent.prompt as AgentPrompt;
    state['presentation'] = {
      checked: presentationPrompt?.guidelines?.map((g: any) => g.isDefault) || [],
      custom: [],
    };
  }
  return state;
};

const defaultControlState = {
    formality: 50,
    tone: 'professional' as const,
    wordCount: '',
};

const initialState: ReportUIState = {
  guidelineState: {},
  controlState: {},
  customGuidelineInput: {},
  contextSelection: {},
  selectedReportTemplateId: '',
  selectedPresentationTemplateId: 'software-presentation',
  templateSectionOrders: {},
};

const emptySelection = { sections: {}, diagrams: {}, externalContext: [], proposal: false, projectPlan: false };

export const useReportStore = create<ReportUIState & ReportUIActions>()(
  (set, get) => ({
    ...initialState,

    initializeDependentStates: () => {
      const { reportSections } = useSectionStore.getState();
      const { agents } = useAgentStore.getState();
      const { controlState, guidelineState } = get();

      if (Object.keys(controlState).length > 0 && Object.keys(guidelineState).length > 0) {
        return;
      }

      const updates: Partial<ReportUIState> = {};

      if (Object.keys(controlState).length === 0 && Object.keys(reportSections).length > 0) {
        const initialControlState: Record<string, ControlState> = {};
        Object.keys(reportSections).forEach(key => {
          initialControlState[key] = { ...defaultControlState };
        });
        updates.controlState = initialControlState;
      }

      if (Object.keys(guidelineState).length === 0 && Object.keys(agents).length > 0) {
        updates.guidelineState = getDefaultGuidelineState(agents);
      }

      if (Object.keys(updates).length > 0) {
        set(updates);
      }
    },

    newSession: () => set(initialState),

    handleControlChange: (section, control, value) => {
      set(state => ({
          controlState: {
              ...state.controlState,
              [section]: { ...state.controlState[section], [control]: value }
          }
      }));
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
    },

    initializeContextSelection: (itemKey, defaultContextIds, externalContextCount) => {
      set(state => {
        const { sections: allSections } = useSectionStore.getState();
        const newSelection: ContextSelectionValue = {
            ...emptySelection,
            proposal: defaultContextIds.includes('proposal'),
            projectPlan: defaultContextIds.includes('projectPlan'),
            externalContext: Array(externalContextCount).fill(true),
        };

        defaultContextIds.forEach(id => {
            const sectionKey = Object.keys(allSections).find(key => allSections[key]?.agentId === id);
            if (sectionKey) {
                newSelection.sections[sectionKey] = true;
            }
        });

        return {
          contextSelection: {
            ...state.contextSelection,
            [itemKey]: newSelection,
          },
        };
      });
    },

    toggleContextSelection: (itemKey, type, contextKey, isSelected) => {
      set(state => {
          const newSelection = JSON.parse(JSON.stringify(state.contextSelection[itemKey] || { ...emptySelection, proposal: true, projectPlan: true }));

          if (type === 'proposal' || type === 'projectPlan') {
               newSelection[type] = isSelected;
          } else if (type === 'externalContext') {
              if (typeof contextKey === 'number') {
                  if (!Array.isArray(newSelection.externalContext)) {
                      newSelection.externalContext = [];
                  }
                  newSelection.externalContext[contextKey] = isSelected;
              }
          } else if (contextKey) {
              newSelection[type][contextKey as string] = isSelected;
          }
          return { contextSelection: {...state.contextSelection, [itemKey]: newSelection} };
      });
    },

    setSelectedReportTemplateId: (id: string) => set({ selectedReportTemplateId: id }),
    setSelectedPresentationTemplateId: (id: string) => set({ selectedPresentationTemplateId: id }),

    handleGuidelineToggle: (itemKey, index, checked) => {
      set(state => {
        const newGuidelines = { ...state.guidelineState };
        if (newGuidelines[itemKey]) {
          const newChecked = [...newGuidelines[itemKey].checked];
          newChecked[index] = checked;
          newGuidelines[itemKey] = { ...newGuidelines[itemKey], checked: newChecked };
        }
        return { guidelineState: newGuidelines };
      });
    },

    setSectionOrderForTemplate: (templateId, orderedSectionIds) => {
        set((state) => ({
            templateSectionOrders: {
                ...state.templateSectionOrders,
                [templateId]: orderedSectionIds,
            }
        }));
    },
    getSectionOrderForTemplate: (templateId: string) => {
        return get().templateSectionOrders[templateId] || [];
    },
  })
);
