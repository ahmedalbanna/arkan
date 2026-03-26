'use client';

import { useAuth } from '@/context/AuthContext';
import { container } from '@/infrastructure/di/container';
import { RagApiClient, RetrieveContextResponse } from '@/modules/rag/adapters/api-client/RagApiClient';
import { useState } from 'react';

export function useRagRetrieval() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const retrieveContext = async (
    query: string, 
    projectId?: string, 
    options: { topK?: number; minScore?: number } = {}
  ): Promise<RetrieveContextResponse | null> => {
    if (!query.trim()) return null;

    setIsLoading(true);
    try {
      const client = container.resolve(RagApiClient);
      const result = await client.retrieveContext({
        query,
        projectId,
        topK: options.topK ?? 5,
        minScore: options.minScore ?? 0.5,
      });

      if (result.isFailure) throw result.error;
      return result.getValue();
    } catch (error) {
      console.error('RAG Retrieval failed:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    retrieveContext,
    isLoading,
  };
}
