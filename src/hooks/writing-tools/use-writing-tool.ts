
'use client';

import { AIFlowInput } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import { runWritingToolAction } from '@/app/actions/writingToolsActions';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

/**
 * A generic hook for calling AI writing tools.
 * It handles authentication, loading state, error handling, and credit deduction automatically.
 *
 * @param endpoint The specific API endpoint for the tool (e.g., '/api/writing-tools/summarize').
 * @param options Optional React Query mutation options.
 * @returns A React Query mutation object.
 */
export function useWritingTool<TData = unknown, TVariables = Omit<AIFlowInput, 'flow'>>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  const { firebaseUser, refetchUser } = useAuth();
  const toolName = endpoint.split('/').pop() || '';

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (data: TVariables) => {
      // Use apiService which handles auth and errors
      // Call server action dispatcher by tool name extracted from endpoint
      return runWritingToolAction(toolName as any, data as any);
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
