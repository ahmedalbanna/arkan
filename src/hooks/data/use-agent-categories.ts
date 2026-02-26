
'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { AgentApiClient } from '@/modules/ai/adapters/api-client/AgentApiClient';
import { container } from '@/infrastructure/di/container';

export function useAgentCategories() {
    const { firebaseUser } = useAuth();
    const { data, ...rest } = useQuery({
        queryKey: ['agent-categories'],
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated.");
            const token = await firebaseUser.getIdToken();
            const client = container.resolve(AgentApiClient);
            return client.fetchAgentCategoriesApi(token);
        },
        enabled: !!firebaseUser,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    return { categories: data || [], ...rest };
}
