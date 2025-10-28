
'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsKeys } from '@/lib/query-keys';
import { fetchUserStats } from '@/services/api/analyticsService';
import { useAuth } from '@/context/AuthContext';

export function useUserStats() {
    const { firebaseUser } = useAuth();
    return useQuery({
        queryKey: analyticsKeys.userStats(firebaseUser?.uid ?? ''),
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return fetchUserStats(token);
        },
        enabled: !!firebaseUser,
    });
}
