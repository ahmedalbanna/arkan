
'use client';

import React, { createContext, useContext } from 'react';
import { useDiagramBuilder } from '@/hooks/use-diagram-builder';

type DiagramStateContextType = ReturnType<typeof useDiagramBuilder>;

const DiagramStateContext = createContext<DiagramStateContextType | undefined>(undefined);

export const DiagramStateProvider = ({ children }: { children: React.ReactNode }) => {
  const diagramBuilderProps = useDiagramBuilder();

  return (
    <DiagramStateContext.Provider value={diagramBuilderProps}>
      {children}
    </DiagramStateContext.Provider>
  );
};

export const useDiagramState = (): DiagramStateContextType => {
  const context = useContext(DiagramStateContext);
  if (context === undefined) {
    throw new Error('useDiagramState must be used within a DiagramStateProvider');
  }
  return context;
};
