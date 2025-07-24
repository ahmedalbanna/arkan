// code explantion in docs/hooks/useExamSolverStore.md

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AnalyzedExam, SolvedExam } from "@/ai/flows/exam-solver.shared";

export type ExamSolverStage =
  | "idle"
  | "parsing"
  | "analyzing"
  | "readyToSolve"
  | "solving"
  | "solved";

export interface ExamHistoryEntry {
  id: string; // Using ISO timestamp as ID
  analyzedExam: AnalyzedExam;
  solvedExam: SolvedExam;
  originalFile: {
    name: string;
    type: string;
    dataUrl: string; // Store file as a data URL
  };
}

export interface ExamSolverState {
  stage: ExamSolverStage;
  analyzedExam: AnalyzedExam | null;
  solvedExam: SolvedExam | null;
  originalFile: { name: string; type: string; dataUrl: string } | null;
  history: ExamHistoryEntry[];
  currentHistoryId: string | null;
}

interface ExamSolverActions {
  setStage: (stage: ExamSolverStage) => void;
  setAnalyzedExam: (exam: AnalyzedExam | null) => void;
  setSolvedExam: (solution: SolvedExam | null) => void;
  setOriginalFile: (file: File | null) => Promise<void>;
  addSolvedExamToHistory: (
    analyzedExam: AnalyzedExam,
    solvedExam: SolvedExam,
    originalFile: { name: string; type: string; dataUrl: string }
  ) => void;
  loadFromHistory: (id: string) => void;
  clearHistory: () => void;
  resetCurrent: () => void;
}

const initialState: ExamSolverState = {
  stage: "idle",
  analyzedExam: null,
  solvedExam: null,
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
};

export const useExamSolverStore = create<ExamSolverState & ExamSolverActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setStage: (stage) => set({ stage }),
      setAnalyzedExam: (exam) =>
        set({
          analyzedExam: exam,
          solvedExam: null,
          stage: exam ? "readyToSolve" : "idle",
          currentHistoryId: null,
        }),
      setSolvedExam: (solution) =>
        set({
          solvedExam: solution,
          stage: solution ? "solved" : "readyToSolve",
        }),
      setOriginalFile: async (file) => {
        if (!file) {
          set({
            originalFile: null,
            stage: "idle",
            analyzedExam: null,
            solvedExam: null,
          });
          return;
        }
        const dataUrl = await fileToDataUrl(file);
        set({
          originalFile: { name: file.name, type: file.type, dataUrl },
          stage: "idle",
          analyzedExam: null,
          solvedExam: null,
        });
      },
      addSolvedExamToHistory: (analyzedExam, solvedExam, originalFile) => {
        const newEntry: ExamHistoryEntry = {
          id: new Date().toISOString(),
          analyzedExam,
          solvedExam,
          originalFile,
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
            analyzedExam: historyEntry.analyzedExam,
            solvedExam: historyEntry.solvedExam,
            originalFile: historyEntry.originalFile,
            stage: "solved",
            currentHistoryId: id,
          });
        }
      },
      clearHistory: () => {
        set({ history: [], currentHistoryId: null });
        get().resetCurrent();
      },
      resetCurrent: () => set(initialState),
    }),
    {
      name: "arkan-exam-solver-state", // Name for the localStorage item
      storage: createJSONStorage(() => localStorage),
      // We don't persist originalFile in the main state as it belongs to history entries
      partialize: (state) => ({ ...state, originalFile: null }),
    }
  )
);
