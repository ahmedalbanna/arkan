'use client';

import { useAuth } from '@/context/AuthContext';
import { container } from '@/infrastructure/di/container';
import { RagApiClient, RetrieveContextResponse } from '@/modules/rag/adapters/api-client/RagApiClient';
import { useState, useCallback } from 'react';

export function useRagRetrieval() {
  const { userProfile: user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<RetrieveContextResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const retrieve = useCallback(async (
    query: string, 
    projectId?: string, 
    options: { topK?: number; minScore?: number } = {}
  ): Promise<RetrieveContextResponse | null> => {
    if (!query.trim()) return null;

    setIsLoading(true);
    setError(null);
    try {
      const client = container.resolve(RagApiClient);
      const result = await client.retrieveContext({
        query,
        projectId,
        topK: options.topK ?? 5,
        minScore: options.minScore ?? 0.5,
      });

      if (result.isFailure) throw result.error;
      
      const data = result.getValue();
      setResults(data);
      return data;
    } catch (err: any) {
      console.error('RAG Retrieval failed:', err);
      const msg = err?.message || 'The retrieval core encountered an unrecoverable error.';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    retrieve,
    results,
    isLoading,
    error,
  };
}
