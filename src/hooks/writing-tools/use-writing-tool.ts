
'use client';

import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import { WritingToolsApiClient } from '@/modules/ai/adapters/api-client/WritingToolsApiClient';
import { container } from '@/infrastructure/di/container';
import { getAuthenticatedToken } from '@/lib/utils/authUtils';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

/**
 * A generic hook for calling AI writing tools.
 * It handles authentication, loading state, error handling, and credit deduction automatically.
 *
 * @param endpoint The specific API endpoint for the tool (e.g., '/api/writing-tools/summarize').
 * @param options Optional React Query mutation options.
 * @returns A React Query mutation object.
 */
export function useWritingTool<TData = unknown, TVariables = any>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  const { firebaseUser, refetchUser } = useAuth();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (data: TVariables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      const client = container.resolve(WritingToolsApiClient);
      return client.writingToolApi<TVariables, TData>(endpoint, { data, token });
    },
    onSuccess: (data, variables, context) => {
      // Refetch user profile to update credit count in the UI
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
    // Spread any additional options passed in
    ...options,
  });
}
