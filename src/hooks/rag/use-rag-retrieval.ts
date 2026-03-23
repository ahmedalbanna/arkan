/**
 * Hook: useRAGRetrieval
 *
 * React hook for retrieving context from the RAG system
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/infrastructure/api/ApiService';

interface RetrievalSource {
  content: string;
  score: number;
  sourceFile?: string;
  type: string;
}

interface RetrievalState {
  isRetrieving: boolean;
  error: string | null;
  context: string | null;
  sources: RetrievalSource[];
}

interface RetrieveContextResponse {
  context: string;
  sources?: RetrievalSource[];
}

export function useRAGRetrieval() {
  const { firebaseUser } = useAuth();
  const [state, setState] = useState<RetrievalState>({
    isRetrieving: false,
    error: null,
    context: null,
    sources: [],
  });

  const retrieveContext = async (
    query: string,
    projectId?: string,
    options: { topK?: number; minScore?: number } = {},
  ) => {
    if (!firebaseUser) {
      setState((prev) => ({ ...prev, error: 'User not authenticated' }));
      return null;
    }

    setState({
      isRetrieving: true,
      error: null,
      context: null,
      sources: [],
    });

    try {
      const data = await apiService<
        { query: string; userId: string; projectId?: string; topK: number; minScore: number },
        RetrieveContextResponse
      >({
        endpoint: '/api/rag/retrieve-context',
        method: 'POST',
        data: {
          query,
          userId: firebaseUser.uid,
          projectId,
          topK: options.topK ?? 5,
          minScore: options.minScore ?? 0.5,
        },
      });

      setState({
        isRetrieving: false,
        error: null,
        context: data.context,
        sources: data.sources ?? [],
      });

      return data.context;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        isRetrieving: false,
        error: errorMessage,
        context: null,
        sources: [],
      });
      return null;
    }
  };

  const reset = () => {
    setState({
      isRetrieving: false,
      error: null,
      context: null,
      sources: [],
    });
  };

  return {
    retrieveContext,
    reset,
    ...state,
  };
}
