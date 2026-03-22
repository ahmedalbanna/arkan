'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsKeys } from '@/lib/query-keys';
import { AnalyticsApiClient } from '@/modules/admin/adapters/api-client/AnalyticsApiClient';
import { useAuth } from '@/context/AuthContext';
import { runAuthenticatedResultCall } from './authenticated-client-call';

export function useUserStats() {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: analyticsKeys.userStats(firebaseUser?.uid ?? ''),
    queryFn: async () =>
      runAuthenticatedResultCall(firebaseUser, AnalyticsApiClient, (client, token) => client.fetchUserStats(token)),
    enabled: Boolean(firebaseUser),
  });
}
