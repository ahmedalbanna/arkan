
'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsKeys } from '@/lib/query-keys';
import { AnalyticsApiClient } from '@/modules/admin/adapters/api-client/AnalyticsApiClient';
import { container } from '@/infrastructure/di/container';
import { useAuth } from '@/context/AuthContext';

export function useUserStats() {
    const { firebaseUser } = useAuth();
    return useQuery({
        queryKey: analyticsKeys.userStats(firebaseUser?.uid ?? ''),
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            const client = container.resolve(AnalyticsApiClient);
            return client.fetchUserStats(token);
        },
        enabled: !!firebaseUser,
    });
}
