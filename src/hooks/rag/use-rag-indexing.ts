/**
 * Hook: useRAGIndexing
 * 
 * React hook for indexing documents into the RAG system
 */

import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';

interface IndexingState {
  isIndexing: boolean;
  error: string | null;
  success: boolean;
  chunksCreated: number;
}

export function useRAGIndexing() {
  const { user } = useAuthContext();
  const [state, setState] = useState<IndexingState>({
    isIndexing: false,
    error: null,
    success: false,
    chunksCreated: 0,
  });

  const indexDocument = async (
    content: string,
    fileName: string,
    projectId?: string,
    type: 'user_upload' | 'reference' = 'user_upload'
  ) => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }));
      return false;
    }

    setState({
      isIndexing: true,
      error: null,
      success: false,
      chunksCreated: 0,
    });

    try {
      const response = await fetch('/api/rag/index-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          fileName,
          userId: user.uid,
          projectId,
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to index document');
      }

      setState({
        isIndexing: false,
        error: null,
        success: true,
        chunksCreated: data.chunksCreated || 0,
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        isIndexing: false,
        error: errorMessage,
        success: false,
        chunksCreated: 0,
      });
      return false;
    }
  };

  const indexMultipleDocuments = async (
    documents: Array<{
      content: string;
      fileName: string;
      type?: 'user_upload' | 'reference';
    }>,
    projectId?: string
  ) => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }));
      return false;
    }

    setState({
      isIndexing: true,
      error: null,
      success: false,
      chunksCreated: 0,
    });

    try {
      let totalChunks = 0;
      const errors: string[] = [];

      for (const doc of documents) {
        const success = await indexDocument(
          doc.content,
          doc.fileName,
          projectId,
          doc.type || 'user_upload'
        );

        if (success) {
          totalChunks += state.chunksCreated;
        } else {
          errors.push(`Failed to index: ${doc.fileName}`);
        }
      }

      if (errors.length > 0) {
        setState({
          isIndexing: false,
          error: errors.join(', '),
          success: false,
          chunksCreated: totalChunks,
        });
        return false;
      }

      setState({
        isIndexing: false,
        error: null,
        success: true,
        chunksCreated: totalChunks,
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        isIndexing: false,
        error: errorMessage,
        success: false,
        chunksCreated: 0,
      });
      return false;
    }
  };

  const reset = () => {
    setState({
      isIndexing: false,
      error: null,
      success: false,
      chunksCreated: 0,
    });
  };

  return {
    indexDocument,
    indexMultipleDocuments,
    reset,
    ...state,
  };
}
