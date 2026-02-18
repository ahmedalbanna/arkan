
'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsKeys } from '@/lib/query-keys';
import { fetchUserStats } from '@/services/api/analyticsService';
import { useSession } from "next-auth/react";

export function useUserStats() {
    const { data: session } = useSession();
    return useQuery({
        queryKey: analyticsKeys.userStats(session?.user?.id ?? ''),
        queryFn: async () => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            const token = session.user.id;
            return fetchUserStats(token);
        },
        enabled: !!session?.user?.id,
    });
}
