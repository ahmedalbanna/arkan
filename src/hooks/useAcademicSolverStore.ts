
'use client';

import { create } from "zustand";
import type { AnalyzedDocument, SolvedDocument, AcademicDocumentType } from "@/ai/schemas";
import { useBuilderStore } from "./useBuilderStore";
import { ExternalContext } from "@/hooks";

export type AcademicSolverStage =
  | "idle"
  | "parsing"
  | "analyzing"
  | "readyToSolve"
  | "solving"
  | "solved";



export interface AcademicSolverState {
  stage: AcademicSolverStage;
  documentType: AcademicDocumentType | null;
  analyzedDocument: AnalyzedDocument | null;
  solvedDocument: SolvedDocument | null;
  questionDocuments: ExternalContext[];
  externalContext: ExternalContext[];
}

interface AcademicSolverActions {
  setStage: (stage: AcademicSolverStage) => void;
  setDocumentType: (type: AcademicDocumentType | null) => void;
  setAnalyzedDocument: (document: AnalyzedDocument | null) => void;
  setSolvedDocument: (solution: SolvedDocument | null) => void;
  addQuestionDocument: (fileName: string, content: string) => void;
  removeQuestionDocument: (index: number) => void;
  addExternalContext: (fileName: string, content: string) => void;
  removeExternalContext: (index: number) => void;
  newSession: () => void;
  loadState: (state: Partial<{ academicSolver: AcademicSolverState }>) => void;
  resetCurrent: () => void;
}

const initialState: AcademicSolverState = {
  stage: "idle",
  documentType: null,
  analyzedDocument: null,
  solvedDocument: null,
  questionDocuments: [],
  externalContext: [],
};

export const useAcademicSolverStore = create<AcademicSolverState & AcademicSolverActions>()(
  (set) => ({
    ...initialState,
    setStage: (stage) => set({ stage }),
    setDocumentType: (type) => set({ documentType: type }),
    setAnalyzedDocument: (document) =>
      set({
        analyzedDocument: document,
        solvedDocument: null,
        stage: document ? "readyToSolve" : "idle",
      }),
    setSolvedDocument: (solution) =>
      set({
        solvedDocument: solution,
        stage: solution ? "solved" : "readyToSolve",
      }),
    addQuestionDocument: (fileName, content) => {
        set((state) => ({
            questionDocuments: [...state.questionDocuments, { fileName, content, type: 'question' }],
            analyzedDocument: null,
            solvedDocument: null,
        }));
        useBuilderStore.getState().setHasUnsavedChanges(true);
    },
    removeQuestionDocument: (index) => {
         set((state) => ({
            questionDocuments: state.questionDocuments.filter((_, i) => i !== index),
        }));
        useBuilderStore.getState().setHasUnsavedChanges(true);
    },
    addExternalContext: (fileName, content) => {
        set((state) => ({ externalContext: [...state.externalContext, { fileName, content, type: 'context' }] }));
        useBuilderStore.getState().setHasUnsavedChanges(true);
    },
    removeExternalContext: (index) => {
        set((state) => ({
            externalContext: state.externalContext.filter((_, i) => i !== index),
        }));
        useBuilderStore.getState().setHasUnsavedChanges(true);
    },
    newSession: () => set(initialState),
    loadState: (newState) => {
        if (newState.academicSolver) {
            set(newState.academicSolver);
        }
    },
    resetCurrent: () => set(initialState),
  })
);
