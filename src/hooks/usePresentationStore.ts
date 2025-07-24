// code explantion in docs/hooks/usePresentationStore.md

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type PresentationSlide } from "@/ai/schemas";
import { useBuilderStore } from "./useBuilderStore";

export interface PresentationHistoryEntry {
  id: string;
  name: string;
  slides: PresentationSlide[];
}

export interface PresentationState {
  presentation?: { history: PresentationHistoryEntry[] };
  activePresentationId: string | null;
}

interface PresentationActions {
  newSession: () => void;
  loadState: (state: Partial<PresentationState>) => void;
  addPresentationToHistory: (entry: PresentationHistoryEntry) => void;
  replacePresentationInHistory: (entry: PresentationHistoryEntry) => void;
  setActivePresentationId: (id: string | null) => void;
  updatePresentationSlide: (
    slideIndex: number,
    field: "title" | "content",
    value: string,
    contentIndex?: number
  ) => void;
}

const initialState: PresentationState = {
  presentation: { history: [] },
  activePresentationId: null,
};

export const usePresentationStore = create<
  PresentationState & PresentationActions
>()((set, get) => ({
  ...initialState,
  newSession: () => set(initialState),
  loadState: (newState) => {
    if (newState.presentation) {
      set({
        presentation: newState.presentation,
        activePresentationId: newState.presentation.history[0]?.id || null,
      });
    }
  },
  addPresentationToHistory: (entry) => {
    set((state) => ({
      presentation: {
        history: [entry, ...(state.presentation?.history || [])],
      },
      activePresentationId: entry.id,
    }));
    useBuilderStore.getState().setHasUnsavedChanges(true);
  },
  replacePresentationInHistory: (updatedEntry) => {
    set((state) => {
      const { presentation } = state;
      if (!presentation) return {};

      const history = presentation.history.map((entry) =>
        entry.id === updatedEntry.id ? updatedEntry : entry
      );

      return { presentation: { ...presentation, history } };
    });
    useBuilderStore.getState().setHasUnsavedChanges(true);
  },
  setActivePresentationId: (id) => set({ activePresentationId: id }),
  updatePresentationSlide: (slideIndex, field, value, contentIndex) => {
    set((state) => {
      const { presentation, activePresentationId } = state;
      if (!presentation || !activePresentationId) return {};

      const history = presentation.history.map((entry) => {
        if (entry.id === activePresentationId) {
          const newSlides = [...entry.slides];
          const slideToUpdate = { ...newSlides[slideIndex] };
          if (field === "title") {
            slideToUpdate.title = value;
          } else if (field === "content" && contentIndex !== undefined) {
            const newContent = [...slideToUpdate.content];
            newContent[contentIndex] = value;
            slideToUpdate.content = newContent;
          }
          newSlides[slideIndex] = slideToUpdate;
          return { ...entry, slides: newSlides };
        }
        return entry;
      });

      return { presentation: { ...presentation, history } };
    });
    useBuilderStore.getState().setHasUnsavedChanges(true);
  },
}));
