'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { AgentApiClient } from '@/modules/ai/adapters/api-client/AgentApiClient';
import { container } from '@/infrastructure/di/container';
import { agentKeys } from '@/infrastructure/api/query-keys';

export function useAgentCategories() {
  const { user } = useAuth();
  const { data, ...rest } = useQuery({
    queryKey: agentKeys.categories(),
    queryFn: async () => {
      if (!user) return [];
      const client = container.resolve(AgentApiClient);
      const result = await client.fetchAgentCategoriesApi();
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    enabled: Boolean(user),
    staleTime: 1000 * 60 * 60,
  });

  return { categories: data || [], ...rest };
}
