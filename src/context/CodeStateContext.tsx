
'use client';

import React, { createContext, useContext } from 'react';
import { useCodeBuilder } from '@/hooks/use-code-builder';

type CodeStateContextType = ReturnType<typeof useCodeBuilder>;

const CodeStateContext = createContext<CodeStateContextType | undefined>(undefined);

export const CodeStateProvider = ({ children }: { children: React.ReactNode }) => {
  const codeBuilderProps = useCodeBuilder();

  return (
    <CodeStateContext.Provider value={codeBuilderProps}>
      {children}
    </CodeStateContext.Provider>
  );
};

export const useCodeState = (): CodeStateContextType => {
  const context = useContext(CodeStateContext);
  if (context === undefined) {
    throw new Error('useCodeState must be used within a CodeStateProvider');
  }
  return context;
};
