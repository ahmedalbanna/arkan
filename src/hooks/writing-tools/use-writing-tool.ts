
'use client';

import { useSession } from 'next-auth/react';
import { useAuth } from '@/context/NextAuthContext';
import { toast } from '@/hooks';
import { apiService } from '@/services/api/apiService'; // Use the new apiService
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

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
  const { data: session } = useSession();
  const { refetchUser } = useAuth();
  const toolName = endpoint.split('/').pop() || '';

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (data: TVariables) => {
      // Use apiService which handles auth and errors
      return apiService({
        endpoint, // The full endpoint is passed in now
        method: 'POST',
        data: { ...data, flow: toolName }, // Still useful to send flow name for logging
        session,
      });
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
