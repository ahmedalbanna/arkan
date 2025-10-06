
// code explantion in docs/hooks/use-writing-tools.md

'use client';

import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { handleErrorUtility } from '@/lib/errorUtils';
import { writingToolApi } from '@/services/writing-tools-service';
import { useMutation } from '@tanstack/react-query';

/**
 * Generic custom mutation hook for all writing tools.
 * @param endpoint The specific API endpoint for the tool (e.g., '/api/writing-tools/summarize').
 * @param options Optional callbacks for onSuccess and onError.
 * @returns The result of the useMutation hook.
 */
export function useWritingTool<TVariables = any, TData = any>(
  endpoint: string,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  }
) {
  const { firebaseUser, refetchUser } = useAuth();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return writingToolApi(endpoint, { data: variables, token });
    },
    onSuccess: (data, variables) => {
      refetchUser(); // Invalidate user to update credits
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      if (options?.onError) {
        options.onError(error, variables);
      } else {
        handleErrorUtility(error, "AI Tool Failed");
      }
    }
  });
}
