
// code explantion in docs/hooks/useDiagramStore.md
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type DiagramType } from "@/ai/schemas";
import { useBuilderStore } from "./useBuilderStore";

export interface DiagramData {
  plantUmlCode: string;
  imageUrl: string;
  explanation?: string;
}

export interface DiagramState {
  diagrams: { [key in DiagramType]?: DiagramData };
}

interface DiagramActions {
  newSession: () => void;
  loadState: (state: Partial<DiagramState>) => void;
  setDiagram: (key: DiagramType, data: DiagramData) => void;
  setDiagramExplanation: (key: DiagramType, explanation: string) => void;
  handleDiagramCodeUpdate: (key: DiagramType, code: string) => void;
}

const initialState: DiagramState = {
  diagrams: {},
};

export const useDiagramStore = create<DiagramState & DiagramActions>()(
  (set, get) => ({
    ...initialState,
    newSession: () => set(initialState),
    loadState: (newState) => {
      if (newState.diagrams) {
        set({ diagrams: newState.diagrams });
      }
    },
    setDiagram: (key, data) => {
      set((state) => ({
        diagrams: {
          ...state.diagrams,
          [key]: data,
        },
      }));
      useBuilderStore.getState().setHasUnsavedChanges(true);
    },
    setDiagramExplanation: (key, explanation) => {
      set((state) => {
        if (!state.diagrams[key]) return {};
        return {
          diagrams: {
            ...state.diagrams,
            [key]: {
              ...state.diagrams[key]!,
              explanation,
            },
          },
        };
      });
      useBuilderStore.getState().setHasUnsavedChanges(true);
    },
    handleDiagramCodeUpdate: (key, code) => {
      set((state) => {
        if (!state.diagrams[key]) return {};
        return {
          diagrams: {
            ...state.diagrams,
            [key]: {
              ...state.diagrams[key]!,
              plantUmlCode: code,
            },
          },
        };
      });
      useBuilderStore.getState().setHasUnsavedChanges(true);
    },
  })
);
