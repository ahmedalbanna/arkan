'use client';

import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import { WritingToolsApiClient } from '@/modules/ai/adapters/api-client/WritingToolsApiClient';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/container';

export function useWritingTool<TData = unknown, TVariables = any>(
  endpointOrToolName: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>,
) {
  const { refetchUser } = useAuth();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (data: TVariables) => {
      const client = container.resolve(WritingToolsApiClient);
      // Strip '/api/writing-tools/' prefix if present to get the tool name
      const toolName = endpointOrToolName.replace(/^\/api\/writing-tools\//, '');
      const result = await client.writingToolApi<TVariables, TData>(toolName, data);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: (data, variables, context) => {
      refetchUser();
      if (options?.onSuccess) {
        // @ts-expect-error - Type mismatch with TanStack Query callback signature
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error: Error, variables, context) => {
      toast({
        title: 'An Error Occurred',
        description: error.message,
        variant: 'destructive',
      });
      if (options?.onError) {
        // @ts-expect-error - Type mismatch with TanStack Query callback signature
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
}
