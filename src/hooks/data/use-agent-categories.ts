'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { AgentApiClient } from '@/modules/ai/adapters/api-client/AgentApiClient';
import { runAuthenticatedResultCall } from './authenticated-client-call';

import { container } from '@/infrastructure/di/container';

export function useAgentCategories() {
  const { firebaseUser } = useAuth();
  const { data, ...rest } = useQuery({
    queryKey: ['agent-categories'],
    queryFn: async () => {
      if (!firebaseUser) return [];
      const client = container.resolve(AgentApiClient);
      const result = await client.fetchAgentCategoriesApi();
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    enabled: Boolean(firebaseUser),
    staleTime: 1000 * 60 * 60,
  });

  return { categories: data || [], ...rest };
}
