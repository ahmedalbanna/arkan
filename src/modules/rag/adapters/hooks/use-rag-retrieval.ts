'use client';

import { useAuth } from '@/context/AuthContext';
import { container } from '@/infrastructure/di/container';
import { RagApiClient, RetrieveContextResponse } from '@/modules/rag/adapters/api-client/RagApiClient';
import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/util/use-toast';

export function useRagRetrieval() {
  const { userProfile: user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<RetrieveContextResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const telemetry = useMemo(() => results?.telemetry || null, [results]);

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
      
      if (data.telemetry?.isCached) {
        console.log(`[RAG] Cache hit for query: "${query}" (${data.telemetry.totalTimeMs}ms)`);
      }
      
      return data;
    } catch (err: any) {
      console.error('RAG Retrieval failed:', err);
      const msg = err?.message || 'The retrieval core encountered an unrecoverable error.';
      setError(msg);
      toast({ title: 'Retrieval Error', description: msg, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    retrieve,
    results,
    telemetry,
    isLoading,
    error,
  };
}
