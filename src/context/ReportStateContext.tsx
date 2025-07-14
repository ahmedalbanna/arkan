
'use client';

import React, { createContext, useContext } from 'react';
import { useReportBuilder, type ReportState } from '@/hooks/use-report-builder';

// Define the context shape
interface ReportStateContextType extends ReturnType<typeof useReportBuilder> {}

// Create the context
const ReportStateContext = createContext<ReportStateContextType | undefined>(undefined);

// Create the provider component
export const ReportStateProvider = ({ children }: { children: React.ReactNode }) => {
  const reportBuilderProps = useReportBuilder();

  return (
    <ReportStateContext.Provider value={reportBuilderProps}>
      {children}
    </ReportStateContext.Provider>
  );
};

// Create a custom hook to use the context
export const useReportState = (): ReportStateContextType => {
  const context = useContext(ReportStateContext);
  if (context === undefined) {
    throw new Error('useReportState must be used within a ReportStateProvider');
  }
  return context;
};
