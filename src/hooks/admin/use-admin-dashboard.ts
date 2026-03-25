'use client';

import { useQuery } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/container';
import { AdminApiClient, DashboardStats } from '@/modules/admin/adapters/api-client/AdminApiClient';
import { useAuth } from '@/context/AuthContext';
import { adminKeys } from '@/lib/query-keys';

export function useAdminDashboard() {
  const { firebaseUser } = useAuth();

  return useQuery<DashboardStats, Error>({
    queryKey: adminKeys.dashboardStats(),
    queryFn: async () => {
      if (!firebaseUser) throw new Error('User not authenticated');
      const client = container.resolve(AdminApiClient);
      const result = await client.fetchDashboardStats();
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    enabled: !!firebaseUser,
  });
}
