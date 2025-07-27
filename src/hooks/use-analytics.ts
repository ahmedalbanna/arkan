
'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { analyticsKeys } from '@/lib/query-keys';
import { fetchUserStats, type UserDashboardStats } from '@/services/analytics-service';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';

export function useUserStats() {
  const { firebaseUser } = useAuth();
  const userId = firebaseUser?.uid;

  return useQuery<UserDashboardStats>({
    queryKey: analyticsKeys.userStats(userId!),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      return fetchUserStats(token);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: Error) =>
        handleErrorUtility(error, "Failed to load your analytics data"),
    },
  });
}
