'use client';

import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import { WritingToolsApiClient } from '@/modules/ai/adapters/api-client/WritingToolsApiClient';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { runAuthenticatedResultCall } from '../data/authenticated-client-call';

export function useWritingTool<TData = unknown, TVariables = any>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>,
) {
  const { firebaseUser, refetchUser } = useAuth();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (data: TVariables) =>
      runAuthenticatedResultCall(firebaseUser, WritingToolsApiClient, (client, token) =>
        client.writingToolApi<TVariables, TData>(endpoint, { data, token }),
      ),
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
