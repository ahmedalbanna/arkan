'use client';

import { type SectionProperties } from '@/modules/ai-content/domain/entities/Section';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type GuidelineState = {
  checked: Record<number, boolean>;
  custom: string[];
};

interface GenerationHistory {
  id: string;
  timestamp: number;
  sectionId: string;
  prompt: string;
  result: string;
  duration: number;
  success: boolean;
}

interface GenerationPreferences {
  defaultTemperature: number;
  defaultMaxTokens: number;
  defaultUseRAG: boolean;
  autoSaveGenerated: boolean;
  showConfirmation: boolean;
  maxHistoryItems: number;
}

interface GenerationUIState {
  // State
  guidelineState: Record<string, GuidelineState>;
  isBulkGenerating: boolean;
  abortRequested: boolean;
  bulkTotal: number;
  bulkProgress: number;
  bulkStartTime: number | null;
  abortControllers: Record<string, AbortController>;
  clipboard: Partial<SectionProperties> | null;
  generationHistory: GenerationHistory[];
  preferences: GenerationPreferences;
  activeGenerationId: string | null;

  // Actions
  initializeGuidelines: (key: string, defaultGuidelines: any[]) => void;
  handleGuidelineToggle: (key: string, index: number, checked: boolean) => void;
  addCustomGuideline: (key: string, guideline: string) => void;
  removeCustomGuideline: (key: string, index: number) => void;
  updateCustomGuideline: (key: string, index: number, guideline: string) => void;

  // Bulk operations
  startBulk: (total: number) => void;
  stopBulk: () => void;
  requestAbort: () => void;
  incrementProgress: () => void;
  resetBulk: () => void;

  // Abort controllers
  registerAbortController: (key: string, controller: AbortController) => void;
  removeAbortController: (key: string) => void;
  cancelGeneration: (key: string) => void;
  cancelAllGenerations: () => void;

  // Clipboard
  copySettings: (settings: Partial<SectionProperties>) => void;
  clearClipboard: () => void;

  // History
  addToHistory: (entry: Omit<GenerationHistory, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;

  // Preferences
  updatePreference: <K extends keyof GenerationPreferences>(key: K, value: GenerationPreferences[K]) => void;
  resetPreferences: () => void;

  // Active generation tracking
  setActiveGenerationId: (id: string | null) => void;

  // Reset all
  resetAll: () => void;
}

const defaultPreferences: GenerationPreferences = {
  defaultTemperature: 0.7,
  defaultMaxTokens: 2000,
  defaultUseRAG: false,
  autoSaveGenerated: true,
  showConfirmation: false,
  maxHistoryItems: 50,
};

export const useGenerationUIStore = create<GenerationUIState>()(
  persist(
    (set, get) => ({
      // Initial state
      guidelineState: {},
      isBulkGenerating: false,
      abortRequested: false,
      bulkTotal: 0,
      bulkProgress: 0,
      bulkStartTime: null,
      abortControllers: {},
      clipboard: null,
      generationHistory: [],
      preferences: defaultPreferences,
      activeGenerationId: null,

      // Guideline management
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
          };
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
          };
        });
      },

      updateCustomGuideline: (key, index, guideline) => {
        set(state => {
          const keyState = state.guidelineState[key];
          if (!keyState || !keyState.custom[index]) return state;
          const newCustom = [...keyState.custom];
          newCustom[index] = guideline;
          return {
            guidelineState: {
              ...state.guidelineState,
              [key]: { ...keyState, custom: newCustom }
            }
          };
        });
      },

      // Bulk operations
      startBulk: (total) => {
        set({
          isBulkGenerating: true,
          abortRequested: false,
          bulkTotal: total,
          bulkProgress: 0,
          bulkStartTime: Date.now()
        });
      },

      stopBulk: () => {
        set({
          isBulkGenerating: false,
          abortRequested: false,
          bulkTotal: 0,
          bulkProgress: 0,
          bulkStartTime: null
        });
      },

      requestAbort: () => {
        set({ abortRequested: true });
        // Cancel all active generations
        get().cancelAllGenerations();
      },

      incrementProgress: () => {
        set(state => ({
          bulkProgress: Math.min(state.bulkTotal, state.bulkProgress + 1)
        }));
      },

      resetBulk: () => {
        set({
          isBulkGenerating: false,
          abortRequested: false,
          bulkTotal: 0,
          bulkProgress: 0,
          bulkStartTime: null,
        });
      },

      // Abort controller management
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

      cancelAllGenerations: () => {
        const controllers = get().abortControllers;
        Object.values(controllers).forEach(controller => controller.abort());
        set({ abortControllers: {} });
      },

      // Clipboard
      copySettings: (settings) => {
        set({ clipboard: settings });
        // Auto-clear clipboard after 30 seconds
        setTimeout(() => {
          if (get().clipboard === settings) {
            set({ clipboard: null });
          }
        }, 30000);
      },

      clearClipboard: () => {
        set({ clipboard: null });
      },

      // History management
      addToHistory: (entry) => {
        const newEntry: GenerationHistory = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          ...entry,
        };

        set(state => {
          const newHistory = [newEntry, ...state.generationHistory];
          // Limit history size
          const maxItems = state.preferences.maxHistoryItems;
          if (newHistory.length > maxItems) {
            newHistory.pop();
          }
          return { generationHistory: newHistory };
        });
      },

      clearHistory: () => {
        set({ generationHistory: [] });
      },

      removeFromHistory: (id) => {
        set(state => ({
          generationHistory: state.generationHistory.filter(h => h.id !== id)
        }));
      },

      // Preferences
      updatePreference: (key, value) => {
        set(state => ({
          preferences: { ...state.preferences, [key]: value }
        }));
      },

      resetPreferences: () => {
        set({ preferences: defaultPreferences });
      },

      // Active generation tracking
      setActiveGenerationId: (id) => {
        set({ activeGenerationId: id });
      },

      // Reset all
      resetAll: () => {
        get().cancelAllGenerations();
        set({
          guidelineState: {},
          isBulkGenerating: false,
          abortRequested: false,
          abortControllers: {},
          clipboard: null,
          activeGenerationId: null,
        });
      },
    }),
    {
      name: 'generation-ui-storage',
      partialize: (state) => ({
        preferences: state.preferences,
        generationHistory: state.generationHistory.slice(0, 20), // Only persist last 20
      }),
    }
  )
);
