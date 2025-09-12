// code explantion in docs/hooks/usePresentationStore.md

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type PresentationSlide } from "@/ai/schemas";

// This type is still needed by components, so we keep the export
export interface PresentationHistoryEntry {
  id: string;
  name: string;
  slides: PresentationSlide[];
}

// The state now only holds UI-related information.
// The actual presentation data is managed within the Project instance in useBuilderStore.
export interface PresentationUIState {
  activePresentationId: string | null;
}

interface PresentationUIActions {
  newSession: () => void;
  setActivePresentationId: (id: string | null) => void;
}

const initialState: PresentationUIState = {
  activePresentationId: null,
};

export const usePresentationStore = create<PresentationUIState & PresentationUIActions>()(
  persist(
    (set) => ({
      ...initialState,
      newSession: () => set(initialState),
      setActivePresentationId: (id) => set({ activePresentationId: id }),
    }),
    {
      name: 'arkan-presentation-ui-store', // Renamed to reflect its new purpose
      storage: createJSONStorage(() => localStorage),
    }
  )
);
