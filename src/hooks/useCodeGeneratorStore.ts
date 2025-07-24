// code explantion in docs/hooks/useCodeGeneratorStore.md

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GenerateCodeOutput } from "@/ai/flows/generate-code";

export interface CodeGeneratorState {
  prompt: string;
  html: string;
  css: string;
  javascript: string;
}

interface CodeGeneratorActions {
  newSession: () => void;
  loadState: (state: Partial<{ codeGenerator: CodeGeneratorState }>) => void;
  setCodePrompt: (prompt: string) => void;
  setGeneratedCode: (code: GenerateCodeOutput) => void;
}

const initialState: CodeGeneratorState = {
  prompt: "",
  html: "",
  css: "",
  javascript: "",
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
    }),
    {
      name: "arkan-code-generator-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
