
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProjectPlan } from '@/ai/schemas';
import { useBuilderStore } from './useBuilderStore';

export interface ProjectPlanState {
  projectPlan: ProjectPlan | null;
}

interface ProjectPlanActions {
  setProjectPlan: (plan: ProjectPlan | null) => void;
  newSession: () => void;
  loadState: (state: Partial<{ projectPlan: ProjectPlanState }>) => void;
}

const initialState: ProjectPlanState = {
  projectPlan: null,
};

export const useProjectPlanStore = create<ProjectPlanState & ProjectPlanActions>()(
  persist(
    (set) => ({
      ...initialState,
      setProjectPlan: (plan) => {
        set({ projectPlan: plan });
        useBuilderStore.getState().setHasUnsavedChanges(true);
      },
      newSession: () => set(initialState),
      loadState: (newState) => {
        if (newState.projectPlan) {
          set({ projectPlan: newState.projectPlan });
        }
      },
    }),
    {
      name: 'arkan-project-plan-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
