'use client';

import { useQuery } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/container';
import { AnalyticsApiClient, UserDashboardStats } from '@/modules/admin/adapters/api-client/AnalyticsApiClient';
import { useAuth } from '@/context/AuthContext';

export function useUserAnalytics() {
  const { firebaseUser } = useAuth();

  return useQuery<UserDashboardStats, Error>({
    queryKey: ['user-analytics', firebaseUser?.uid],
    queryFn: async () => {
      if (!firebaseUser) throw new Error('User not authenticated');
      const client = container.resolve(AnalyticsApiClient);
      const result = await client.fetchUserStats();
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    enabled: !!firebaseUser,
  });
}

export function useUserStats() {
    return useUserAnalytics();
}
