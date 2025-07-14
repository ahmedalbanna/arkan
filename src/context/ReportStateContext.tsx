
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useReportState as useReportStateHook } from '@/hooks/use-report-state';

// Define the context shape based on the hook's return type
type ReportStateContextType = ReturnType<typeof useReportStateHook>;

// Create the context
const ReportStateContext = createContext<ReportStateContextType | undefined>(undefined);

// Create the provider component
export const ReportStateProvider = ({ children }: { children: ReactNode }) => {
  const reportStateProps = useReportStateHook();
  return (
    <ReportStateContext.Provider value={reportStateProps}>
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
