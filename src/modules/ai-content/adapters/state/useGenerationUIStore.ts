

'use client';

import { create } from 'zustand';
import { type SectionProperties } from '@/modules/ai-content/domain/entities/Section';

type GuidelineState = {
  checked: Record<number, boolean>;
  custom: string[];
};

interface GenerationUIState {
  guidelineState: Record<string, GuidelineState>;
  isBulkGenerating: boolean;
  abortRequested: boolean;
  abortControllers: Record<string, AbortController>;
  clipboard: Partial<SectionProperties> | null;
  initializeGuidelines: (key: string, defaultGuidelines: any[]) => void;
  handleGuidelineToggle: (key: string, index: number, checked: boolean) => void;
  addCustomGuideline: (key: string, guideline: string) => void;
  removeCustomGuideline: (key: string, index: number) => void;
  startBulk: () => void;
  stopBulk: () => void;
  requestAbort: () => void;
  registerAbortController: (key: string, controller: AbortController) => void;
  removeAbortController: (key: string) => void;
  cancelGeneration: (key: string) => void;
  copySettings: (settings: Partial<SectionProperties>) => void;
  resetAll: () => void;
}

export const useGenerationUIStore = create<GenerationUIState>((set, get) => ({
  guidelineState: {},
  isBulkGenerating: false,
  abortRequested: false,
  abortControllers: {},
  clipboard: null,

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

  startBulk: () => {
    set({ isBulkGenerating: true, abortRequested: false });
  },

  stopBulk: () => {
    set({ isBulkGenerating: false, abortRequested: false });
  },

  requestAbort: () => {
    set({ abortRequested: true });
  },

  registerAbortController: (key, controller) => {
    set(state => ({
        abortControllers: { ...state.abortControllers, [key]: controller }
    }));
  },

  removeAbortController: (key) => {
    set(state => {
        const newControllers = { ...state.abortControllers };
        delete newControllers[key];
        return { abortControllers: newControllers };
    });
  },

  cancelGeneration: (key) => {
    const controller = get().abortControllers[key];
    if (controller) {
        controller.abort();
        get().removeAbortController(key);
    }
  },

  copySettings: (settings) => {
    set({ clipboard: settings });
  },

  resetAll: () => {
    Object.values(get().abortControllers).forEach(c => c.abort());
    set({
      guidelineState: {},
      isBulkGenerating: false,
      abortRequested: false,
      abortControllers: {},
      clipboard: null,
    });
  },
}));
