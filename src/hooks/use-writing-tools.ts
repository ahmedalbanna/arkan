

'use client';

import { useAuth } from '@/context/AuthContext';
import { createWritingToolHook } from '@/core';
import { getAuthenticatedToken } from '@/core/utils/authUtils';
import { handleErrorUtility } from '@/core/utils/errorUtils';
import { writingToolApi } from '@/services';
import { useMutation } from '@tanstack/react-query';

/**
 * Generic custom mutation hook for all writing tools.
 * @param tool The specific tool name (e.g., 'summarize', 'paraphrase').
 * @param options Optional callbacks for onSuccess and onError.
 * @returns The result of the useMutation hook.
 */
export function useWritingTool<TData = any, TVariables = any>(
  tool: string,
  options?: {
    onSuccess?: (data: TData, variables: TVariables, context: unknown) => void;
    onError?: (error: Error, variables: TVariables, context: unknown) => void;
  }
) {
  const { firebaseUser, refetchUser } = useAuth();
  const endpoint = `/api/writing-tools/${tool}`;

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return writingToolApi(endpoint, { data: variables, token });
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

/**
 * Enhanced writing tool hook using the new core system
 * @param tool The specific tool name
 * @param schema Zod schema for validation
 * @param defaultValues Default form values
 * @returns Enhanced writing tool hook
 */
export function useEnhancedWritingTool(
  tool: string,
  schema: any,
  defaultValues: any
) {
  return createWritingToolHook({
    toolName: tool,
    apiEndpoint: `/api/writing-tools/${tool}`,
    schema,
    defaultValues,
    successMessage: `${tool} completed successfully!`,
    errorMessage: `Failed to process ${tool}`,
    enableFileUpload: true,
    acceptedFileTypes: ['application/pdf', 'text/plain', 'text/markdown']
  })();
}
