'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { AgentApiClient } from '@/modules/ai/adapters/api-client/AgentApiClient';
import { runAuthenticatedResultCall } from './authenticated-client-call';

export function useAgentCategories() {
  const { firebaseUser } = useAuth();
  const { data, ...rest } = useQuery({
    queryKey: ['agent-categories'],
    queryFn: async () =>
      runAuthenticatedResultCall(firebaseUser, AgentApiClient, (client, token) =>
        client.fetchAgentCategoriesApi(token),
      ),
    enabled: Boolean(firebaseUser),
    staleTime: 1000 * 60 * 60,
  });

  return { categories: data || [], ...rest };
}
