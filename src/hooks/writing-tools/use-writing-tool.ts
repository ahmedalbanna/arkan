
'use client';

import { AIFlowInput } from '@/lib/schemas';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import { runWritingToolAction } from '@/app/actions/writingToolsActions';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { ToolName } from '@/app/actions/writingToolsActions';

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
  const { firebaseUser, refetchUser } = useAuth();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (data: TVariables) => {
      // Server action handles authentication internally
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
