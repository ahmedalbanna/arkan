'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/infrastructure/api/ApiService';
import { useToast } from '@/hooks/util/use-toast';

export interface IndexDocumentResponse {
  message: string;
  documentId: string;
}

export function useRagIndexing() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, fileName, projectId, type }: { 
      content: string; 
      fileName: string; 
      projectId?: string; 
      type: 'user_upload' | 'reference' 
    }) => {
      if (!firebaseUser) throw new Error('User not authenticated');

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

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rag-documents'] });
      toast({ title: 'Success', description: 'Document indexed successfully for RAG.' });
    },
    onError: (error: any) => {
      toast({ title: 'Indexing Failed', description: error.message, variant: 'destructive' });
    },
  });
}
