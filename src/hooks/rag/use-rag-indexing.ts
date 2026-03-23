/**
 * Hook: useRAGIndexing
 *
 * React hook for indexing documents into the RAG system
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/infrastructure/api/ApiService';

interface IndexingState {
  isIndexing: boolean;
  error: string | null;
  success: boolean;
  chunksCreated: number;
}

interface IndexDocumentResponse {
  chunksCreated?: number;
}

export function useRAGIndexing() {
  const { firebaseUser } = useAuth();
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
    type: 'user_upload' | 'reference' = 'user_upload',
  ) => {
    if (!firebaseUser) {
      setState((prev) => ({ ...prev, error: 'User not authenticated' }));
      return false;
    }

    setState({
      isIndexing: true,
      error: null,
      success: false,
      chunksCreated: 0,
    });

    try {
      const data = await apiService<
        { content: string; fileName: string; userId: string; projectId?: string; type: 'user_upload' | 'reference' },
        IndexDocumentResponse
      >({
        endpoint: '/api/rag/index-document',
        method: 'POST',
        data: {
          content,
          fileName,
          userId: firebaseUser.uid,
          projectId,
          type,
        },
      });

      const chunksCreated = data.chunksCreated ?? 0;
      setState({
        isIndexing: false,
        error: null,
        success: true,
        chunksCreated,
      });

      return chunksCreated;
    } catch (error: unknown) {
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
    documents: Array<{ content: string; fileName: string; type?: 'user_upload' | 'reference' }>,
    projectId?: string,
  ) => {
    if (!firebaseUser) {
      setState((prev) => ({ ...prev, error: 'User not authenticated' }));
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
        const result = await indexDocument(doc.content, doc.fileName, projectId, doc.type ?? 'user_upload');

        if (typeof result === 'number') {
          totalChunks += result;
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
    } catch (error: unknown) {
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
