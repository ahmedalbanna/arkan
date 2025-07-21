
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type DiagramType } from '@/ai/schemas';

export interface DiagramData {
    plantUmlCode: string;
    imageUrl: string;
}

export interface DiagramState {
  diagrams: { [key in DiagramType]?: DiagramData };
}

interface DiagramActions {
    newSession: () => void;
    loadState: (state: Partial<DiagramState>) => void;
    setDiagram: (key: DiagramType, data: DiagramData) => void;
    handleDiagramCodeUpdate: (key: DiagramType, code: string) => void;
}

const initialState: DiagramState = {
  diagrams: {},
};


export const useDiagramStore = create<DiagramState & DiagramActions>()(
  persist(
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
      },
      handleDiagramCodeUpdate: (key, code) => {
          set(state => {
              if (!state.diagrams[key]) return {};
              return {
                  diagrams: {
                      ...state.diagrams,
                      [key]: {
                          ...state.diagrams[key]!,
                          plantUmlCode: code
                      }
                  }
              }
          })
      },
    }),
    {
      name: 'arkan-diagram-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
