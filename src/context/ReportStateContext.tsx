'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useReportBuilder, type ReportState, type ReportAction, initialState } from '@/hooks/use-report-builder';

// Define the context shape
interface ReportStateContextType {
  state: ReportState;
  dispatch: React.Dispatch<ReportAction>;
  isLoaded: boolean;
  isGeneratingProposal: boolean;
  generatingItem: string | null;
  isAnythingGenerating: boolean;
  proposal: ReportState['proposal'];
  proposalJson: string;
  projectIdea: string;
  contextSelections: ReportState['contextSelections'];
  handleProjectIdeaChange: (idea: string) => void;
  handleProposalGenerated: (proposal: ReportState['proposal']) => void;
  handleProposalJsonChange: (json: string) => void;
  handleProposalUpdate: (path: string, value: any) => void;
  handleSectionUpdate: (key: any, value: string) => void;
  handleDiagramUpdate: (diagramType: any, code: string) => void;
  handleNewSession: () => void;
  handleSubmit: (formData: FormData) => void;
  toggleContextSelection: (parentKey: string, contextKey: string) => void;
  setExternalContext: (fileName: string, content: string) => void;
  removeExternalContext: () => void;
}

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
