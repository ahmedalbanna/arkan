
'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsKeys } from '@/lib/query-keys';
import { getUserStatsAction } from '@/app/actions/analyticsActions';
import { useAuth } from '@/context/AuthContext';

export function useUserStats() {
    const { firebaseUser, isLoading: authLoading } = useAuth();
    return useQuery({
        queryKey: analyticsKeys.userStats(firebaseUser?.uid ?? ''),
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated");
            return getUserStatsAction();
        },
        enabled: !authLoading && !!firebaseUser,
    });
}
