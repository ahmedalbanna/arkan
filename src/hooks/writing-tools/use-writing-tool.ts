
'use client';

import { AIFlowInput } from '@/ai/schemas';
import type { ToolName } from '@/app/actions/aiActions';
import { runWritingToolAction } from '@/app/actions/aiActions';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

/**
 * A generic hook for calling AI writing tools.
 * It handles authentication, loading state, error handling, and credit deduction automatically.
 *
 * @param tool The tool name (e.g., 'summarize', 'paraphrase').
 * @param options Optional React Query mutation options.
 * @returns A React Query mutation object.
 */
export function useWritingTool<TData = unknown, TVariables = Omit<AIFlowInput, 'flow'>>(
  tool: ToolName,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  const { refetchUser } = useAuth();

  return useMutation<TData, Error, TVariables>({
    // Correctly pass the server action as the mutation function.
    // TanStack Query/React will handle invoking it.
    mutationFn: async (data: TVariables) => {
      return runWritingToolAction(tool, data as any);
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
