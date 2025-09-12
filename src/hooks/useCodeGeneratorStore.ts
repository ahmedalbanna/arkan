"use client";

import { create } from "zustand";

// This store is being deprecated in favor of useBuilderStore holding the Project instance.
// This file is kept to avoid breaking imports, but its functionality is removed.

export interface CodeGeneratorState {}

interface CodeGeneratorActions {
  newSession: () => void;
}

const initialState: CodeGeneratorState = {};

export const useCodeGeneratorStore = create<CodeGeneratorState & CodeGeneratorActions>()(
  (set) => ({
    ...initialState,
    newSession: () => set(initialState),
  })
);