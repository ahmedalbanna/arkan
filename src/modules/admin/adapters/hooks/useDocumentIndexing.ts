
'use client';

import { useState } from 'react';

export interface IndexingOptions {
  projectId: string;
  userId?: string;
  chunkSize: number;
  overlap: number;
  type: 'report' | 'reference' | 'context' | 'user_upload';
}

const DEFAULT_INDEXING_OPTIONS: IndexingOptions = {
  projectId: '',
  chunkSize: 400,
  overlap: 50,
  type: 'context',
};

/**
 * Custom hook for managing document indexing state and options.
 */
export function useDocumentIndexing() {
  const [activeTab, setActiveTab] = useState('upload');
  const [indexingOptions, setIndexingOptions] = useState<IndexingOptions>(DEFAULT_INDEXING_OPTIONS);

  const resetOptions = () => {
    setIndexingOptions(DEFAULT_INDEXING_OPTIONS);
    setActiveTab('upload');
  };

  return {
    activeTab,
    setActiveTab,
    indexingOptions,
    setIndexingOptions,
    resetOptions,
  };
}
