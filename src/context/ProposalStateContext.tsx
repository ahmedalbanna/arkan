
'use client';

import React, { createContext, useContext } from 'react';
import { useProposalBuilder } from '@/hooks/use-proposal-builder';

// Define the context shape
type ProposalStateContextType = ReturnType<typeof useProposalBuilder>;

// Create the context
const ProposalStateContext = createContext<ProposalStateContextType | undefined>(undefined);

// Create the provider component
export const ProposalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const proposalBuilderProps = useProposalBuilder();

  return (
    <ProposalStateContext.Provider value={proposalBuilderProps}>
      {children}
    </ProposalStateContext.Provider>
  );
};

// Create a custom hook to use the context
export const useProposalState = (): ProposalStateContextType => {
  const context = useContext(ProposalStateContext);
  if (context === undefined) {
    throw new Error('useProposalState must be used within a ProposalStateProvider');
  }
  return context;
};
