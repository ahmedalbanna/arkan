"use client";

import { create } from 'zustand';

// This store is being deprecated in favor of useBuilderStore holding the Project instance.
// This file is kept to avoid breaking imports, but its functionality is removed.

// The state is now empty as it's managed in useBuilderStore.
export interface ProjectPlanState {}

interface ProjectPlanActions {
  newSession: () => void;
}

const initialState: ProjectPlanState = {};

export const useProjectPlanStore = create<ProjectPlanState & ProjectPlanActions>()(
  (set) => ({
    ...initialState,
    newSession: () => set(initialState),
  })
);