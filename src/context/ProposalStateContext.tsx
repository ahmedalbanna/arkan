
'use client';

import React, { createContext, useContext } from 'react';
import { useProposalBuilder } from '@/hooks/use-proposal-builder';

type ProposalStateContextType = ReturnType<typeof useProposalBuilder>;

const ProposalStateContext = createContext<ProposalStateContextType | undefined>(undefined);

export const ProposalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const proposalBuilderProps = useProposalBuilder();

  return (
    <ProposalStateContext.Provider value={proposalBuilderProps}>
      {children}
    </ProposalStateContext.Provider>
  );
};

export const useProposalState = (): ProposalStateContextType => {
  const context = useContext(ProposalStateContext);
  if (context === undefined) {
    throw new Error('useProposalState must be used within a ProposalStateProvider');
  }
  return context;
};
