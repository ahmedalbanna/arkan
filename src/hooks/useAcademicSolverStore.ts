"use client";

import { create } from "zustand";

// This store is being deprecated in favor of useBuilderStore holding the Project instance.
// This file is kept to avoid breaking imports, but its functionality is removed.

export type AcademicSolverStage =
  | "idle"
  | "parsing"
  | "analyzing"
  | "readyToSolve"
  | "solving"
  | "solved";

export interface AcademicSolverState {}

interface AcademicSolverActions {
  newSession: () => void;
}

const initialState: AcademicSolverState = {};

export const useAcademicSolverStore = create<AcademicSolverState & AcademicSolverActions>()(
  (set) => ({
    ...initialState,
    newSession: () => set(initialState),
  })
);