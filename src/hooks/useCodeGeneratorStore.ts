

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GenerateCodeOutput } from "@/ai/flows/generate-code";
import type { Codebase } from '@/ai/flows/generate-codebase';

export interface CodeGeneratorState {
  prompt: string;
  html: string;
  css: string;
  javascript: string;
  codebase: Codebase | null;
}

interface CodeGeneratorActions {
  newSession: () => void;
  loadState: (state: Partial<{ codeGenerator: CodeGeneratorState }>) => void;
  setCodePrompt: (prompt: string) => void;
  setGeneratedCode: (code: GenerateCodeOutput) => void;
  setCodebase: (codebase: Codebase | null) => void;
}

const initialState: CodeGeneratorState = {
  prompt: "",
  html: "",
  css: "",
  javascript: "",
  codebase: null,
};

export const useCodeGeneratorStore = create<
  CodeGeneratorState & CodeGeneratorActions
>()(
  persist(
    (set, get) => ({
      ...initialState,
      newSession: () => set(initialState),
      loadState: (newState) => {
        if (newState.codeGenerator) {
          set(newState.codeGenerator);
        }
      },
      setCodePrompt: (prompt) => set({ prompt }),
      setGeneratedCode: (code) =>
        set({
          html: code.html,
          css: code.css,
          javascript: code.javascript || "",
        }),
      setCodebase: (codebase) => set({ codebase }),
    }),
    {
      name: "arkan-code-generator-store-v2",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
