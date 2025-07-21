
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type SectionName, type DiagramType } from '@/ai/schemas';
import type { EvaluateReportOutput } from '@/ai/flows/evaluate-report';
import { sectionConfig } from '@/lib/report-config';
import { AGENTS, type AgentPrompt } from '@/lib/agents';
import { REPORT_GENERATION_TEMPLATES } from '@/lib/report-generation-templates';

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
  externalContext: ExternalContext | null;
  guidelineState: Record<string, GuidelineState>;
  controlState: Record<SectionName, ControlState>;
  customGuidelineInput: Record<string, string>;
  contextSelection: Record<string, { sections: Record<string, boolean>; diagrams: Record<string, boolean>; externalContext: boolean; }>;
  selectedReportTemplateId: string;
  selectedPresentationTemplateId: string;
}

interface ReportActions {
    newSession: () => void;
    loadState: (state: Partial<ReportState>) => void;
    setSection: (key: SectionName, content: string) => void;
    setAllSections: (sections: { [key in SectionName]?: string }) => void;
    setEvaluation: (evaluation: EvaluateReportOutput | null) => void;
    setExternalContext: (fileName: string, content: string) => void;
    removeExternalContext: () => void;
    handleControlChange: (section: SectionName, control: keyof ControlState, value: any) => void;
    handleGuidelineToggle: (itemKey: string, index: number, checked: boolean) => void;
    setCustomGuidelineInputForItem: (itemKey: string, value: string) => void;
    handleAddCustomGuidelineForItem: (itemKey: string) => void;
    handleRemoveCustomGuidelineForItem: (itemKey: string, index: number) => void;
    toggleContextSelection: (itemKey: string, type: 'sections' | 'diagrams' | 'externalContext', contextKey: string | null, isSelected: boolean) => void;
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
  externalContext: null,
  guidelineState: getDefaultGuidelineState(),
  controlState: Object.keys(sectionConfig).reduce((acc, key) => ({ ...acc, [key]: defaultControlState }), {} as Record<SectionName, ControlState>),
  customGuidelineInput: {},
  contextSelection: {},
  selectedReportTemplateId: REPORT_GENERATION_TEMPLATES[0].id,
  selectedPresentationTemplateId: 'software-presentation',
};


export const useReportStore = create<ReportState & ReportActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      newSession: () => set(initialState),
      loadState: (newState) => {
        if (newState.sections) set({ sections: newState.sections });
        if (newState.evaluation) set({ evaluation: newState.evaluation });
      },
      setSection: (key, content) => set(state => ({ sections: { ...state.sections, [key]: content } })),
      setAllSections: (sections) => set({ sections }),
      setEvaluation: (evaluation) => set({ evaluation }),
      setExternalContext: (fileName, content) => set({ externalContext: { fileName, content } }),
      removeExternalContext: () => set({ externalContext: null }),
      handleControlChange: (section, control, value) => {
        set(state => ({
            controlState: {
                ...state.controlState,
                [section]: { ...state.controlState[section], [control]: value }
            }
        }));
      },
      handleGuidelineToggle: (itemKey, index, checked) => {
        set(state => {
            const newGuidelineState = { ...state.guidelineState };
            newGuidelineState[itemKey].checked[index] = checked;
            return { guidelineState: newGuidelineState };
        });
      },
      setCustomGuidelineInputForItem: (itemKey, value) => {
        set(state => ({ customGuidelineInput: { ...state.customGuidelineInput, [itemKey]: value } }));
      },
      handleAddCustomGuidelineForItem: (itemKey) => {
          const { guidelineState, customGuidelineInput } = get();
          const newGuideline = customGuidelineInput[itemKey]?.trim();
          if (newGuideline) {
              const newGuidelines = { ...guidelineState };
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
              newGuidelines[itemKey].custom.splice(index, 1);
              return { guidelineState: newGuidelines };
          });
      },
      toggleContextSelection: (itemKey, type, contextKey, isSelected) => {
        set(state => {
            const newSelection = { ...state.contextSelection };
            if (!newSelection[itemKey]) {
                newSelection[itemKey] = { sections: {}, diagrams: {}, externalContext: false };
            }
            if (type === 'externalContext') {
                newSelection[itemKey].externalContext = isSelected;
            } else if (contextKey) {
                newSelection[itemKey][type][contextKey] = isSelected;
            }
            return { contextSelection: newSelection };
        });
      },
      setSelectedReportTemplateId: (id: string) => set({ selectedReportTemplateId: id }),
      setSelectedPresentationTemplateId: (id: string) => set({ selectedPresentationTemplateId: id }),
    }),
    {
      name: 'arkan-report-store',
      storage: createJSONStorage(() => localStorage),
       partialize: (state) => ({
        sections: state.sections,
        evaluation: state.evaluation,
        externalContext: state.externalContext,
      }),
    }
  )
);
