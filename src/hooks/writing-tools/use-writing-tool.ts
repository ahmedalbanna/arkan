
'use client';

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { writingToolApi } from '@/services/api/writingToolsService';
import { toast } from '@/hooks';
import { deductCredit } from '@/services/credit-service';
import { useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/lib/query-keys';

/**
 * A generic hook for calling AI writing tools.
 * It handles authentication, loading state, error handling, and credit deduction automatically.
 *
 * @param endpoint The specific API endpoint for the tool (e.g., '/api/writing-tools/summarize').
 * @param options Optional React Query mutation options.
 * @returns A React Query mutation object.
 */
export function useWritingTool<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  const { firebaseUser, refetchUser } = useAuth();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (data: TVariables) => {
      if (!firebaseUser) {
        throw new Error('You must be logged in to use this feature.');
      }
      const token = await firebaseUser.getIdToken();
      // Assume a default credit cost of 1 if not specified in the endpoint logic
      return writingToolApi<TVariables, TData>(endpoint, { data, token });
    },
    onSuccess: (data, variables, context) => {
        // Refetch user profile to update credit count in the UI
        refetchUser();
        if (options?.onSuccess) {
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
            options.onError(error, variables, context);
        }
    },
    // Spread any additional options passed in
    ...options,
  });
}
