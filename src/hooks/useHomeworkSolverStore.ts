
'use client';

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AnalyzedHomework,
  SolvedHomework,
} from "@/ai/flows/homework-solver.shared";
import type { HomeworkHistoryEntry } from "@/services/homework-service";

export interface FileData {
    name: string;
    type: string;
    dataUrl: string;
}

export interface HomeworkSolverState {
  stage: 'idle' | 'readyToSolve' | 'solved';
  analyzedHomework: AnalyzedHomework | null;
  solvedHomework: SolvedHomework | null;
  curriculumContext: string | null;
  homeworkFiles: FileData[];
  curriculumFiles: FileData[];
  currentHistoryId: string | null;
}

interface HomeworkSolverActions {
  setStage: (stage: HomeworkSolverState['stage']) => void;
  setAnalyzedHomework: (homework: AnalyzedHomework | null) => void;
  setSolvedHomework: (solution: SolvedHomework | null) => void;
  setCurriculumContext: (context: string | null) => void;
  setHomeworkFiles: (files: FileList | null) => Promise<void>;
  setCurriculumFiles: (files: FileList | null) => Promise<void>;
  removeHomeworkFile: (index: number) => void;
  removeCurriculumFile: (index: number) => void;
  loadFromHistory: (historyEntry: HomeworkHistoryEntry) => Promise<void>;
  resetCurrent: () => void;
}

const initialState: Omit<HomeworkSolverState, 'history'> = {
  stage: "idle",
  analyzedHomework: null,
  solvedHomework: null,
  curriculumContext: null,
  homeworkFiles: [],
  curriculumFiles: [],
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
      history: [], // History is now managed by React Query
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
      setCurriculumContext: (context) => set({ curriculumContext: context }),
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
        set({ homeworkFiles: fileData, stage: 'idle', analyzedHomework: null, solvedHomework: null, curriculumContext: null });
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
        set({ curriculumFiles: fileData, stage: 'idle', analyzedHomework: null, solvedHomework: null, curriculumContext: null });
      },
      removeHomeworkFile: (index) => set(state => ({ homeworkFiles: state.homeworkFiles.filter((_, i) => i !== index) })),
      removeCurriculumFile: (index) => set(state => ({ curriculumFiles: state.curriculumFiles.filter((_, i) => i !== index) })),
      
      loadFromHistory: async (historyEntry) => {
        // Fetch files from URLs and convert to FileData
        const homeworkFilesPromises = historyEntry.homeworkFiles.map(async f => ({ name: f.name, type: f.type, dataUrl: await fetch(f.url).then(r => r.blob()).then(fileToDataUrl) }));
        const curriculumFilesPromises = historyEntry.curriculumFiles.map(async f => ({ name: f.name, type: f.type, dataUrl: await fetch(f.url).then(r => r.blob()).then(fileToDataUrl) }));

        const [hwFiles, curFiles] = await Promise.all([
            Promise.all(homeworkFilesPromises),
            Promise.all(curriculumFilesPromises)
        ]);
        
        set({
            analyzedHomework: historyEntry.analyzedHomework,
            solvedHomework: historyEntry.solvedHomework,
            homeworkFiles: hwFiles,
            curriculumFiles: curFiles,
            stage: "solved",
            currentHistoryId: historyEntry.id,
            curriculumContext: null,
          });
      },
      resetCurrent: () => {
        set({
          ...initialState,
        });
      },
    }),
    {
      name: "arkan-homework-solver-state-v5",
      storage: createJSONStorage(() => localStorage),
       partialize: (state) => ({ 
           ...state,
           // Exclude dataUrls from persistence to avoid quota errors
           homeworkFiles: state.homeworkFiles.map(f => ({ name: f.name, type: f.type, dataUrl: '' })),
           curriculumFiles: state.curriculumFiles.map(f => ({ name: f.name, type: f.type, dataUrl: '' })),
        }),
    }
  )
);
