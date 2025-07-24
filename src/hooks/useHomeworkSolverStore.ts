
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

export interface FileData {
    name: string;
    type: string;
    dataUrl: string;
}

export interface HomeworkHistoryEntry {
  id: string; // Using ISO timestamp as ID
  analyzedHomework: AnalyzedHomework;
  solvedHomework: SolvedHomework;
  homeworkFiles: FileData[];
  curriculumFiles: FileData[];
}

export interface HomeworkSolverState {
  stage: HomeworkSolverStage;
  analyzedHomework: AnalyzedHomework | null;
  solvedHomework: SolvedHomework | null;
  homeworkFiles: FileData[];
  curriculumFiles: FileData[];
  history: HomeworkHistoryEntry[];
  currentHistoryId: string | null;
}

interface HomeworkSolverActions {
  setStage: (stage: HomeworkSolverStage) => void;
  setAnalyzedHomework: (homework: AnalyzedHomework | null) => void;
  setSolvedHomework: (solution: SolvedHomework | null) => void;
  setHomeworkFiles: (files: FileList | null) => Promise<void>;
  setCurriculumFiles: (files: FileList | null) => Promise<void>;
  removeHomeworkFile: (index: number) => void;
  removeCurriculumFile: (index: number) => void;
  addSolvedHomeworkToHistory: (
    analyzedHomework: AnalyzedHomework,
    solvedHomework: SolvedHomework,
    homeworkFiles: FileData[],
    curriculumFiles: FileData[]
  ) => void;
  loadFromHistory: (id: string) => void;
  clearHistory: () => void;
  resetCurrent: () => void;
}

const initialState: HomeworkSolverState = {
  stage: "idle",
  analyzedHomework: null,
  solvedHomework: null,
  homeworkFiles: [],
  curriculumFiles: [],
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
       setHomeworkFiles: async (files) => {
        if (!files || files.length === 0) {
          set({ homeworkFiles: [] });
          return;
        }
        const fileDataPromises = Array.from(files).map(async file => ({
            name: file.name,
            type: file.type,
            dataUrl: await fileToDataUrl(file),
        }));
        const fileData = await Promise.all(fileDataPromises);
        set({ homeworkFiles: fileData, stage: 'idle', analyzedHomework: null, solvedHomework: null });
      },
      setCurriculumFiles: async (files) => {
         if (!files || files.length === 0) {
          set({ curriculumFiles: [] });
          return;
        }
        const fileDataPromises = Array.from(files).map(async file => ({
            name: file.name,
            type: file.type,
            dataUrl: await fileToDataUrl(file),
        }));
        const fileData = await Promise.all(fileDataPromises);
        set({ curriculumFiles: fileData, stage: 'idle', analyzedHomework: null, solvedHomework: null });
      },
      removeHomeworkFile: (index) => set(state => ({ homeworkFiles: state.homeworkFiles.filter((_, i) => i !== index) })),
      removeCurriculumFile: (index) => set(state => ({ curriculumFiles: state.curriculumFiles.filter((_, i) => i !== index) })),
      addSolvedHomeworkToHistory: (analyzedHomework, solvedHomework, homeworkFiles, curriculumFiles) => {
        const newEntry: HomeworkHistoryEntry = {
          id: new Date().toISOString(),
          analyzedHomework,
          solvedHomework,
          homeworkFiles,
          curriculumFiles,
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
            homeworkFiles: historyEntry.homeworkFiles,
            curriculumFiles: historyEntry.curriculumFiles,
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
      name: "arkan-homework-solver-state-v3", // New name to avoid conflicts with old structure
      storage: createJSONStorage(() => localStorage),
       partialize: (state) => ({
        history: state.history,
      }),
    }
  )
);
