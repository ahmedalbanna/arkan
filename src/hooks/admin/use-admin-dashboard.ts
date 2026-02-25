
'use client';

import { useQuery } from '@tanstack/react-query';
import { adminKeys } from '@/lib/query-keys';
import { fetchDashboardStats } from '@/modules/admin/adapters/api-client/AdminApiClient';
import { useAuth } from '@/context/AuthContext';

export function useAdminDashboard() {
    const { firebaseUser } = useAuth();
    return useQuery({
        queryKey: adminKeys.dashboardStats(),
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return fetchDashboardStats(token);
        },
        enabled: !!firebaseUser,
    });
}
