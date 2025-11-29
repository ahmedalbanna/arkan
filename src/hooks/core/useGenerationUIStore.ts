
'use client';

import { create } from 'zustand';



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

  guidelineState: Record<string, GuidelineState>;
  contextSelection: Record<string, ContextSelection>;
  initializeGuidelines: (key: string, defaultGuidelines: any[]) => void;
  initializeContext: (key: string) => void;

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



export const useGenerationUIStore = create<GenerationUIState>((set, get) => ({

  guidelineState: {},
  contextSelection: {},



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
      guidelineState: {},
      contextSelection: {},
    });
  },
}));
