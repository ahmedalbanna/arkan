
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AnalyzedExam, SolvedExam } from '@/ai/flows/exam-solver.shared';

export type ExamSolverStage = 'idle' | 'parsing' | 'analyzing' | 'readyToSolve' | 'solving' | 'solved';

export interface ExamHistoryEntry {
  id: string; // Using ISO timestamp as ID
  analyzedExam: AnalyzedExam;
  solvedExam: SolvedExam;
}

export interface ExamSolverState {
  stage: ExamSolverStage;
  analyzedExam: AnalyzedExam | null;
  solvedExam: SolvedExam | null;
  history: ExamHistoryEntry[];
  currentHistoryId: string | null;
}

interface ExamSolverActions {
  setStage: (stage: ExamSolverStage) => void;
  setAnalyzedExam: (exam: AnalyzedExam | null) => void;
  setSolvedExam: (solution: SolvedExam | null) => void;
  addSolvedExamToHistory: (analyzedExam: AnalyzedExam, solvedExam: SolvedExam) => void;
  loadFromHistory: (id: string) => void;
  clearHistory: () => void;
  resetCurrent: () => void;
}

const initialState: ExamSolverState = {
  stage: 'idle',
  analyzedExam: null,
  solvedExam: null,
  history: [],
  currentHistoryId: null,
};

export const useExamSolverStore = create<ExamSolverState & ExamSolverActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setStage: (stage) => set({ stage }),
      setAnalyzedExam: (exam) => set({ analyzedExam: exam, solvedExam: null, stage: exam ? 'readyToSolve' : 'idle', currentHistoryId: null }),
      setSolvedExam: (solution) => set({ solvedExam: solution, stage: solution ? 'solved' : 'readyToSolve' }),
      addSolvedExamToHistory: (analyzedExam, solvedExam) => {
        const newEntry: ExamHistoryEntry = {
          id: new Date().toISOString(),
          analyzedExam,
          solvedExam,
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
            analyzedExam: historyEntry.analyzedExam,
            solvedExam: historyEntry.solvedExam,
            stage: 'solved',
            currentHistoryId: id,
          });
        }
      },
      clearHistory: () => set({ history: [] }),
      resetCurrent: () => set({
        stage: 'idle',
        analyzedExam: null,
        solvedExam: null,
        currentHistoryId: null,
      }),
    }),
    {
      name: 'arkan-exam-solver-state', // Name for the localStorage item
      storage: createJSONStorage(() => localStorage),
    }
  )
);
