'use client';

import { useQuery } from '@tanstack/react-query';
import { adminKeys } from '@/lib/query-keys';
import { AdminApiClient } from '@/modules/admin/adapters/api-client/AdminApiClient';
import { useAuth } from '@/context/AuthContext';
import { runAuthenticatedResultCall } from '../data/authenticated-client-call';

export function useAdminDashboard() {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: adminKeys.dashboardStats(),
    queryFn: async () =>
      runAuthenticatedResultCall(firebaseUser, AdminApiClient, (client, token) =>
        client.fetchDashboardStats(token),
      ),
    enabled: Boolean(firebaseUser),
  });
}
