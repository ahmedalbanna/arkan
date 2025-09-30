
'use client';

import { useAuth } from '@/context/AuthContext';
import { adminKeys } from '@/lib/core/query-keys';
import { fetchDashboardStats, type DashboardStats } from '@/services';
import { useQuery } from '@tanstack/react-query';

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
