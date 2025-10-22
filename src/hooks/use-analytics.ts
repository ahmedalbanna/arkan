
'use client';

import { useAuth } from '@/context/AuthContext';
import { handleErrorUtility } from '@/lib/errorUtils';
import { analyticsKeys } from '@/lib/query-keys';
import { fetchUserStatsApi, type UserDashboardStats } from '@/services/analytics-service';
import { useQuery } from '@tanstack/react-query';

/**
 * Fetches the dashboard statistics for the currently authenticated user.
 */
export function useUserStats() {
    const { firebaseUser } = useAuth();
    const userId = firebaseUser?.uid;

    return useQuery<UserDashboardStats, Error>({
        // The query key is dependent on the user ID to ensure data is refetched for different users.
        queryKey: analyticsKeys.userStats(userId!),

        // The query function now directly uses the simplified and secure API service function.
        queryFn: fetchUserStatsApi,

        // The query will only execute if a user is logged in.
        enabled: !!userId,

        // Data is considered fresh for 5 minutes, reducing unnecessary refetches.
        staleTime: 1000 * 60 * 5,

        // Centralized error handling for the query.
        meta: {
            onError: (error: Error) =>
                handleErrorUtility(error, "Failed to load your analytics data"),
        },
    });
}
