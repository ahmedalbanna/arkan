
// code explantion in docs/hooks/useReportStore.md

'use client';

import { create } from 'zustand';
import type { EvaluateReportOutput } from '@/ai/schemas';
import { type AgentPrompt } from '@/lib/types';
import { useAgentStore, type AgentWithComponent } from './useAgentStore';
import { useSectionStore } from './useSectionStore';
import { useBuilderStore } from './useBuilderStore';
import type { ProjectState } from '@/lib/types';
import { SectionNameSchema } from '@/ai/schemas';

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

export type ContextFileType = 'context' | 'example' | 'question' | 'textbook' | 'guidelines';

export interface ExternalContext {
    fileName: string;
    content: string; // Can be markdown text or a base64 data URI
    type: ContextFileType;
}

interface ContextSelectionValue {
  sections: Record<string, boolean>;
  diagrams: Record<string, boolean>;
  externalContext: boolean[];
  proposal: boolean;
  projectPlan: boolean;
}

export interface ReportState {
  sections: Record<string, string | undefined>;
  translatedSections: Record<string, string | undefined>; // To store translations
  evaluation: EvaluateReportOutput | null;
  // UI States
  externalContext: ExternalContext[];
  guidelineState: Record<string, GuidelineState>;
  controlState: Record<string, ControlState>;
  customGuidelineInput: Record<string, string>;
  contextSelection: Record<string, ContextSelectionValue>;
  selectedReportTemplateId: string;
  selectedPresentationTemplateId: string;
  templateSectionOrders: Record<string, string[]>; // New state to store order
}

interface ReportActions {
    initializeDependentStates: () => void;
    newSession: () => void;
    loadState: (state: Partial<ProjectState>) => void;
    setSection: (key: string, content: string) => void;
    removeSection: (key: string) => void;
    setAllSections: (sections: Record<string, string | undefined>) => void;
    setTranslatedSection: (key: string, content: string) => void;
    setAllTranslatedSections: (sections: Record<string, string | undefined>) => void;
    setEvaluation: (evaluation: EvaluateReportOutput | null) => void;
    addExternalContext: (fileName: string, content: string, type: ContextFileType) => void;
    removeExternalContext: (index: number) => void;
    updateExternalContext: (index: number, newContent: string) => void;
    updateExternalContextType: (index: number, type: ContextFileType) => void;
    handleControlChange: (section: string, control: keyof ControlState, value: any) => void;
    handleGuidelineToggle: (itemKey: string, index: number, checked: boolean) => void;
    setCustomGuidelineInputForItem: (itemKey: string, value: string) => void;
    handleAddCustomGuidelineForItem: (itemKey: string) => void;
    handleRemoveCustomGuidelineForItem: (itemKey: string, index: number) => void;
    toggleContextSelection: (itemKey: string, type: 'sections' | 'diagrams' | 'externalContext' | 'proposal' | 'projectPlan', contextKey: string | number | null, isSelected: boolean) => void;
    initializeContextSelection: (itemKey: string, defaultContextIds: string[]) => void;
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
      // Extract itemKey from agent.id (e.g., 'generate-introduction-section' -> 'introduction')
      const itemKey = agent.id.replace('generate-', '').replace('-section', '').replace('-diagram', '');
      state[itemKey] = {
        checked: prompt.guidelines.map(g => g.isDefault),
        custom: [],
      };
    }
  });
  // Add a default for presentations if it exists
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

const initialState: ReportState = {
  sections: {},
  translatedSections: {},
  evaluation: null,
  externalContext: [],
  guidelineState: {}, // Initialize as empty, will be populated dynamically
  // Initialize controlState dynamically based on fetched sections
  controlState: {}, // This will be populated after sections are fetched

  customGuidelineInput: {},
  contextSelection: {},
  selectedReportTemplateId: '', // Set dynamically in the component
  selectedPresentationTemplateId: 'software-presentation',
  templateSectionOrders: {},
};

const emptySelection = { sections: {}, diagrams: {}, externalContext: [], proposal: false, projectPlan: false };

export const useReportStore = create<ReportState & ReportActions>()(
  (set, get) => ({
    ...initialState,

    initializeDependentStates: () => {
      const { reportSections } = useSectionStore.getState();
      const { agents } = useAgentStore.getState();
      const { controlState, guidelineState } = get();

      // Avoid re-initialization if already populated
      if (Object.keys(controlState).length > 0 && Object.keys(guidelineState).length > 0) {
        return;
      }

      const updates: Partial<ReportState> = {};

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

    setSection: (key, content) => {
      set(state => ({ sections: { ...state.sections, [key]: content } }));
      useBuilderStore.getState().setHasUnsavedChanges(true);
    },
    removeSection: (key) => {
        set(state => {
            const newSections = { ...state.sections };
            delete newSections[key];
            return { sections: newSections };
        });
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
    setTranslatedSection: (key, content) => {
      set(state => ({ translatedSections: { ...state.translatedSections, [key]: content } }));
      useBuilderStore.getState().setHasUnsavedChanges(true);
    },
    setAllTranslatedSections: (newSections) => {
      set(state => ({
          translatedSections: {
              ...state.translatedSections,
              ...newSections
          }
      }));
      useBuilderStore.getState().setHasUnsavedChanges(true);
    },
    setEvaluation: (evaluation) => {
      set({ evaluation });
      if(evaluation) {
        useBuilderStore.getState().setHasUnsavedChanges(true);
      }
    },
    addExternalContext: (fileName, content, type) => {
      set((state) => ({ externalContext: [...state.externalContext, { fileName, content, type }] }));
      useBuilderStore.getState().setHasUnsavedChanges(true);
    },
    removeExternalContext: (index) => {
      set((state) => ({
          externalContext: state.externalContext.filter((_, i) => i !== index),
      }));
      useBuilderStore.getState().setHasUnsavedChanges(true);
    },
    updateExternalContext: (index, newContent) => {
        set((state) => {
            const newContext = [...state.externalContext];
            if (newContext[index]) {
                newContext[index] = { ...newContext[index], content: newContent };
            }
            return { externalContext: newContext };
        });
        useBuilderStore.getState().setHasUnsavedChanges(true);
    },
    updateExternalContextType: (index: number, type: ContextFileType) => {
      set((state) => {
        const newContext = [...state.externalContext];
        if (newContext[index]) {
          newContext[index] = { ...newContext[index], type };
        }
        return { externalContext: newContext };
      });
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
    initializeContextSelection: (itemKey, defaultContextIds) => {
      set(state => {
        const { sections: allSections } = useSectionStore.getState();
        const newSelection: ContextSelectionValue = {
            ...emptySelection,
            proposal: defaultContextIds.includes('proposal'),
            projectPlan: defaultContextIds.includes('projectPlan'),
            externalContext: Array(state.externalContext.length).fill(true),
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
      useBuilderStore.getState().setHasUnsavedChanges(true);
    },

    setSectionOrderForTemplate: (templateId, orderedSectionIds) => {
        set((state) => ({
            templateSectionOrders: {
                ...state.templateSectionOrders,
                [templateId]: orderedSectionIds,
            }
        }));
         useBuilderStore.getState().setHasUnsavedChanges(true);
    },
    getSectionOrderForTemplate: (templateId: string) => {
        return get().templateSectionOrders[templateId] || [];
    },

    newSession: () => set(initialState),
    loadState: (newState) => {
      set({
          sections: newState.sections || {},
          evaluation: newState.evaluation || null,
          externalContext: newState.externalContext || [],
          translatedSections: newState.translatedSections || {},
      });
    },
  }),
);
