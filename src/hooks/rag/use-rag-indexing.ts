'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { container } from '@/infrastructure/di/container';
import { RagApiClient } from '@/modules/rag/adapters/api-client/RagApiClient';
import { useToast } from '@/hooks/util/use-toast';
import { ragKeys } from '@/lib/query-keys';

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
      const client = container.resolve(RagApiClient);
      const result = await client.indexDocument({
        content,
        fileName,
        projectId,
        type,
      });

      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ragKeys.all() });
      toast({ title: 'Success', description: 'Document indexed successfully for RAG.' });
    },
    onError: (error: any) => {
      toast({ title: 'Indexing Failed', description: error.message, variant: 'destructive' });
    },
  });
}
