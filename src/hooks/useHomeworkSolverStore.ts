
'use client';

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AnalyzedHomework,
  SolvedHomework,
} from "@/ai/flows/homework-solver.shared";

export type HomeworkSolverStage =
  | "idle"
  | "analyzing"
  | "readyToSolve"
  | "solving"
  | "solved";

export interface HomeworkHistoryEntry {
  id: string; // Using ISO timestamp as ID
  analyzedHomework: AnalyzedHomework;
  solvedHomework: SolvedHomework;
  homeworkFile: { name: string; type: string; dataUrl: string; };
  curriculumFile: { name: string; type: string; dataUrl: string; };
}

export interface HomeworkSolverState {
  stage: HomeworkSolverStage;
  analyzedHomework: AnalyzedHomework | null;
  solvedHomework: SolvedHomework | null;
  homeworkFile: { name: string; type: string; dataUrl: string } | null;
  curriculumFile: { name: string; type: string; dataUrl: string } | null;
  history: HomeworkHistoryEntry[];
  currentHistoryId: string | null;
}

interface HomeworkSolverActions {
  setStage: (stage: HomeworkSolverStage) => void;
  setAnalyzedHomework: (homework: AnalyzedHomework | null) => void;
  setSolvedHomework: (solution: SolvedHomework | null) => void;
  setHomeworkFile: (file: File | null) => Promise<void>;
  setCurriculumFile: (file: File | null) => Promise<void>;
  addSolvedHomeworkToHistory: (
    analyzedHomework: AnalyzedHomework,
    solvedHomework: SolvedHomework,
    homeworkFile: { name: string; type: string; dataUrl: string },
    curriculumFile: { name: string; type: string; dataUrl: string }
  ) => void;
  loadFromHistory: (id: string) => void;
  clearHistory: () => void;
  resetCurrent: () => void;
}

const initialState: HomeworkSolverState = {
  stage: "idle",
  analyzedHomework: null,
  solvedHomework: null,
  homeworkFile: null,
  curriculumFile: null,
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
};

export const useHomeworkSolverStore = create<
  HomeworkSolverState & HomeworkSolverActions
>()(
  persist(
    (set, get) => ({
      ...initialState,
      setStage: (stage) => set({ stage }),
      setAnalyzedHomework: (homework) =>
        set({
          analyzedHomework: homework,
          solvedHomework: null,
          stage: homework ? "readyToSolve" : "idle",
          currentHistoryId: null,
        }),
      setSolvedHomework: (solution) =>
        set({
          solvedHomework: solution,
          stage: solution ? "solved" : "readyToSolve",
        }),
      setHomeworkFile: async (file) => {
        if (!file) {
          set({ homeworkFile: null });
          return;
        }
        const dataUrl = await fileToDataUrl(file);
        set({ homeworkFile: { name: file.name, type: file.type, dataUrl } });
      },
      setCurriculumFile: async (file) => {
        if (!file) {
          set({ curriculumFile: null });
          return;
        }
        const dataUrl = await fileToDataUrl(file);
        set({ curriculumFile: { name: file.name, type: file.type, dataUrl } });
      },
      addSolvedHomeworkToHistory: (analyzedHomework, solvedHomework, homeworkFile, curriculumFile) => {
        const newEntry: HomeworkHistoryEntry = {
          id: new Date().toISOString(),
          analyzedHomework,
          solvedHomework,
          homeworkFile,
          curriculumFile,
        };
        set((state) => ({
          history: [newEntry, ...state.history].slice(0, 20), // Keep last 20 entries
          currentHistoryId: newEntry.id,
        }));
      },
      loadFromHistory: (id) => {
        const historyEntry = get().history.find((item) => item.id === id);
        if (historyEntry) {
          set({
            analyzedHomework: historyEntry.analyzedHomework,
            solvedHomework: historyEntry.solvedHomework,
            homeworkFile: historyEntry.homeworkFile,
            curriculumFile: historyEntry.curriculumFile,
            stage: "solved",
            currentHistoryId: id,
          });
        }
      },
      clearHistory: () => {
        set({ history: [], currentHistoryId: null });
        get().resetCurrent();
      },
      resetCurrent: () => {
        set({
          ...initialState,
          history: get().history, // Keep history on reset
        });
      },
    }),
    {
      name: "arkan-homework-solver-state-v2", // New name to avoid conflicts with old structure
      storage: createJSONStorage(() => localStorage),
       partialize: (state) => ({
        history: state.history,
      }),
    }
  )
);
