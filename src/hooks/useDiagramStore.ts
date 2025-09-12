// code explantion in docs/hooks/useDiagramStore.md
"use client";

import { create } from "zustand";
import { type DiagramType } from "@/ai/schemas";

// The store is being deprecated in favor of useBuilderStore holding the Project instance.
// This file is kept to avoid breaking imports, but its data management functionality is removed.
// Components should now get the project instance from useBuilderStore and call project methods like project.setDiagram().

export interface DiagramData {
  plantUmlCode: string;
  imageUrl: string;
  explanation?: string;
}

// The state is now empty as it's managed in useBuilderStore.
export interface DiagramState {}

interface DiagramActions {
  newSession: () => void;
}

const initialState: DiagramState = {};

export const useDiagramStore = create<DiagramState & DiagramActions>()(
    (set) => ({
      ...initialState,
      newSession: () => set(initialState),
    })
);