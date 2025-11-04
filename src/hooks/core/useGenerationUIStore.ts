
'use client';

import { create } from 'zustand';

type OutputStyle = {
  heading: boolean;
  paragraph: boolean;
  list: boolean;
};

export type Tone = 'professional' | 'academic' | 'casual' | 'persuasive';
export type GenerationControlState = {
  formality: number;
  complexity: number;
  tone: Tone;
  outputStyle: OutputStyle;
  wordCount: string;
};

type GuidelineState = {
  checked: Record<number, boolean>;
  custom: string[];
};

type ContextSelection = {
  sections: Record<string, boolean>;
  diagrams: Record<string, boolean>;
  externalContext: boolean[];
};

interface GenerationUIState {
  controlState: Record<string, GenerationControlState>;
  guidelineState: Record<string, GuidelineState>;
  contextSelection: Record<string, ContextSelection>;
  initializeControls: (key: string) => void;
  initializeGuidelines: (key: string, defaultGuidelines: any[]) => void;
  initializeContext: (key: string) => void;
  handleControlChange: <K extends keyof GenerationControlState>(
    key: string,
    field: K,
    value: GenerationControlState[K]
  ) => void;
  handleGuidelineToggle: (key: string, index: number, checked: boolean) => void;
  addCustomGuideline: (key: string, guideline: string) => void;
  removeCustomGuideline: (key: string, index: number) => void;
  toggleContextSelection: (
    key: string,
    type: 'sections' | 'diagrams' | 'externalContext',
    subKey: string | number,
    checked: boolean
  ) => void;
  resetAll: () => void;
}

const defaultControlState: GenerationControlState = {
  formality: 50,
  complexity: 50,
  tone: 'professional',
  outputStyle: { heading: true, paragraph: true, list: false },
  wordCount: '',
};

export const useGenerationUIStore = create<GenerationUIState>((set, get) => ({
  controlState: {},
  guidelineState: {},
  contextSelection: {},

  initializeControls: (key) => {
    if (!get().controlState[key]) {
      set((state) => ({
        controlState: {
          ...state.controlState,
          [key]: { ...defaultControlState },
        },
      }));
    }
  },

  initializeGuidelines: (key, defaultGuidelines) => {
    if (!get().guidelineState[key]) {
      const checked: Record<number, boolean> = {};
      defaultGuidelines.forEach((g, i) => {
        if (g.isDefault) {
          checked[i] = true;
        }
      });
      set((state) => ({
        guidelineState: {
          ...state.guidelineState,
          [key]: { checked, custom: [] },
        },
      }));
    }
  },

  initializeContext: (key: string) => {
    if (!get().contextSelection[key]) {
      set(state => ({
        contextSelection: {
          ...state.contextSelection,
          [key]: { sections: {}, diagrams: {}, externalContext: [] }
        }
      }));
    }
  },

  handleControlChange: (key, field, value) => {
    set((state) => ({
      controlState: {
        ...state.controlState,
        [key]: { ...state.controlState[key], [field]: value },
      },
    }));
  },

  handleGuidelineToggle: (key, index, checked) => {
    set((state) => {
      const keyState = state.guidelineState[key] || { checked: {}, custom: [] };
      return {
        guidelineState: {
          ...state.guidelineState,
          [key]: {
            ...keyState,
            checked: { ...keyState.checked, [index]: checked }
          }
        }
      };
    });
  },

  addCustomGuideline: (key, guideline) => {
    set(state => {
      const keyState = state.guidelineState[key] || { checked: {}, custom: [] };
      return {
        guidelineState: {
          ...state.guidelineState,
          [key]: {
            ...keyState,
            custom: [...keyState.custom, guideline]
          }
        }
      }
    });
  },

  removeCustomGuideline: (key, index) => {
    set(state => {
      const keyState = state.guidelineState[key];
      if (!keyState) return state;
      const newCustom = [...keyState.custom];
      newCustom.splice(index, 1);
      return {
        guidelineState: {
          ...state.guidelineState,
          [key]: { ...keyState, custom: newCustom }
        }
      }
    });
  },

  toggleContextSelection: (key, type, subKey, checked) => {
    set(state => {
      const keySelection = state.contextSelection[key] || { sections: {}, diagrams: {}, externalContext: [] };
      let newSelectionPart;

      if (type === 'externalContext') {
        const newArray = [...keySelection.externalContext];
        newArray[subKey as number] = checked;
        newSelectionPart = newArray;
      } else {
        newSelectionPart = {
          ...(keySelection[type] as Record<string, boolean>),
          [subKey as string]: checked
        };
      }

      return {
        contextSelection: {
          ...state.contextSelection,
          [key]: {
            ...keySelection,
            [type]: newSelectionPart
          }
        }
      };
    });
  },

  resetAll: () => {
    set({
      controlState: {},
      guidelineState: {},
      contextSelection: {},
    });
  },
}));
