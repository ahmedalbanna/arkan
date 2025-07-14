
'use client';

import React, { createContext, useContext } from 'react';
import { usePresentationBuilder } from '@/hooks/use-presentation-builder';

type PresentationStateContextType = ReturnType<typeof usePresentationBuilder>;

const PresentationStateContext = createContext<PresentationStateContextType | undefined>(undefined);

export const PresentationStateProvider = ({ children }: { children: React.ReactNode }) => {
  const presentationBuilderProps = usePresentationBuilder();

  return (
    <PresentationStateContext.Provider value={presentationBuilderProps}>
      {children}
    </PresentationStateContext.Provider>
  );
};

export const usePresentationState = (): PresentationStateContextType => {
  const context = useContext(PresentationStateContext);
  if (context === undefined) {
    throw new Error('usePresentationState must be used within a PresentationStateProvider');
  }
  return context;
};
