
'use client';

import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { handleErrorUtility } from '@/lib/errorUtils';
import { analyticsKeys } from '@/lib/query-keys';
import { fetchUserStats, type UserDashboardStats } from '@/services';
import { useQuery } from '@tanstack/react-query';

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
