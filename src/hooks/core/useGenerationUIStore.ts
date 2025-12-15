

'use client';

import { create } from 'zustand';



type GuidelineState = {
  checked: Record<number, boolean>;
  custom: string[];
};

interface GenerationUIState {

  guidelineState: Record<string, GuidelineState>;
  initializeGuidelines: (key: string, defaultGuidelines: any[]) => void;

  handleGuidelineToggle: (key: string, index: number, checked: boolean) => void;
  addCustomGuideline: (key: string, guideline: string) => void;
  removeCustomGuideline: (key: string, index: number) => void;
  resetAll: () => void;
}



export const useGenerationUIStore = create<GenerationUIState>((set, get) => ({

  guidelineState: {},



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

  resetAll: () => {
    set({
      guidelineState: {},
    });
  },
}));
