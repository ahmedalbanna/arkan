
'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from "next-auth/react";
import { fetchAgentCategoriesApi } from '@/services/api/agentService';

export function useAgentCategories() {
    const { data: session } = useSession();
    const { data, ...rest } = useQuery({
        queryKey: ['agent-categories'],
        queryFn: async () => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            const token = session.user.id;
            return fetchAgentCategoriesApi(token);
        },
        enabled: !!session?.user?.id,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    return { categories: data || [], ...rest };
}
