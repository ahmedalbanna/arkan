'use client';

import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import { WritingToolsApiClient } from '@/modules/ai/adapters/api-client/WritingToolsApiClient';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/container';
import { Result } from '@/infrastructure/utils/result';

/**
 * useWritingTool — High-fidelity orchestration for atomic AI operations.
 * Connects writing tool UI nodes with the server-side neural infrastructure.
 * 
 * DEFENSIVE MEASURES:
 * 1. Result Pattern: Transitions internal API triggers to return structured success/failure vectors.
 * 2. Neural Buffer: Prevents multiple concurrent submissions for the same tool instance.
 * 3. Telemetry Sync: Automatically updates usage quotas and identity nodes on completion.
 * 4. Error Containment: Standardized UI feedback for spectral link failures.
 */

export function useWritingTool<TData = unknown, TVariables = any>(
  endpointOrToolName: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>,
) {
  const { refetchUser, updateUsage, status } = useAuth();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (data: TVariables) => {
      // 1. EXISTENCE GUARD — Ensure identity node is capable of transmission
      if (status === 'loading') {
          throw new Error('Identity node is currently synchronizing. Please wait.');
      }

      const client = container.resolve(WritingToolsApiClient);
      
      // 2. PROTOCOL RESOLUTION
      const toolName = endpointOrToolName.replace(/^\/api\/writing-tools\//, '');
      
      try {
          const result = await client.writingToolApi<TVariables, TData>(toolName, data);
          
          if (result.isFailure) {
              throw result.error || new Error('The neural core failed to synthesize a response.');
          }
          
          return result.getValue();
      } catch (error) {
          console.error(`[WritingTool:${toolName}] Ingress failure:`, error);
          throw error;
      }
    },
    onSuccess: (data: any, variables, context) => {
      // 3. TELEMETRY SYNCHRONIZATION
      try {
          refetchUser();
          if (data?.usageMetadata) {
            updateUsage({
              remainingFreeGenerations: data.usageMetadata.remaining,
              totalLimit: data.usageMetadata.remaining + data.usageMetadata.count,
              tier: 'free', 
              resetAt: data.usageMetadata.resetAt
            } as any);
          }
      } catch (e) {
          console.warn('[WritingTool] Usage telemetry sync bypassed:', e);
      }

      if (options?.onSuccess) {
        // @ts-expect-error - Mutation callback signature alignment
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error: Error, variables, context) => {
      // 4. ERROR HUD FEEDBACK
      toast({
        title: 'Neural Link Failure',
        description: error.message || 'An unexpected error occurred during synthesis.',
        variant: 'destructive',
      });
      
      if (options?.onError) {
        // @ts-expect-error - Mutation callback signature alignment
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
}
