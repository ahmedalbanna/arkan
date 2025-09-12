"use client";

import { create } from 'zustand';

// This store is being deprecated in favor of useBuilderStore holding the Project instance.
// This file is kept to avoid breaking imports, but its functionality is removed.

export interface CodebaseState {}

interface CodebaseActions {
  newSession: () => void;
}

const initialState: CodebaseState = {};

export const useCodebaseStore = create<CodebaseState & CodebaseActions>()(
  (set) => ({
    ...initialState,
    newSession: () => set(initialState),
  })
);