

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { writingToolApi } from '@/services';
import { toast } from '@/hooks';
import { handleErrorUtility } from '@/lib/errorUtils';

/**
 * Generic custom mutation hook for all writing tools.
 * @param endpoint The specific API endpoint for the tool (e.g., '/api/writing-tools/summarize').
 * @param options Optional callbacks for onSuccess and onError.
 * @returns The result of the useMutation hook.
 */
export function useWritingTool<TData = any, TVariables = any>(
  endpoint: string,
  options?: {
    onSuccess?: (data: TData, variables: TVariables, context: unknown) => void;
    onError?: (error: Error, variables: TVariables, context: unknown) => void;
  }
) {
  const { firebaseUser, refetchUser } = useAuth();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      // The endpoint is now the tool name itself.
      return writingToolApi(endpoint.replace('/api/writing-tools/', ''), { data: variables, token });
    },
    onSuccess: (data, variables, context) => {
        refetchUser(); // Invalidate user to update credits
        if (options?.onSuccess) {
            options.onSuccess(data, variables, context);
        }
    },
    onError: (error, variables, context) => {
        if (options?.onError) {
            options.onError(error, variables, context);
        } else {
            handleErrorUtility(error, "AI Tool Failed");
        }
    }
  });
}
