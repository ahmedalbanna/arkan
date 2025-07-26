
'use client';

import { create } from "zustand";
import type { AnalyzedDocument, SolvedDocument, AcademicDocumentType } from "@/ai/flows/academic-solver.shared";

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
  originalFile: { name: string; type: string; dataUrl: string } | null;
  contextFile: { name: string; type: string; dataUrl: string } | null;
}

interface AcademicSolverActions {
  setStage: (stage: AcademicSolverStage) => void;
  setDocumentType: (type: AcademicDocumentType | null) => void;
  setAnalyzedDocument: (document: AnalyzedDocument | null) => void;
  setSolvedDocument: (solution: SolvedDocument | null) => void;
  setOriginalFile: (file: File | null) => Promise<void>;
  setContextFile: (file: File | null) => Promise<void>;
  resetCurrent: () => void;
}

const initialState: AcademicSolverState = {
  stage: "idle",
  documentType: null,
  analyzedDocument: null,
  solvedDocument: null,
  originalFile: null,
  contextFile: null,
};

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
    setOriginalFile: async (file) => {
      if (!file) {
        set({ originalFile: null, stage: "idle", analyzedDocument: null, solvedDocument: null });
        return;
      }
      const dataUrl = await fileToDataUrl(file);
      set({
        originalFile: { name: file.name, type: file.type, dataUrl },
        stage: "idle", // Reset stage when a new file is selected
        analyzedDocument: null,
        solvedDocument: null,
      });
    },
    setContextFile: async (file) => {
      if (!file) {
        set({ contextFile: null });
        return;
      }
      const dataUrl = await fileToDataUrl(file);
      set({
        contextFile: { name: file.name, type: file.type, dataUrl },
      });
    },
    resetCurrent: () => set(initialState),
  })
);
