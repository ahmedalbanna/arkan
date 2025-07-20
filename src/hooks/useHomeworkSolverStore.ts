
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AnalyzedHomework, SolvedHomework } from '@/ai/flows/homework-solver.shared';

export type HomeworkSolverStage = 'idle' | 'parsing' | 'analyzing' | 'readyToSolve' | 'solving' | 'solved';

export interface HomeworkHistoryEntry {
  id: string; // Using ISO timestamp as ID
  analyzedHomework: AnalyzedHomework;
  solvedHomework: SolvedHomework;
  originalFile: {
    name: string;
    type: string;
    dataUrl: string; // Store file as a data URL
  };
}

export interface HomeworkSolverState {
  stage: HomeworkSolverStage;
  analyzedHomework: AnalyzedHomework | null;
  solvedHomework: SolvedHomework | null;
  originalFile: { name: string; type: string; dataUrl: string; } | null;
  history: HomeworkHistoryEntry[];
  currentHistoryId: string | null;
}

interface HomeworkSolverActions {
  setStage: (stage: HomeworkSolverStage) => void;
  setAnalyzedHomework: (homework: AnalyzedHomework | null) => void;
  setSolvedHomework: (solution: SolvedHomework | null) => void;
  setOriginalFile: (file: File | null) => Promise<void>;
  addSolvedHomeworkToHistory: (analyzedHomework: AnalyzedHomework, solvedHomework: SolvedHomework, originalFile: { name: string; type: string; dataUrl: string; }) => void;
  loadFromHistory: (id: string) => void;
  clearHistory: () => void;
  resetCurrent: () => void;
}

const initialState: HomeworkSolverState = {
  stage: 'idle',
  analyzedHomework: null,
  solvedHomework: null,
  originalFile: null,
  history: [],
  currentHistoryId: null,
};

// Helper to convert File to Data URL
const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


export const useHomeworkSolverStore = create<HomeworkSolverState & HomeworkSolverActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setStage: (stage) => set({ stage }),
      setAnalyzedHomework: (homework) => set({ analyzedHomework: homework, solvedHomework: null, stage: homework ? 'readyToSolve' : 'idle', currentHistoryId: null }),
      setSolvedHomework: (solution) => set({ solvedHomework: solution, stage: solution ? 'solved' : 'readyToSolve' }),
      setOriginalFile: async (file) => {
        if (!file) {
            set({ originalFile: null });
            return;
        }
        const dataUrl = await fileToDataUrl(file);
        set({ originalFile: { name: file.name, type: file.type, dataUrl } });
      },
      addSolvedHomeworkToHistory: (analyzedHomework, solvedHomework, originalFile) => {
        const newEntry: HomeworkHistoryEntry = {
          id: new Date().toISOString(),
          analyzedHomework,
          solvedHomework,
          originalFile,
        };
        set(state => ({
            history: [newEntry, ...state.history].slice(0, 20), // Keep last 20 entries
            currentHistoryId: newEntry.id
        }));
      },
      loadFromHistory: (id) => {
        const historyEntry = get().history.find(item => item.id === id);
        if (historyEntry) {
          set({
            analyzedHomework: historyEntry.analyzedHomework,
            solvedHomework: historyEntry.solvedHomework,
            originalFile: historyEntry.originalFile,
            stage: 'solved',
            currentHistoryId: id,
          });
        }
      },
      clearHistory: () => set({ history: [] }),
      resetCurrent: () => set({
        stage: 'idle',
        analyzedHomework: null,
        solvedHomework: null,
        originalFile: null,
        currentHistoryId: null,
      }),
    }),
    {
      name: 'arkan-homework-solver-state', // Name for the localStorage item
      storage: createJSONStorage(() => localStorage),
      // We don't persist originalFile in the main state as it belongs to history entries
      partialize: (state) => ({ ...state, originalFile: null }),
    }
  )
);
