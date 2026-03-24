'use client';

import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/infrastructure/api/ApiService';
import { useState } from 'react';

export interface RetrieveContextResponse {
  context: string;
  sources: {
    fileName: string;
    score: number;
    text: string;
  }[];
}

export function useRagRetrieval() {
  const { firebaseUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const retrieveContext = async (
    query: string, 
    projectId?: string, 
    options: { topK?: number; minScore?: number } = {}
  ): Promise<RetrieveContextResponse | null> => {
    if (!query.trim()) return null;

    setIsLoading(true);
    try {
      const data = await apiService<
        { query: string; projectId?: string; topK: number; minScore: number },
        RetrieveContextResponse
      >({
        endpoint: '/api/rag/retrieve-context',
        method: 'POST',
        data: {
          query,
          projectId,
          topK: options.topK ?? 5,
          minScore: options.minScore ?? 0.5,
        },
      });

      return data;
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
