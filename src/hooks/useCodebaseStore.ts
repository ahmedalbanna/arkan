
'use client';

import { create } from 'zustand';
import type { Codebase } from '@/ai/flows/generate-codebase';

export interface CodebaseState {
  codebase: Codebase | null;
}

interface CodebaseActions {
  setCodebase: (codebase: Codebase | null) => void;
  newSession: () => void;
  loadState: (state: Partial<{ codebase: CodebaseState }>) => void;
}

const initialState: CodebaseState = {
  codebase: null,
};

export const useCodebaseStore = create<CodebaseState & CodebaseActions>()(
  (set) => ({
    ...initialState,
    setCodebase: (codebase) => set({ codebase }),
    newSession: () => set(initialState),
    loadState: (newState) => {
      if (newState.codebase) {
        set({ codebase: newState.codebase });
      }
    },
  })
);
