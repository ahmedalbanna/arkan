/**
 * Hook: useRAGRetrieval
 * 
 * React hook for retrieving context from the RAG system
 */

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface RetrievalState {
  isRetrieving: boolean;
  error: string | null;
  context: string | null;
  sources: Array<{
    content: string;
    score: number;
    sourceFile?: string;
    type: string;
  }>;
}

export function useRAGRetrieval() {
  const { firebaseUser: user } = useAuth();
  const [state, setState] = useState<RetrievalState>({
    isRetrieving: false,
    error: null,
    context: null,
    sources: [],
  });

  const retrieveContext = async (
    query: string,
    projectId?: string,
    options: {
      topK?: number;
      minScore?: number;
    } = {}
  ) => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }));
      return null;
    }

    setState({
      isRetrieving: true,
      error: null,
      context: null,
      sources: [],
    });

    try {
      const response = await fetch('/api/rag/retrieve-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          userId: user.uid,
          projectId,
          topK: options.topK || 5,
          minScore: options.minScore || 0.5,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to retrieve context');
      }

      setState({
        isRetrieving: false,
        error: null,
        context: data.context,
        sources: data.sources || [],
      });

      return data.context;
    } catch (error) {
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
