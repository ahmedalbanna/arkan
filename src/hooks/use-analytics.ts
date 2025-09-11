
'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { analyticsKeys, adminKeys } from '@/lib/query-keys';
import { fetchUserStats, type UserDashboardStats, fetchDashboardStats, type DashboardStats } from '@/services';
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

export function useAdminDashboard() {
    const { firebaseUser } = useAuth();

    return useQuery<DashboardStats>({
        queryKey: adminKeys.dashboardStats(),
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return fetchDashboardStats(token);
        },
        enabled: !!firebaseUser,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}
