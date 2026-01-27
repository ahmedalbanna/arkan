'use client';
import { getFirebaseAuthToken } from '@/lib/utils/authUtils';
import { useAuth } from '@/context/AuthContext';
import { analyticsKeys } from '@/lib/query-keys';
import { fetchUserStats } from '@/services/api/analyticsService';
import { useQuery } from '@tanstack/react-query';

export function useUserStats() {
    const { firebaseUser } = useAuth();
    return useQuery({
        queryKey: analyticsKeys.userStats(firebaseUser?.uid ?? ''),
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await getFirebaseAuthToken();
            return fetchUserStats(token);
        },
        enabled: !!firebaseUser,
    });
}
