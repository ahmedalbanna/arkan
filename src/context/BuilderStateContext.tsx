
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useReportBuilder } from '@/hooks/use-report-builder';

// Define the context shape based on the hook's return type
type BuilderStateContextType = ReturnType<typeof useReportBuilder>;

// Create the context
const BuilderStateContext = createContext<BuilderStateContextType | undefined>(undefined);

// Create the provider component
export const BuilderStateProvider = ({ children }: { children: React.ReactNode }) => {
  const builderProps = useReportBuilder();
  return (
    <BuilderStateContext.Provider value={builderProps}>
      {children}
    </BuilderStateContext.Provider>
  );
};

// Create a custom hook to use the context
export const useBuilderState = (): BuilderStateContextType => {
  const context = useContext(BuilderStateContext);
  if (context === undefined) {
    throw new Error('useBuilderState must be used within a BuilderStateProvider');
  }
  return context;
};
